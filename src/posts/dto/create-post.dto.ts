import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreatePostsDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(30, {
    message: 'Title is too long',
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100, {
    message: 'shortDescription is too long',
  })
  shortDescription: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000, {
    message: 'Content is too long',
  })
  content: string;

  blogId?: string;
}