import { forwardRef, Module } from "@nestjs/common";
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from '../configs/jwt.config';
import { Posts, PostsSchema } from './schemas/posts.schemas';
import { PostsRepository } from './posts.repository';
import { BlogsModule } from '../blogs/blogs.module';
import { CommentsModule } from "../comments/comments.module";
import { UsersModule } from "../users/users.module";

@Module({
	imports: [
		forwardRef(() => BlogsModule),
		forwardRef(() => CommentsModule),
		UsersModule,
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
