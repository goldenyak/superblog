import { forwardRef, Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Likes, LikesSchema } from './schemas/likes.schema';
import { LikesRepository } from './likes.repository';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';

@Module({
	imports: [
		forwardRef(() => UsersModule),
		MongooseModule.forFeature([{ name: Likes.name, schema: LikesSchema }]),
	],
	providers: [LikesService, LikesRepository, UsersService],
	exports: [LikesService],
})
export class LikesModule {}
