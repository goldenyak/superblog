import { forwardRef, Module } from "@nestjs/common";
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schemas/user.schema";
import { UsersRepository } from "./users.repository";
import { JwtService } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { SuperAdminController } from "../../super-admin/api/users/super-admin.controller";
import { SessionsModule } from "../sessions/sessions.module";
import { BlogsModule } from "../blogs/blogs.module";

@Module({
  imports: [
    MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
    forwardRef(() => SessionsModule),
    ConfigModule,
  ],
  controllers: [UsersController, SuperAdminController],
  providers: [UsersService, UsersRepository, JwtService],
  exports: [UsersService, UsersRepository]
})
export class UsersModule {}
