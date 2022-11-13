import { forwardRef, Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { CommentsRepository } from './comments.repository';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Blogs, BlogsSchema } from '../blogs/schemas/blogs.schema';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from '../configs/jwt.config';
import { Comments, CommentsSchema } from './schemas/comments.schema';
import { LikesModule } from "../likes/likes.module";

@Module({
	imports: [
		forwardRef(() => PostsModule),
		UsersModule,
		ConfigModule,
		LikesModule,
		MongooseModule.forFeature([{ name: Comments.name, schema: CommentsSchema }]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getJwtConfig,
		}),
	],
	providers: [CommentsService, CommentsRepository],
	controllers: [CommentsController],
	exports: [CommentsService],
})
export class CommentsModule {}
