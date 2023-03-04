import { forwardRef, Module } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { PublicBlogsController } from './api/blogs.controller';
import { UsersModule } from '../users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from '../../../configs/jwt.config';
import { Blogs, BlogsSchema } from './schemas/blogs.schema';
import { BlogsRepository } from './blogs.repository';
import { PostsModule } from '../posts/posts.module';
import { AuthModule } from '../auth/auth.module';
import { BlogIdValidation } from '../../../validation/blog-id.validation';
import { CreateBlogUseCase } from './use-cases/create-blog.use-case';
import { CreatePostByBlogIdUseCase } from './use-cases/create-post-by-blog-id.use-case';
import { BloggersController } from '../../blogger/api/bloggers.controller';
import { GetAllBlogsForCurrentUserUseCase } from '../../blogger/use-cases/get-all-blogs-for-current-user.use-case';
import { FindPostByIdUseCase } from './use-cases/find-post-by-id.use-case';
import { CqrsModule } from "@nestjs/cqrs";

const useCases = [
	CreateBlogUseCase,
	GetAllBlogsForCurrentUserUseCase,
	CreatePostByBlogIdUseCase,
	FindPostByIdUseCase,
];

@Module({
	imports: [
		CqrsModule,
		forwardRef(() => PostsModule),
		AuthModule,
		UsersModule,
		ConfigModule,
		MongooseModule.forFeature([{ name: Blogs.name, schema: BlogsSchema }]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getJwtConfig,
		}),
	],
	providers: [BlogsService, BlogsRepository, BlogIdValidation, ...useCases],
	controllers: [BloggersController, PublicBlogsController],
	exports: [BlogsService, BlogsRepository, BlogIdValidation],
})
export class BlogsModule {}
