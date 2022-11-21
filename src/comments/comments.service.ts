import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { PostsService } from '../posts/posts.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comments } from './schemas/comments.schema';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/schemas/user.schema';
import { LikesService } from '../likes/likes.service';

@Injectable()
export class CommentsService {
	constructor(
		private readonly commentsRepository: CommentsRepository,
		private readonly likesService: LikesService,
		@Inject(forwardRef(() => PostsService)) private readonly postsService: PostsService,
	) {}

	async create(dto: CreateCommentDto, postId: string, user: User) {
		const newComment: Comments = {
			id: uuidv4(),
			content: dto.content,
			userId: user.id,
			userLogin: user.login,
			postId: postId,
			createdAt: new Date(),
			likesInfo: {
				likesCount: 0,
				dislikesCount: 0,
				myStatus: 'None',
			},
		};
		await this.commentsRepository.create(newComment);
		return {
			id: newComment.id,
			content: newComment.content,
			userId: newComment.userId,
			userLogin: newComment.userLogin,
			createdAt: newComment.createdAt,
			likesInfo: {
				likesCount: newComment.likesInfo.likesCount,
				dislikesCount: newComment.likesInfo.dislikesCount,
				myStatus: newComment.likesInfo.myStatus,
			},
		};
	}

	async getAllCommentsByPostId(
		pageNumber: number,
		pageSize: number,
		sortBy: string,
		sortDirection: string,
		postId: string,
		userId: string,
	) {
		const countedCommentsByPostId = await this.commentsRepository.countCommentsByPostId(postId);
		const allCommentsByPostId = await this.commentsRepository.getAllCommentsByPostId(
			(pageNumber = 1),
			(pageSize = 10),
			sortBy,
			sortDirection,
			postId,
		);

		//
		// const result = await Promise.all(allCommentsByPostId.map(async comment => {
		// 	return this.getLikesInfoForComment(comment, userId)
		// }))

		const result = [];
		for (const comment of allCommentsByPostId) {
			const mappedComment = await this.getLikesInfoForComment(comment, userId);
			result.push(mappedComment);
		}

		return {
			pagesCount: pageNumber,
			page: pageNumber,
			pageSize: pageSize,
			totalCount: countedCommentsByPostId,
			items: result,
		};
	}

	async findCommentById(commentId: string, userId?: string | undefined) {
		const foundedComment = await this.commentsRepository.findCommentById(commentId);
		if (!foundedComment) {
			throw new NotFoundException();
		}
		return await this.getLikesInfoForComment(foundedComment, userId);

		// if (foundedComment) {
		// 	const likesArray = await this.likesService.findLikesByCommentId(commentId);
		// 	const likesCount = likesArray.filter((el) => {
		// 		return el._id === 'like';
		// 	});
		// 	const dislikesCount = likesArray.filter((el) => {
		// 		return el._id === 'dislike';
		// 	});
		// 	const myStatus = await this.likesService.getLikeStatusByUserId(commentId, foundedComment.userId);
		// 	foundedComment.likesInfo = {
		// 		likesCount: likesCount.length ? likesCount[0].count : 0,
		// 		dislikesCount: dislikesCount.length ? dislikesCount[0].count : 0,
		// 		myStatus: myStatus ? myStatus.status : 'None',
		// 	};
		// }
		// return foundedComment;
	}

	async getLikesInfoForComment(comment: any, userId: string) {
		const likes = await this.likesService.getLikesCountByParentId(comment.id);
		const dislikes = await this.likesService.getDislikesCountByParentId(comment.id);
		const currentUserStatus = await this.likesService.getLikeStatusByUserId(comment.id, userId);
		let myStatus;
		if (!userId || !currentUserStatus) {
			myStatus = 'None';
		} else {
			myStatus = currentUserStatus.status;
		}
		console.log(myStatus);
		comment.likesInfo.likesCount = likes;
		comment.likesInfo.dislikesCount = dislikes;
		comment.likesInfo.myStatus = myStatus;
		return comment;
	}

	async deleteCommentById(id: string) {
		return await this.commentsRepository.deleteCommentById(id);
	}

	async updateCommentById(id: string, content: string) {
		return await this.commentsRepository.updateCommentById(id, content);
	}

	async addLikeCommentById(commentId: string, userId: string, likeStatus: string) {
		await this.likesService.createLike(commentId, userId, likeStatus);
		// const foundedComment = await this.findCommentById(commentId, userId);
		// const updatedComment = await this.getLikesInfoForComment(foundedComment, userId);
		// return await this.commentsRepository.updateLikesInfoByComment(commentId, updatedComment);
	}

	async addReactionByParentId(parentId: string, userId: string, likeStatus: string) {
		return this.likesService.addReactionByParentId(parentId, userId, likeStatus);
	}

	async deleteAll() {
		return await this.commentsRepository.deleteAll();
	}
}
