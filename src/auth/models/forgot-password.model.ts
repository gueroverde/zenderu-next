import { Field, ObjectType, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import validator from 'validator';
import { Document, Types } from 'mongoose';

@ObjectType()
@Schema({versionKey: false, timestamps: true})
export class ForgotPassword extends Document {
  @Field(() => ID)
  @Prop({ default: Types.ObjectId })
  _id: Types.ObjectId;

  @Field()
  @Prop({ required: true, validate: validator.isEmail})
  email: string;

  @Field()
  @Prop({ required: true, validate: validator.isUUID })
  verification: string;

  @Field()
  @Prop({ required: true })
  ipRequest: string;

  @Field()
  @Prop({ default: false })
  firstUsed?: boolean;

  @Field()
  @Prop({ default: false })
  finalUsed?: boolean;

  @Field()
  @Prop({ required: true })
  expires: Date;

  @Field()
  @Prop({ required: true })
  browserRequest: string;

  @Field()
  @Prop({ required: true })
  countryRequest: string;

  @Field()
  @Prop()
  ipChanged?: string;

  @Field()
  @Prop()
  browserChanged?: string;

  @Field()
  @Prop()
  countryChanged?: string;
  
}

export const ForgotPasswordSchema = SchemaFactory.createForClass(ForgotPassword);