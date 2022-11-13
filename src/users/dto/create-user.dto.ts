import {
	IsBoolean,
	IsEmail,
	IsNotEmpty,
	IsString,
	Length,
} from 'class-validator';

export class CreateUserDto {
	// @IsString()
	id: string;

	@IsNotEmpty()
	@IsString()
	@Length(3, 10)
	login: string;

	@IsNotEmpty()
	@IsEmail({unique: true})
	email: string;

	@IsNotEmpty()
	@IsString()
	@Length(6, 20)
	password: string;

	// @IsString()
	confirmationCode: string;

	// @IsBoolean()
	isConfirmed: boolean;
}
