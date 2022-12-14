import { IsNotEmpty, IsString, IsUrl, Length, MaxLength } from "class-validator";
import { Transform } from "class-transformer";

export class CreateBlogsDto {
	@IsNotEmpty()
	@IsString()
	@Length(1, 15)
	@Transform(({ value }) => value?.trim())
	name: string;

	@IsString()
	@Length(1, 500)
	@Transform(({ value }) => value?.trim())
	description: string

	@IsNotEmpty()
	@IsString()
	@Length(1, 100)
	@Transform(({ value }) => value?.trim())
	@IsUrl()
	websiteUrl: string;
}
