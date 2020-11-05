import { Field, ObjectType, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
@ObjectType()
@Schema({versionKey: false, timestamps: true})
export class Notification extends Document {
  @Field(() => ID)
  @Prop({ default: Types.ObjectId })
  _id: Types.ObjectId;

  @Field(() => ID)
  @Prop({ type: Types.ObjectId, required: true, ref: 'User', autopopulate: true })
  user: Types.ObjectId;

  @Field()
  @Prop({ required: true })
  title: string;

  @Field()
  @Prop({ required: true })
  description: string;

  @Field()
  @Prop({ required: true })
  link: string;

  @Field()
  @Prop({ default: false })
  readed: boolean;
  
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);