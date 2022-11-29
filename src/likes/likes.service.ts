import { Injectable } from '@nestjs/common';
import { LikesRepository } from './likes.repository';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';

@Injectable()
export class LikesService {
	constructor(
		private readonly likesRepository: LikesRepository,
		private readonly usersService: UsersService,
	) {}

	async createLike(parentId: string, userId: string, likeStatus: string) {
		const likes = await this.likesRepository.findLikeByUserId(userId, parentId);
		const user = await this.usersService.findUserById(userId);
		if (likes.length > 0) {
			return await this.likesRepository.updateLike(userId, parentId, likeStatus);
		} else {
			const newLike = {
				id: uuidv4(),
				userId: userId,
				login: user.login,
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

	async getLikesInfoForComment(comment: any, userId: string) {
		const likes = await this.getLikesCountByParentId(comment.id);
		const dislikes = await this.getDislikesCountByParentId(comment.id);
		const currentUserStatus = await this.getLikeStatusByUserId(comment.id, userId);
		let myStatus;
		if (!userId || !currentUserStatus) {
			myStatus = 'None';
		} else {
			myStatus = currentUserStatus.status;
		}
		comment.likesInfo.likesCount = likes;
		comment.likesInfo.dislikesCount = dislikes;
		comment.likesInfo.myStatus = myStatus;
		return comment;
	}

	async getLikesInfoForPost(post: any, userId: string) {
		const likes = await this.getLikesCountByParentId(post.id);
		const dislikes = await this.getDislikesCountByParentId(post.id);
		const newestLikes = await this.getNewestLikesByPostId(post.id);
		const currentUserStatus = await this.getLikeStatusByUserId(post.id, userId);
		let myStatus;
		if (!userId || !currentUserStatus) {
			myStatus = 'None';
		} else {
			myStatus = currentUserStatus.status;
		}
		post.extendedLikesInfo.likesCount = likes;
		post.extendedLikesInfo.dislikesCount = dislikes;
		post.extendedLikesInfo.myStatus = myStatus;
		post.extendedLikesInfo.newestLikes = newestLikes;
		return post;
	}

	async getNewestLikesByPostId(postId: string) {
		const newestLikes = await this.likesRepository.findNewestLikesByPostId(postId);
		return newestLikes.map((el) => {
			return {
				addedAt: el.createdAt,
				userId: el.userId,
				login: el.login,
			};
		});
	}

	async deleteAll() {
		return await this.likesRepository.deleteAll();
	}
}
