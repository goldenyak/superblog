import { IsString } from 'class-validator';

export class FindUserByCodeDto {
	@IsString()
	code: string;
}
