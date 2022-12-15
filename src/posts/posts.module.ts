import { forwardRef, Inject, Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from '../configs/jwt.config';
import { Posts, PostsSchema } from './schemas/posts.schemas';
import { PostsRepository } from './posts.repository';
import { BlogsModule } from '../blogs/blogs.module';
import { CommentsModule } from '../comments/comments.module';
import { UsersModule } from '../users/users.module';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '../auth/auth.module';
import { LikesModule } from '../likes/likes.module';
import { BlogIdValidation } from '../validation/blog-id.validation';
import { ValidationModule } from '../validation/validation.module';

@Module({
	imports: [
		forwardRef(() => BlogsModule),
		forwardRef(() => CommentsModule),
		AuthModule,
		UsersModule,
		LikesModule,
		ConfigModule,
		MongooseModule.forFeature([{ name: Posts.name, schema: PostsSchema }]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getJwtConfig,
		}),
	],
	controllers: [PostsController],
	providers: [PostsService, PostsRepository],
	exports: [PostsService],
})
export class PostsModule {}
