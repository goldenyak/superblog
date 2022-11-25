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

	async updateLike(userId: string, parentId: string, likeStatus: string) {
		return this.likesModel.findOneAndUpdate(
			{ userId: userId, parentId: parentId },
			{ status: likeStatus },
		);
	}

	async findLikeByUserId(userId: string, parentId: string) {
		return this.likesModel.find({ userId: userId, parentId: parentId });
	}

	async findLikesByCommentId(id: string) {
		return this.likesModel.aggregate([
			{ $match: { commentId: id } },
			{ $group: { _id: '$status', count: { $sum: 1 } } },
		]);
	}

	async getLikeStatusByUserId(parentId: string, userId: string) {
		return this.likesModel.findOne({ parentId: parentId, userId: userId });
	}

	async getLikesCountByParentId(parentId: string): Promise<number> {
		return this.likesModel.countDocuments({ commentId: parentId, status: 'Like' });
	}
	async getDislikesCountByParentId(parentId: string): Promise<number> {
		return this.likesModel.countDocuments({ commentId: parentId, status: 'Dislike' });
	}

	async deleteAll() {
		return this.likesModel.deleteMany().exec();
	}
}
