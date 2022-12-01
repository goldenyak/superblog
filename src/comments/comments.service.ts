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
		for await (const comment of allCommentsByPostId) {
			const mappedComment = await this.likesService.getLikesInfoForComment(comment, userId);
			result.push(mappedComment);
		}

		return {
			pagesCount: Math.ceil(countedCommentsByPostId / pageSize),
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
		return await this.likesService.getLikesInfoForComment(foundedComment, userId);
	}


	async deleteCommentById(id: string) {
		return await this.commentsRepository.deleteCommentById(id);
	}

	async updateCommentById(id: string, content: string) {
		return await this.commentsRepository.updateCommentById(id, content);
	}

	async addLikeCommentById(commentId: string, userId: string, likeStatus: string) {
		await this.likesService.createLike(commentId, userId, likeStatus);
		const foundedComment = await this.findCommentById(commentId, userId);
		const updatedComment = await this.likesService.getLikesInfoForComment(foundedComment, userId);
		return await this.commentsRepository.updateLikesInfoByComment(commentId, updatedComment);
	}

	async deleteAll() {
		return await this.commentsRepository.deleteAll();
	}
}
