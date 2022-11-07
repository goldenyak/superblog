import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';
import { CreatePostsDto } from './create-post.dto';

export class UpdatePostDto extends CreatePostsDto {
	// @IsNotEmpty()
	// @IsString()
	// @MaxLength(15, {
	//   message: 'Name for blog is too long',
	// })
	// name: string;
	//
	// @IsNotEmpty()
	// @IsString()
	// @MaxLength(100, {
	//   message: 'youtubeUrl is too long',
	// })
	// @IsUrl()
	// youtubeUrl: string;
}
