import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getJwtConfig } from '../configs/jwt.config';
import { MongooseModule } from "@nestjs/mongoose";
import { Sessions, SessionsSchema } from "./schemas/session.schema";
import { SessionsRepository } from "./sessions.repository";

@Module({
	imports: [
		ConfigModule,
		MongooseModule.forFeature([{ name: Sessions.name, schema: SessionsSchema }]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getJwtConfig,
		}),
	],
	controllers: [SessionsController],
	providers: [SessionsService, SessionsRepository],
	exports: [SessionsService],
})
export class SessionsModule {}
