import { IsNotEmpty, MinLength, MaxLength, IsEmail, IsString, Matches } from 'class-validator';
import { IsEqualTo } from '../decorators/is-equal-to.decorator';

export class CreateUserDto {

  // FullName
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  readonly fullName: string;

  // Email
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  @IsEmail()
  readonly email: string;

  // Password
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(30)
  @Matches(/[A-Z]+/, { message: 'password must have at least one uppercase' })
  @Matches(/[a-z]+/, { message: 'password must have at least one lowercase' })
  @Matches(/[0-9]+/, { message: 'password must have at least one number' })
  @Matches(/[!@#$^%&]+/, {
    message: "password must have at least one symbol: '!@#$%^&'.",
  })
  readonly password: string;

  // Password Confirmation
  @IsEqualTo('password')
  readonly passwordConfirm: string;
}
