import { IsNotEmpty, IsUUID } from 'class-validator';

export class RefreshAccessTokenDto {
  
  //Refresh Token
  @IsNotEmpty()
  @IsUUID()
  readonly refreshToken: string;
}
