import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Likes, LikesDocument } from './schemas/likes.schema';
import { create } from 'domain';

@Injectable()
export class LikesRepository {
	constructor(@InjectModel(Likes.name) private readonly likesModel: Model<LikesDocument>) {}

	async createLike(newLike) {
		return await this.likesModel.create(newLike);
	}

	async updateLike(userId: string, commentId: string, likeStatus: string) {
		return this.likesModel.findOneAndUpdate({userId: userId, commentId: commentId}, {status: likeStatus})
	}

	async findLikeByUserId(userId: string, commentId: string) {
		return this.likesModel.find({userId: userId, commentId: commentId})
	}

	async deleteAll() {
		return this.likesModel.deleteMany().exec();
	}
}
