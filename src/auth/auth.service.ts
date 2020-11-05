import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { addHours } from 'date-fns';
import { sign } from 'jsonwebtoken';
import { v4 } from 'uuid';
import { Request } from 'express';
import { getClientIp } from 'request-ip';
import * as Cryptr from 'cryptr';
import * as bcrypt from 'bcrypt';
//Interfaces
import { ForgotPassword } from './models/forgot-password.model';
import { RefreshToken } from './models/refresh-token.model';
import { User } from 'src/user/models/user.model';
//DTO's
import { RefreshAccessTokenDto } from './dto/refresh-access-token.dto';
import { CreateForgotPasswordDto } from './dto/create-forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { VerifyUuidDto } from './dto/verify-uuid.dto';
//Services
import { MailsService } from 'src/mails/mails.service'

@Injectable()
export class AuthService {
  HOURS_TO_VERIFY = parseInt(process.env.HOURS_TO_VERIFY) || 4;
  HOURS_TO_BLOCK = parseInt(process.env.HOURS_TO_BLOCK) || 6;
  LOGIN_ATTEMPTS_TO_BLOCK = parseInt(process.env.LOGIN_ATTEMPTS_TO_BLOCK) || 5;

  cryptr: any;

  constructor(
    @InjectModel('ForgotPassword') private readonly forgotPasswordModel: Model<ForgotPassword>,
    @InjectModel('RefreshToken') private readonly refreshTokenModel: Model<RefreshToken>,
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly mailsService: MailsService,
  ) {
    this.cryptr = new Cryptr(process.env.ENCRYPT_JWT_SECRET);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new this.userModel(createUserDto);
    await this.isEmailUnique(user.email);
    this.setRegistrationInfo(user);
    await this.sendVerificationEmail(user);
    await user.save();
    return this.buildRegistrationInfo(user);
  }

  async login(req: Request, loginUserDto: LoginUserDto) {
    const user = await this.findUserByEmail(loginUserDto.email);
    this.isUserBlocked(user);
    await this.checkPassword(loginUserDto.password, user);
    await this.passwordsAreMatch(user);
    return {
      fullName: user.fullName,
      email: user.email,
      accessToken: await this.createAccessToken(user._id),
      refreshToken: await this.createRefreshToken(req, user._id),
    };
  }

  async verifyEmail(req: Request, verifyUuidDto: VerifyUuidDto) {
    const user = await this.findByVerification(verifyUuidDto.verification);
    await this.setUserAsVerified(user);
    return {
      fullName: user.fullName,
      email: user.email,
      accessToken: await this.createAccessToken(user._id),
      refreshToken: await this.createRefreshToken(req, user._id),
    };
  }

  async refreshAccessToken(refreshAccessTokenDto: RefreshAccessTokenDto) {
    const userId = await this.findRefreshToken(refreshAccessTokenDto.refreshToken);
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('Bad request');
    }
    return {
      accessToken: await this.createAccessToken(user._id),
    };
  }

  async forgotPassword(req: Request, createForgotPasswordDto: CreateForgotPasswordDto) {
    await this.findByEmail(createForgotPasswordDto.email);
    await this.saveForgotPassword(req, createForgotPasswordDto);
    return {
      email: createForgotPasswordDto.email,
      message: 'Verification sent.',
    };
  }

  async forgotPasswordVerify(req: Request, verifyUuidDto: VerifyUuidDto) {
    const forgotPassword = await this.findForgotPasswordByUuid(verifyUuidDto);
    await this.setForgotPasswordFirstUsed(req, forgotPassword);
    return {
      email: forgotPassword.email,
      message: 'Now reset your password.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const forgotPassword = await this.findForgotPasswordByEmail(resetPasswordDto);
    await this.setForgotPasswordFinalUsed(forgotPassword);
    await this.resetUserPassword(resetPasswordDto);
    return {
      email: resetPasswordDto.email,
      message: 'Password successfully changed.',
    };
  }

  async createAccessToken(userId: Types.ObjectId) {
    const accessToken = sign({userId}, process.env.JWT_SECRET , { expiresIn: process.env.JWT_EXPIRATION });
    return this.encryptText(accessToken);
  }

  async createRefreshToken(req: Request, _userId: Types.ObjectId) {
    const refreshToken = new this.refreshTokenModel({
      _userId,
      refreshToken: v4(),
      ip: this.getIp(req),
      browser: this.getBrowserInfo(req),
      country: this.getCountry(req),
    });
    await refreshToken.save();
    return refreshToken.refreshToken;
  }

  async findRefreshToken(token: string) {
    const refreshToken = await this.refreshTokenModel.findOne({refreshToken: token});
    if (!refreshToken) {
      throw new UnauthorizedException('User has been logged out.');
    }
    return refreshToken._userId;
  }

  async validateUser(jwtPayload: JwtPayload): Promise<any> {
    const _id = new Types.ObjectId(jwtPayload.userId);
    const user = await this.userModel.findOne({_id, verified: true})
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    return user;
  }


  //   ┬┬ ┬┌┬┐  ┌─┐─┐ ┬┌┬┐┬─┐┌─┐┌─┐┌┬┐┌─┐┬─┐
  //   ││││ │   ├┤ ┌┴┬┘ │ ├┬┘├─┤│   │ │ │├┬┘
  //  └┘└┴┘ ┴   └─┘┴ └─ ┴ ┴└─┴ ┴└─┘ ┴ └─┘┴└─
  private jwtExtractor(request) {
    let type, token = null;
    if (request.headers.authorization) {
      [type, token] = request.headers.authorization.split(' ');
      if (type !== 'Bearer') {
        throw new BadRequestException(`Authentication type \'Bearer\' required. Found \'${type}\'`);
      }
    } else {
      throw new BadRequestException('Authorization header not found.');
    }
    const cryptr = new Cryptr(process.env.ENCRYPT_JWT_SECRET);
    if (token) {
      try {
        token = cryptr.decrypt(token);
      } catch (err) {
        throw new UnauthorizedException('Token not valid.');
      }
  }
    return token;
}

  // ***********************
  // ╔╦╗╔═╗╔╦╗╦ ╦╔═╗╔╦╗╔═╗
  // ║║║║╣  ║ ╠═╣║ ║ ║║╚═╗
  // ╩ ╩╚═╝ ╩ ╩ ╩╚═╝═╩╝╚═╝
  // ***********************
  returnJwtExtractor() {
    return this.jwtExtractor;
  }

  getIp(req: Request): string {
    return getClientIp(req);
  }

  getBrowserInfo(req: Request): string {
    return req.header['user-agent'] || 'XX';
  }

  getCountry(req: Request): string {
    return req.header['cf-ipcountry'] ? req.header['cf-ipcountry'] : 'XX';
  }

  encryptText(text: string): string {
    return this.cryptr.encrypt(text);
  }

   // ********************************************
  // ╔═╗╦═╗╦╦  ╦╔═╗╔╦╗╔═╗  ╔╦╗╔═╗╔╦╗╦ ╦╔═╗╔╦╗╔═╗
  // ╠═╝╠╦╝║╚╗╔╝╠═╣ ║ ║╣   ║║║║╣  ║ ╠═╣║ ║ ║║╚═╗
  // ╩  ╩╚═╩ ╚╝ ╩ ╩ ╩ ╚═╝  ╩ ╩╚═╝ ╩ ╩ ╩╚═╝═╩╝╚═╝
  // ********************************************

  private async isEmailUnique(email: string) {
    const user = await this.userModel.findOne({ email, verified: true });
    if (user) {
      throw new BadRequestException('Email must be unique.');
    }
  }

  private setRegistrationInfo(user): any {
    user.verification = v4();
    user.verificationExpires = addHours(new Date(), this.HOURS_TO_VERIFY);
  }

  private buildRegistrationInfo(user): any {
    const userRegistrationInfo = {
      fullName: user.fullName,
      email: user.email,
      verified: user.verified,
    };
    return userRegistrationInfo;
  }

  private async sendVerificationEmail(user: User) {
    try {
      await this.mailsService.sendVerifyMail(user.email, user.verification);
    } catch (error) {
      throw new ConflictException('Could not send verification email, try later.');
    }
  }

  private async findByVerification(verification: string): Promise<User> {
    const user = await this.userModel.findOne({ verification, verified: false, verificationExpires: { $gt: new Date() } });
    if (!user) {
      throw new BadRequestException('Bad request.');
    }
    return user;
  }

  private async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email, verified: true });
    if (!user) {
      throw new NotFoundException('Email not found.');
    }
    return user;
  }

  private async setUserAsVerified(user) {
    user.verified = true;
    await user.save();
  }

  private async findUserByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email, verified: true });
    if (!user) {
      throw new NotFoundException('Wrong email or password.');
    }
    return user;
  }

  private async checkPassword(attemptPass: string, user) {
    const match = await bcrypt.compare(attemptPass, user.password);
    if (!match) {
      await this.passwordsDoNotMatch(user);
      throw new NotFoundException('Wrong email or password.');
    }
    return match;
  }

  private isUserBlocked(user) {
    if (user.blockExpires > Date.now()) {
      throw new ConflictException('User has been blocked try later.');
    }
  }

  private async passwordsDoNotMatch(user) {
    user.loginAttempts += 1;
    await user.save();
    if (user.loginAttempts >= this.LOGIN_ATTEMPTS_TO_BLOCK) {
      await this.blockUser(user);
      throw new ConflictException('User blocked.');
    }
  }

  private async blockUser(user) {
    user.blockExpires = addHours(new Date(), this.HOURS_TO_BLOCK);
    await user.save();
  }

  private async passwordsAreMatch(user) {
    user.loginAttempts = 0;
    await user.save();
  }

  private async saveForgotPassword(req: Request, createForgotPasswordDto: CreateForgotPasswordDto) {
    const forgotPassword = await this.forgotPasswordModel.create({
      email: createForgotPasswordDto.email,
      verification: v4(),
      expires: addHours(new Date(), this.HOURS_TO_VERIFY),
      ipRequest: this.getIp(req),
      browserRequest: this.getBrowserInfo(req),
      countryRequest: this.getCountry(req)
    });
    await forgotPassword.save();
  }


  private async findForgotPasswordByUuid(verifyUuidDto: VerifyUuidDto): Promise<ForgotPassword> {
    const forgotPassword = await this.forgotPasswordModel.findOne({
      verification: verifyUuidDto.verification,
      firstUsed: false,
      finalUsed: false,
      expires: { $gt: new Date() },
    });
    if (!forgotPassword) {
      throw new BadRequestException('Bad request.');
    }
    return forgotPassword;
  }

  private async setForgotPasswordFirstUsed(req: Request, forgotPassword: ForgotPassword) {
    forgotPassword.firstUsed = true;
    forgotPassword.ipChanged = this.getIp(req);
    forgotPassword.browserChanged = this.getBrowserInfo(req);
    forgotPassword.countryChanged = this.getCountry(req);
    await forgotPassword.save();
  }

  private async findForgotPasswordByEmail(resetPasswordDto: ResetPasswordDto): Promise<ForgotPassword> {
    const forgotPassword = await this.forgotPasswordModel.findOne({
      email: resetPasswordDto.email,
      firstUsed: true,
      finalUsed: false,
      expires: { $gt: new Date() },
    });
    if (!forgotPassword) {
      throw new BadRequestException('Bad request.');
    }
    return forgotPassword;
  }

  private async setForgotPasswordFinalUsed(forgotPassword: ForgotPassword) {
    forgotPassword.finalUsed = true;
    await forgotPassword.save();
  }

  private async resetUserPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.userModel.findOne({
      email: resetPasswordDto.email,
      verified: true,
    });
    user.password = resetPasswordDto.password;
    await user.save();
  }
}
