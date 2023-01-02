import { IsDate, IsNotEmpty, IsString, IsUrl, MaxLength } from "class-validator";

export class CreateSessionDto {
	@IsString()
	ip: string;

	@IsString()
	title: string;

	@IsDate()
	lastActiveDate: Date;

	@IsString()
	deviceId: string;

	@IsString()
	userId: string;
}
