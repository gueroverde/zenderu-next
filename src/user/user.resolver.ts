import { UsePipes, ValidationPipe } from "@nestjs/common";
import { InternalServerErrorException } from "@nestjs/common/exceptions";
import { Args,  Mutation,  Query, Resolver } from "@nestjs/graphql";
import { Types } from "mongoose";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserService } from './user.service';
import { Logger } from '../logger/logger.service';


@Resolver('User')
export class UserResolver {

  constructor(
    private readonly userService: UserService,
    private logger: Logger,
    ){
      this.logger.setContextNest('UserResolver');
    }
    
  @Query('getUserById')
  async findOneById(@Args('_id') _id: Types.ObjectId) {
    try {
      return await this.userService.getUserById(_id);
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
