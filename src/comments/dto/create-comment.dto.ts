import { IsNotEmpty, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
	@IsNotEmpty()
	@IsString()
	@MinLength(20, {
		message: 'Content is too long',
	})
	@MaxLength(300, {
		message: 'Content is too long',
	})
	content: string;
}
