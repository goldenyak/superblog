import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreatePostsDto {
	@IsNotEmpty()
	@IsString()
	@Length(0, 30)
	title: string;

	@IsNotEmpty()
	@IsString()
	@Length(0, 100)
	shortDescription: string;

	@IsNotEmpty()
	@IsString()
	@Length(0, 1000)
	content: string;

	@IsString()
	@IsOptional()
	blogId: string;
}
