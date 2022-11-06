import { IsString } from 'class-validator';

export class EmailResendingDto {
  @IsString()
  email: string;
}
