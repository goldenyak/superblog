import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schemas/user.schema";
import { UsersRepository } from "./users.repository";
import { JwtService } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { SuperAdminController } from "../../super-admin/api/users/super-admin.controller";

@Module({
  imports: [
    MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
    ConfigModule
  ],
  controllers: [UsersController, SuperAdminController],
  providers: [UsersService, UsersRepository, JwtService],
  exports: [UsersService, UsersRepository]
})
export class UsersModule {}
