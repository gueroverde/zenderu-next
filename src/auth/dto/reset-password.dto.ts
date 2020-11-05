import { IsNotEmpty, MinLength, MaxLength, IsEmail, IsString } from 'class-validator';

export class ResetPasswordDto {

  //Email
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  @IsEmail()
  readonly email: string;

  //Password
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(30)
  readonly password: string;
}
