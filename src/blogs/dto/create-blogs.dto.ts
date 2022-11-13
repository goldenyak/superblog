import { IsNotEmpty, IsString, IsUrl, Length, MaxLength } from "class-validator";

export class CreateBlogsDto {
	@IsNotEmpty()
	@IsString()
	@Length(0, 15)
	name: string;

	@IsNotEmpty()
	@IsString()
	@Length(0, 100)
	@IsUrl()
	youtubeUrl: string;
}
