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
import { BlogsModule } from '../blogs/blogs.module';
import { LikesModule } from '../likes/likes.module';
import { LikesService } from '../likes/likes.service';
import { LikesRepository } from '../likes/likes.repository';
import { CreateBlogUseCase } from '../blogs/use-cases/create-blog.use-case';
import { GetAllBlogsUseCase } from '../blogs/use-cases/get-all-blogs.use-case';
import { GetAllBlogsForCurrentUserUseCase } from '../../blogger/use-cases/get-all-blogs-for-current-user.use-case';
import { CreatePostByBlogIdUseCase } from '../blogs/use-cases/create-post-by-blog-id.use-case';
import { GetAllPostByBlogIdUseCase } from '../blogs/use-cases/get-all-posts.use-case';
import { FindPostByIdUseCase } from '../blogs/use-cases/find-post-by-id.use-case';
import { FindUserByIdUseCase } from './use-cases/find-user-by-id.use-case';

const useCases = [FindUserByIdUseCase];

@Module({
	imports: [
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
