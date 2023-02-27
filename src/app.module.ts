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
import { CreatePostByBlogIdUseCase } from './api/public/blogs/use-cases/create-post-by-blog-id.use-case';
import { CheckRefreshTokenUseCase } from './api/public/auth/use-cases/check-refresh-token.use-case';
import { AuthController } from './api/public/auth/auth.controller';
import { FindUserByLoginUseCase } from './api/public/users/use-cases/find-user-by-login.use-case';
import { SendConfirmEmailUseCase } from './api/public/auth/use-cases/send-confirm-email.use-case';
import { LoginUseCase } from './api/public/auth/use-cases/login.use-case';
import { CreateNewTokenUseCase } from './api/public/auth/use-cases/create-new-token.use-case';
import { GetLastActiveDateFromRefreshTokenUseCase } from './api/public/auth/use-cases/get-last-active-date-from-refresh-token.use-case';
import { SendNewConfirmEmailUseCase } from './api/public/auth/use-cases/send-new-confirm-email.use-case';
import { SendRecoveryPasswordEmailUseCase } from './api/public/auth/use-cases/send-recovery-password-email.use-case';
import { SetNewPasswordUseCase } from './api/public/auth/use-cases/set-new-password.use-case';
import { SendEmailUseCase } from './email/use-cases/send-email.use-case';
import { ValidateUserUseCase } from './api/public/users/use-cases/validate-user.use-case';
import { FindUserByConfirmationCodeUseCase } from './api/public/users/use-cases/find-user-by-confirmation-code.use-case';
import { UpdateConfirmationCodeUseCase } from './api/public/users/use-cases/update-confirmation-code.use-case';
import { FindUserByRecoveryCodeUseCase } from './api/public/users/use-cases/find-user-by-recovery-code.use-case';
import { CreateNewSessionUseCase } from './api/public/sessions/use-cases/create-new-session.use-case';
import { GetLastActiveSessionUseCase } from './api/public/sessions/use-cases/get-last-active-session.use-case';
import { DeleteSessionUseCase } from './api/public/sessions/use-cases/delete-session.use-case';
import { UpdateSessionAfterRefreshUseCase } from './api/public/sessions/use-cases/update-session-after-refresh.use-case';
import { CheckUserIdByTokenUseCase } from "./api/public/auth/use-cases/check-user-by-token.use-case";
import { GetAllPostsByBlogIdUseCase } from "./api/public/posts/use-cases/get-all-posts.use-case";
import { EmailModule } from "./email/email.module";
import { FindUserByEmailUseCase } from "./api/public/users/use-cases/find-user-by-email.use-case";
import { CreateUserUseCase } from "./api/public/users/use-cases/create-user.use-case";

const controllers = [
	AppController,
	AuthController,
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
	LikesService
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

const usersUseCases = [
	ValidateUserUseCase,
	FindUserByConfirmationCodeUseCase,
	FindUserByRecoveryCodeUseCase,
	FindUserByLoginUseCase,
	FindUserByEmailUseCase,
	FindUserByIdUseCase,
	CreateUserUseCase,
];

const authUseCases = [
	UpdateConfirmationCodeUseCase,
	CheckRefreshTokenUseCase,
	CheckUserIdByTokenUseCase,
	CreateNewTokenUseCase,
	GetLastActiveDateFromRefreshTokenUseCase,
	LoginUseCase,
	SendEmailUseCase,
	SendConfirmEmailUseCase,
	SendNewConfirmEmailUseCase,
	SendRecoveryPasswordEmailUseCase,
	SetNewPasswordUseCase,
];

const sessionsUseCases = [
	CreateNewSessionUseCase,
	GetLastActiveSessionUseCase,
	DeleteSessionUseCase,
	UpdateSessionAfterRefreshUseCase,
];

const blogsUseCases = [
	CreateBlogUseCase,
	GetAllBlogsUseCase,
	GetAllBlogsForCurrentUserUseCase,
]

const postsUseCases = [
	GetAllPostsByBlogIdUseCase,
	CreatePostByBlogIdUseCase,
	FindPostByIdUseCase,
];

@Module({
	imports: [
		CqrsModule,
		EmailModule,
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
	],
	controllers: [...controllers],
	providers: [
		...repositories,
		...services,
		...postsUseCases,
		...blogsUseCases,
		...usersUseCases,
		...authUseCases,
		...sessionsUseCases,
	],
})
export class AppModule {}
