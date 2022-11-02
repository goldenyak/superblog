import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchema } from './schemas/auth.schema';
import { AuthRepository } from './auth.repository';
import { UsersModule } from '../users/users.module';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { getJwtConfig } from "../configs/jwt.config";

@Module({
	imports: [UsersModule,
		MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getJwtConfig,
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, AuthRepository],
	exports: [AuthService],
})
export class AuthModule {}
