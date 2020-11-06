import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from 'mongoose';
import { CreateUserDto } from "./dto/create-user.dto";
import { User } from './models/user.model';

@Injectable()
export class UserService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>
      ) { }
    
    async getUserById(_id: Types.ObjectId): Promise<User | undefined> {
      return await this.userModel.findById(_id).exec();
    }
}
