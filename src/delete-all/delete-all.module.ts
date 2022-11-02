import { Module } from '@nestjs/common';
import { DeleteAllController } from './delete-all.controller';
import { UsersModule } from "../users/users.module";

@Module({
  imports: [UsersModule],
  controllers: [DeleteAllController],
})
export class DeleteAllModule {}
