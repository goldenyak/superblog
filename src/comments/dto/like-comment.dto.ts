import { IsNotEmpty, IsString, IsUrl, Length, MaxLength, MinLength } from 'class-validator';

export class LikeCommentDto {
  @IsNotEmpty()
  @IsString()
  likeStatus: 'like' | 'dislike' | 'none';
}