import { IsEmail, IsNotEmpty, IsString, Length, MaxLength, MinLength } from "class-validator";

export class AuthDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3, {
    message: 'Login is too short',
  })
  @MaxLength(10, {
    message: 'Login is too long',
  })
  login: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, {
    message: 'Password is too short',
  })
  @MaxLength(20, {
    message: 'Password is too long',
  })
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
