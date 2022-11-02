import { Module } from '@nestjs/common';
import { DeleteAllController } from './delete-all.controller';
import { UsersModule } from "../users/users.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [UsersModule, AuthModule],
  controllers: [DeleteAllController],
})
export class DeleteAllModule {}
