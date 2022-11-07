import { forwardRef, Module } from "@nestjs/common";
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { UsersModule } from '../users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchema } from '../auth/schemas/auth.schema';
import { Jwt, JwtSchema } from '../auth/schemas/jwt.schema';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from '../configs/jwt.config';
import { Blogs, BlogsSchema } from './schemas/blogs.schema';
import { BlogsRepository } from './blogs.repository';
import { PostsModule } from "../posts/posts.module";

@Module({
	imports: [
		forwardRef(() => PostsModule),
		UsersModule,
		ConfigModule,
		MongooseModule.forFeature([{ name: Blogs.name, schema: BlogsSchema }]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getJwtConfig,
		}),
	],
	providers: [BlogsService, BlogsRepository],
	controllers: [BlogsController],
	exports: [BlogsService],
})
export class BlogsModule {}
