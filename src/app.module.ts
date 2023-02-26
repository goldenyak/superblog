import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getMongoConfig } from './configs/mongo.config';
import { LikesService } from './api/public/likes/likes.service';
import { CqrsModule } from '@nestjs/cqrs';
import { SuperAdminController } from './api/super-admin/api/users/super-admin.controller';
import { UsersService } from './api/public/users/users.service';
import { UsersRepository } from './api/public/users/users.repository';
import { User, UserSchema } from './api/public/users/schemas/user.schema';
import { SessionsService } from './api/public/sessions/sessions.service';
import { SessionsRepository } from './api/public/sessions/sessions.repository';
import { JwtService } from '@nestjs/jwt';
import { Sessions, SessionsSchema } from './api/public/sessions/schemas/session.schema';
import { Likes, LikesSchema } from './api/public/likes/schemas/likes.schema';
import { LikesRepository } from './api/public/likes/likes.repository';
import { GetAllBlogsUseCase } from './api/public/blogs/use-cases/get-all-blogs.use-case';
import { BlogsRepository } from './api/public/blogs/blogs.repository';
import { Blogs, BlogsSchema } from './api/public/blogs/schemas/blogs.schema';
import { ThrottlerModule } from '@nestjs/throttler';
import { DeleteAllController } from './api/public/delete-all/delete-all.controller';
import { Jwt, JwtSchema } from './api/public/auth/schemas/jwt.schema';
import { AuthRepository } from './api/public/auth/auth.repository';
import { Auth, AuthSchema } from './api/public/auth/schemas/auth.schema';
import { CommentsRepository } from './api/public/comments/comments.repository';
import { Comments, CommentsSchema } from './api/public/comments/schemas/comments.schema';
import { PostsRepository } from './api/public/posts/posts.repository';
import { Posts, PostsSchema } from './api/public/posts/schemas/posts.schemas';
import { BlogsController } from './api/blogger/api/blogs.controller';
import { BlogsService } from './api/public/blogs/blogs.service';
import { PostsService } from './api/public/posts/posts.service';
import { PostsController } from './api/public/posts/posts.controller';
import { FindPostByIdUseCase } from './api/public/blogs/use-cases/find-post-by-id.use-case';
import { FindUserByIdUseCase } from './api/public/users/use-cases/find-user-by-id.use-case';
import { CommentsService } from './api/public/comments/comments.service';
import { CreateBlogUseCase } from './api/public/blogs/use-cases/create-blog.use-case';
import { GetAllBlogsForCurrentUserUseCase } from './api/blogger/use-cases/get-all-blogs-for-current-user.use-case';
import { GetAllPostByBlogIdUseCase } from "./api/public/blogs/use-cases/get-all-posts.use-case";
import { CreatePostByBlogIdUseCase } from "./api/public/blogs/use-cases/create-post-by-blog-id.use-case";
import { CheckRefreshTokenUseCase } from "./api/public/auth/use-cases/check-refresh-token.use-case";

const controllers = [
	AppController,
	SuperAdminController,
	BlogsController,
	PostsController,
	DeleteAllController,
];

const services = [
	AppService,
	UsersService,
	BlogsService,
	PostsService,
	CommentsService,
	SessionsService,
	JwtService,
	LikesService,
];

const repositories = [
	AuthRepository,
	UsersRepository,
	SessionsRepository,
	LikesRepository,
	BlogsRepository,
	CommentsRepository,
	PostsRepository,
];

const useCases = [
	CreateBlogUseCase,
	GetAllBlogsUseCase,
	GetAllBlogsForCurrentUserUseCase,
	GetAllPostByBlogIdUseCase,
	CreatePostByBlogIdUseCase,
	FindPostByIdUseCase,
	FindUserByIdUseCase,
	CheckRefreshTokenUseCase,
];

@Module({
	imports: [
		CqrsModule,
		ConfigModule.forRoot({ isGlobal: true }),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getMongoConfig,
		}),
		MongooseModule.forFeature([
			{ schema: UserSchema, name: User.name },
			{ schema: AuthSchema, name: Auth.name },
			{ schema: SessionsSchema, name: Sessions.name },
			{ schema: LikesSchema, name: Likes.name },
			{ schema: BlogsSchema, name: Blogs.name },
			{ schema: JwtSchema, name: Jwt.name },
			{ schema: CommentsSchema, name: Comments.name },
			{ schema: PostsSchema, name: Posts.name },
		]),
		ThrottlerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				ttl: config.get('THROTTLE_TTL'),
				limit: config.get('THROTTLE_LIMIT'),
			}),
		}),
		// AuthModule,
		// BlogsModule,
		// UsersModule,
		// PostsModule,
		// CommentsModule,
		// DeleteAllModule,
		// SessionsModule,
		// LikesModule,
		// EmailModule,
	],
	controllers: [...controllers],
	providers: [...repositories, ...services, ...useCases],
})
export class AppModule {}
