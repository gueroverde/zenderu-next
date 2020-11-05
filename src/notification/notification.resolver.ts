import { Resolver, Query, Args, Mutation, Subscription, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards, InternalServerErrorException, UsePipes, ValidationPipe } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions'
import { Types } from 'mongoose'
//Decorators
import { Roles } from './../auth/decorators/roles.decorator';
//Dto
import { CreateNotificationDto } from './dto/create-notification.dto'
//Guards
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
//Interfaces
import { Notification } from './models/notification.model';
import { User } from 'src/user/models/user.model';
//Services
import { Logger } from '../logger/logger.service';
import { NotificationService } from './notification.service';
import { UserService } from 'src/user/user.service';

//PubSub
const pubSub = new PubSub();

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService, 
    private readonly userService: UserService,
    private logger: Logger) { }

  // @ResolveField()
  // async user(@Parent() notification: Notification): Promise<User> {
  //   return this.userService.findById(notification.user);
  // }

  @Subscription(() => Notification, {
    filter: (payload, variables) => payload.notificationAdded.user.equals(variables.user)})
  notificationAdded() {
    this.logger.log(`Subscribing to notifications of user`);
    return pubSub.asyncIterator('notificationAdded');
  }


  @Query('getNotificationById')
  @UseGuards(GqlAuthGuard)
  async findOneById(@Args('_id') _id: Types.ObjectId) {
    try {
      this.logger.log(`Get notification by id`);
      return await this.notificationService.findById(_id);
    } catch (e) {
      this.logger.error(`Error getting notification`, e);
      throw new InternalServerErrorException();
    }
  }

  @Mutation()
  @UsePipes(new ValidationPipe())
  async createNotification(@Args('payload') createNotificationDto: CreateNotificationDto) {
    this.logger.log(`Creating Notification`);
    const newNotification = await this.notificationService.create(createNotificationDto);
    pubSub.publish('notificationAdded', { notificationAdded: newNotification });
    return newNotification;
  }

}
