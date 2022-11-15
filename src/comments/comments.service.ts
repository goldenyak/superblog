import { forwardRef, Inject, Injectable } from '@nestjs/common';
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
				myStatus: 'none',
				type: 'comment',
			},
		};
		await this.commentsRepository.create(newComment);
		return {
			id: newComment.id,
			content: dto.content,
			userId: user.id,
			userLogin: user.login,
			createdAt: new Date(),
		};
	}

	async getAllCommentsByPostId(
		pageNumber: number,
		pageSize: number,
		sortBy: string,
		sortDirection: string,
		postId: string,
	) {
		const countedCommentsByPostId = await this.commentsRepository.countCommentsByPostId(postId);
		const allCommentsByPostId = await this.commentsRepository.getAllCommentsByPostId(
			(pageNumber = 1),
			(pageSize = 10),
			sortBy,
			sortDirection,
			postId,
		);
		return {
			pagesCount: pageNumber,
			page: pageNumber,
			pageSize: pageSize,
			totalCount: countedCommentsByPostId,
			items: allCommentsByPostId,
		};
	}

	async findCommentById(commentId: string, userId?: string) {
		const foundedComment = await this.commentsRepository.findCommentById(commentId);
		if (foundedComment) {
			const likesArray = await this.likesService.findLikesByCommentId(commentId);
			const likesCount = likesArray.filter((el) => {
				return el._id === 'like';
			});
			const dislikesCount = likesArray.filter((el) => {
				return el._id === 'dislike';
			});
			const myStatus = await this.likesService.getLikeStatusByUserId(
				commentId,
				userId,
			);
			foundedComment.likesInfo = {
				likesCount: likesCount[0].count,
				dislikesCount: dislikesCount[0].count,
				myStatus: myStatus.status,
				type: 'comment',
			};
		}
		return foundedComment;
	}

	async deleteCommentById(id: string) {
		return await this.commentsRepository.deleteCommentById(id);
	}

	async updateCommentById(id: string, content: string) {
		return await this.commentsRepository.updateCommentById(id, content);
	}

	async addLikeCommentById(commentId: string, userId: string, likeStatus: string) {
		return await this.likesService.createLike(commentId, userId, likeStatus);
	}

	async deleteAll() {
		return await this.commentsRepository.deleteAll();
	}
}
