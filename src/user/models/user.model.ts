import { Field, ObjectType, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import validator from 'validator';
import * as bcrypt from 'bcrypt';
import { UserRoles } from './user.roles'

@ObjectType()
@Schema({versionKey: false, timestamps: true})
export class User extends Document {
  @Field(() => ID)
  @Prop({ default: Types.ObjectId })
  _id: Types.ObjectId;

  @Field()
  @Prop({ required: true })
  fullName: string;

  @Field()
  @Prop({ default: false })
  online: boolean;

  @Field()
  @Prop({ required: true, lowercase: true, minlength: 6, maxlength: 255, validate: validator.isEmail })
  email: string;

  @Field()
  @Prop({ required: true, minlength: 5, maxlength: 255 })
  password: string;

  @Field(() => Types.Array)
  @Prop({ default: [UserRoles.CLIENT] })
  roles: UserRoles[];

  @Field()
  @Prop({ validate: validator.isUUID })
  verification: string;

  @Field()
  @Prop({ default: Date.now })
  verificationExpires: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function(next: mongoose.HookNextFunction) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    // tslint:disable-next-line:no-string-literal
    const hashed = await bcrypt.hash(this['password'], 10);
    // tslint:disable-next-line:no-string-literal
    this['password'] = hashed;
    return next();
  } catch (err) {
    return next(err);
  }
});