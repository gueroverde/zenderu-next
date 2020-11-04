import { InternalServerErrorException } from "@nestjs/common/exceptions";
import { Args,  Query, Resolver } from "@nestjs/graphql";
import { Types } from "mongoose";
import { User } from "./models/user.model";
import { UserService } from './user.service';


@Resolver(() => User)
export class UserResolver {

  constructor(private readonly userService: UserService){}
    
  @Query('getUserById')
  async findOneById(@Args('_id') _id: Types.ObjectId) {
    try {
      return await this.userService.getUserById(_id);
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

}