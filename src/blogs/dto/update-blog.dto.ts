import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';
import { CreateBlogsDto } from './create-blogs.dto';

export class UpdateBlogDto extends CreateBlogsDto {}
