import { Injectable } from '@nestjs/common';
import { LikesRepository } from './likes.repository';
import { v4 as uuidv4 } from 'uuid';
import { Likes } from './schemas/likes.schema';

@Injectable()
export class LikesService {
	constructor(private readonly likesRepository: LikesRepository) {}

	async createLike(parentId: string, userId: string, likeStatus: string) {
		const likes = await this.likesRepository.findLikeByUserId(userId, parentId);
		if (likes.length > 0) {
			return await this.likesRepository.updateLike(userId, parentId, likeStatus);
		} else {
			const newLike = {
				id: uuidv4(),
				userId: userId,
				parentId: parentId,
				createdAt: new Date(),
				status: likeStatus,
			};
			return await this.likesRepository.createLike(newLike);
		}
	}

	async findLikesByCommentId(id: string) {
		return await this.likesRepository.findLikesByCommentId(id);
	}

	async getLikeStatusByUserId(parenId: string, userId: string) {
		return await this.likesRepository.getLikeStatusByUserId(parenId, userId);
	}

	async getLikesCountByParentId(parentId: string): Promise<number> {
		return this.likesRepository.getLikesCountByParentId(parentId);
	}

	async getDislikesCountByParentId(parentId: string): Promise<number> {
		return this.likesRepository.getDislikesCountByParentId(parentId);
	}

	async deleteAll() {
		return await this.likesRepository.deleteAll();
	}
}
