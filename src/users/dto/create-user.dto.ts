import { IsEmail, IsNotEmpty, IsString, Length, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
	@IsString()
	id: string;

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
	@IsEmail()
	email: string;
}
