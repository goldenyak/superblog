import { IsNotEmpty, IsString, IsUrl, Length, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
	@IsNotEmpty()
	@IsString()
	@Length(20, 300)
	content: string;
}
