import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';
import { CreatePostsDto } from './create-post.dto';

export class UpdatePostDto extends CreatePostsDto {}
