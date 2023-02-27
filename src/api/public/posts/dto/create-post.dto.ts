import { IsNotEmpty, IsOptional, IsString, Length, Validate } from "class-validator";
import { Transform } from "class-transformer";
import { BlogIdValidation } from "../../../../validation/blog-id.validation";

export class CreatePostsDto {
	@IsNotEmpty()
	@IsString()
	@Length(1, 30)
	@Transform(({ value }) => value?.trim())
	title: string;

	@IsNotEmpty()
	@IsString()
	@Length(1, 100)
	@Transform(({ value }) => value?.trim())
	shortDescription: string;

	@IsNotEmpty()
	@IsString()
	@Length(1, 1000)
	@Transform(({ value }) => value?.trim())
	content: string;

	@IsString()
	@IsOptional()
	// @Validate(BlogIdValidation)
	blogId: string;
}
