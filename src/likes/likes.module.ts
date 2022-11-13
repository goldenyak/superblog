import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Likes, LikesSchema } from './schemas/likes.schema';
import { LikesRepository } from './likes.repository';

@Module({
	imports: [MongooseModule.forFeature([{ name: Likes.name, schema: LikesSchema }])],
	providers: [LikesService, LikesRepository],
	exports: [LikesService],
})
export class LikesModule {}
