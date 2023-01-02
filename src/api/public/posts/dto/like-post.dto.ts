import { IsEnum, IsNotEmpty, IsString } from "class-validator";

enum  LikeStatusEnum {
  Like= 'Like',
  Dislike = 'Dislike',
  None = 'None'
}

export class LikePostDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(LikeStatusEnum)
  likeStatus: string
}