import { Args, Resolver, Mutation, Context } from '@nestjs/graphql';
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
//Guards
import { GqlAuthGuard } from './guards/gql-auth.guard';
//DTO's
import { CreateForgotPasswordDto } from './dto/create-forgot-password.dto'
import { RefreshAccessTokenDto } from './dto/refresh-access-token.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { VerifyUuidDto } from './dto/verify-uuid.dto'
import { LoginUserDto } from './dto/login-user.dto'
//Services
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { Logger } from '../logger/logger.service';

@Resolver('Auth')
export class AuthResolver {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private authService: AuthService,
  ) {
    this.logger.setContextNest('AuthResolver');
  }

  @Mutation()
  @UsePipes(new ValidationPipe())
  async login(@Context() ctx, @Args('payload') loginUserDto: LoginUserDto) {
    this.logger.log(`Logging in user: ${loginUserDto.email}`);
    return await this.authService.login(ctx.req, loginUserDto);
  }

  @Mutation()
  @UsePipes(new ValidationPipe())
  async register(@Args('payload') createUserDto: CreateUserDto) {
    this.logger.log(`Registering user: ${createUserDto.email}`);
    return this.authService.create(createUserDto);
  }

  @Mutation()
  @UsePipes(new ValidationPipe())
  async verifyEmail(@Context() ctx, @Args('payload') verifyUuidDto: VerifyUuidDto) {
    this.logger.log(`Verifying email: ${verifyUuidDto.verification}`);
    return await this.authService.verifyEmail(ctx.req, verifyUuidDto);
  }

  @Mutation()
  @UsePipes(new ValidationPipe())
  async refreshAccessToken(@Args('payload') refreshAccessTokenDto: RefreshAccessTokenDto) {
    this.logger.log(`Refreshing access token: ${refreshAccessTokenDto.refreshToken}`);
    return await this.authService.refreshAccessToken(refreshAccessTokenDto);
  }


  @Mutation()
  @UsePipes(new ValidationPipe())
  async forgotPassword(@Context() ctx, @Args('payload') createForgotPasswordDto: CreateForgotPasswordDto) {
    this.logger.log(`Creating forgotPassword: ${createForgotPasswordDto.email}`);
    return await this.authService.forgotPassword(ctx.req, createForgotPasswordDto);
  }

  @Mutation()
  @UsePipes(new ValidationPipe())
  async forgotPasswordVerify(@Context() ctx, @Args('payload') verifyUuidDto: VerifyUuidDto) {
    this.logger.log(`Verifying forgotPassword: ${verifyUuidDto.verification}`);
    return await this.authService.forgotPasswordVerify(ctx.req, verifyUuidDto);
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  @UsePipes(new ValidationPipe())
  async resetPassword(@Args('payload') resetPasswordDto: ResetPasswordDto) {
    this.logger.log(`Resetting password: ${resetPasswordDto.email}`);
    return await this.authService.resetPassword(resetPasswordDto);
  }

}
