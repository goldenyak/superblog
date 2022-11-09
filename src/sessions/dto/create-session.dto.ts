import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateSessionDto {
	@IsString()
	ip: string;

	@IsString()
	title: string;

	@IsString()
	lastActiveDate: Date;

	@IsString()
	deviceId: string;

	@IsString()
	tokenExpiredDate: string;

	@IsString()
	userId: string;
}
