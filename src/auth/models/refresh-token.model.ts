import { Field, ObjectType, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@ObjectType()
@Schema({versionKey: false, timestamps: true})
export class RefreshToken extends Document {
  @Field(() => ID)
  @Prop({ default: Types.ObjectId })
  _id: Types.ObjectId;

  @Field(() => ID)
  @Prop({ type: Types.ObjectId, required: true })
  _userId: Types.ObjectId;

  @Field()
  @Prop({ required: true })
  refreshToken: string;

  @Field()
  @Prop({ required: true })
  ip: string;

  @Field()
  @Prop({ required: true })
  browser: string;

  @Field()
  @Prop({ required: true })
  country: string;
  
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);