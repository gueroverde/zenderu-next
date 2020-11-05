import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
//Dto
import { CreateNotificationDto } from './dto/create-notification.dto'
//Interfaces
import { Notification } from './models/notification.model';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('Notification') private readonly notificationModel: Model<Notification>
  ) { }

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = new this.notificationModel(createNotificationDto)
    notification.user = new Types.ObjectId(notification.user)
    return await notification.save();
  }

  async findOne(email: string): Promise<Notification | undefined> {
    return await this.notificationModel.findOne({ email }).exec();
  }

  async findById(_id: Types.ObjectId): Promise<Notification | undefined> {
    return await this.notificationModel.findById(_id).exec();
  }

  async findAll(user: Types.ObjectId): Promise<Notification[]> {
    return await this.notificationModel.find({user, readed: false}).exec();
  }

  async countAll(user: Types.ObjectId): Promise<number> {
    return await this.notificationModel.find({user, readed: false}).countDocuments();
  }
  
  async delete(notificationId: string) {
    return await this.notificationModel.deleteOne({ _id: notificationId }).exec();
  }

}
