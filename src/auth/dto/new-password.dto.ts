import { IsNotEmpty, IsString, Length } from "class-validator";

export class NewPasswordDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 20)
  newPassword: string;

  @IsString()
  recoveryCode: string;
}