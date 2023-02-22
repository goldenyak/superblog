import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersRepository } from './users.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { SuperAdminController } from '../../super-admin/api/users/super-admin.controller';
import { SessionsModule } from '../sessions/sessions.module';
import { LikesModule } from '../likes/likes.module';
import { GetAllBlogsUseCase } from '../blogs/use-cases/get-all-blogs.use-case';
import { FindUserByIdUseCase } from './use-cases/find-user-by-id.use-case';
import { CqrsModule } from "@nestjs/cqrs";
import { BlogsModule } from "../blogs/blogs.module";

const useCases = [FindUserByIdUseCase, GetAllBlogsUseCase];

@Module({
	imports: [
		CqrsModule,
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
		forwardRef(() => SessionsModule),
		forwardRef(() => LikesModule),
		ConfigModule,
	],
	controllers: [UsersController, SuperAdminController],
	providers: [UsersService, UsersRepository, JwtService, ...useCases],
	exports: [UsersService, UsersRepository],
})
export class UsersModule {}
