import { Field, ObjectType, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import validator from 'validator';

@ObjectType()
@Schema({versionKey: false, timestamps: true})
export class User extends Document {
  @Field(() => ID)
  @Prop({ default: Types.ObjectId })
  _id: Types.ObjectId;

  @Field()
  @Prop({ required: true })
  name: string;

  @Field()
  @Prop({ required: true, lowercase: true, minlength: 6, maxlength: 255, validate: validator.isEmail })
  email: string;
}

export const ExpertSchema = SchemaFactory.createForClass(User);
