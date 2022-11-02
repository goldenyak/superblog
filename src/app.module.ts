import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BlogsModule } from './blogs/blogs.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getMongoConfig } from "./configs/mongo.config";
import { UsersController } from "./users/users.controller";
import { DeleteAllModule } from './delete-all/delete-all.module';

@Module({
	imports: [
		ConfigModule.forRoot(),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getMongoConfig,
		}),
		AuthModule,
		BlogsModule,
		UsersModule,
		PostsModule,
		CommentsModule,
		DeleteAllModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
