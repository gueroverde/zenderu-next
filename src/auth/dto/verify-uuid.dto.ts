import { IsNotEmpty, IsUUID } from 'class-validator';

export class VerifyUuidDto {

  // UUID
  @IsNotEmpty()
  @IsUUID()
  readonly verification: string;
}
