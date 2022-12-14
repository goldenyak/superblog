import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './api/public/auth/auth.module';
import { BlogsModule } from './api/public/blogs/blogs.module';
import { UsersModule } from './api/public/users/users.module';
import { PostsModule } from './api/public/posts/posts.module';
import { CommentsModule } from './api/public/comments/comments.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getMongoConfig } from "./configs/mongo.config";
import { DeleteAllModule } from './api/public/delete-all/delete-all.module';
import { MailerModule } from "@nestjs-modules/mailer";
import { getMailConfig } from "./configs/mail.config";
import { ThrottlerModule } from "@nestjs/throttler";
import { SessionsModule } from './api/public/sessions/sessions.module';
import { LikesModule } from './api/public/likes/likes.module';
import { LikesService } from "./api/public/likes/likes.service";
import { EmailModule } from './email/email.module';
import { ValidationModule } from "./validation/validation.module";


@Module({
	imports: [
		ConfigModule.forRoot({isGlobal: true}),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getMongoConfig,
		}),
		ThrottlerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				ttl: config.get('THROTTLE_TTL'),
				limit: config.get('THROTTLE_LIMIT'),
			}),
		}),
		AuthModule,
		BlogsModule,
		UsersModule,
		PostsModule,
		CommentsModule,
		DeleteAllModule,
		SessionsModule,
		LikesModule,
		EmailModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
