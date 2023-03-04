import { IsBoolean, IsNotEmpty, IsString, Length } from "class-validator";

export enum  BanStatusEnum {
  all = 'all',
  notBanned = 'notBanned',
  banned = 'banned'
}

export class UpdateBanUserForBlogDto {
  @IsNotEmpty()
  @IsBoolean()
  isBanned: boolean;

  @IsNotEmpty()
  @IsString()
  @Length(20)
  banReason: string;

  @IsNotEmpty()
  @IsString()
  blogId: string;

}