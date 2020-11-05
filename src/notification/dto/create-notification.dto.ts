import { IsNotEmpty, MinLength, MaxLength, IsString, IsUrl } from 'class-validator';
import { Types } from 'mongoose'
export class CreateNotificationDto {

  // userId
  @IsNotEmpty()
  user: Types.ObjectId;

  // title
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  readonly title: string;

  // description
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  readonly description: string;

  // link
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  @MinLength(5)
  @MaxLength(255)
  readonly link: string;
}
