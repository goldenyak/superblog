import { IsEmail, IsString } from "class-validator";

export class EmailResendingDto {
  @IsString()
  @IsEmail()
  email: string;
}
