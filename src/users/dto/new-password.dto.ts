import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class NewPasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(6, {
    message: 'Password is too short',
  })
  @MaxLength(20, {
    message: 'Password is too long',
  })
  newPassword: string;

  @IsString()
  recoveryCode: string;
}