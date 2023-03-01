import { IsBoolean, IsNotEmpty, IsString, Length } from "class-validator";

export class UpdateBanBlogDto {
  @IsNotEmpty()
  @IsBoolean()
  isBanned: boolean;
}