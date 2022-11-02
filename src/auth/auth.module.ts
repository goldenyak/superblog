import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchema } from './schemas/auth.schema';
import { AuthRepository } from './auth.repository';
import { UsersModule } from '../users/users.module';

@Module({
	imports: [UsersModule, MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }])],
	controllers: [AuthController],
	providers: [AuthService, AuthRepository],
})
export class AuthModule {}
