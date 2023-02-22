import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { getMongoConfig } from "./configs/mongo.config";
import { LikesService } from "./api/public/likes/likes.service";
import { CqrsModule } from "@nestjs/cqrs";
import { SuperAdminController } from "./api/super-admin/api/users/super-admin.controller";
import { UsersService } from "./api/public/users/users.service";
import { UsersRepository } from "./api/public/users/users.repository";
import { User, UserSchema } from "./api/public/users/schemas/user.schema";
import { SessionsService } from "./api/public/sessions/sessions.service";
import { SessionsRepository } from "./api/public/sessions/sessions.repository";
import { JwtService } from "@nestjs/jwt";
import { Sessions, SessionsSchema } from "./api/public/sessions/schemas/session.schema";
import { Likes, LikesSchema } from "./api/public/likes/schemas/likes.schema";
import { LikesRepository } from "./api/public/likes/likes.repository";
import { GetAllBlogsUseCase } from "./api/public/blogs/use-cases/get-all-blogs.use-case";
import { BlogsRepository } from "./api/public/blogs/blogs.repository";
import { Blogs, BlogsSchema } from "./api/public/blogs/schemas/blogs.schema";
import { ThrottlerModule } from "@nestjs/throttler";


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
			{ schema: SessionsSchema, name: Sessions.name },
			{ schema: LikesSchema, name: Likes.name },
			{ schema: BlogsSchema, name: Blogs.name },
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
	controllers: [AppController, SuperAdminController],
	providers: [
		AppService,
		UsersService,
		UsersRepository,
		SessionsService,
		SessionsRepository,
		JwtService,
		LikesService,
		LikesRepository,
		GetAllBlogsUseCase,
		BlogsRepository,
	],
})
export class AppModule {}
