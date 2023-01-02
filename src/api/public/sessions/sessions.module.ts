import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { JwtModule, JwtService } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getJwtConfig } from '../../../configs/jwt.config';
import { MongooseModule } from "@nestjs/mongoose";
import { Sessions, SessionsSchema } from "./schemas/session.schema";
import { SessionsRepository } from "./sessions.repository";
import { UsersModule } from "../users/users.module";
import { UsersService } from "../users/users.service";

@Module({
	imports: [
		UsersModule,
		ConfigModule,
		MongooseModule.forFeature([{ name: Sessions.name, schema: SessionsSchema }]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getJwtConfig,
		}),
	],
	controllers: [SessionsController],
	providers: [UsersService, SessionsService, SessionsRepository],
	exports: [SessionsService],
})
export class SessionsModule {}
