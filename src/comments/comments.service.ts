import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { PostsService } from '../posts/posts.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comments } from './schemas/comments.schema';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class CommentsService {
	constructor(
		private readonly commentsRepository: CommentsRepository,
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
		};
		await this.commentsRepository.create(newComment);
		return {
			id: uuidv4(),
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

	async findCommentById(id: string) {
		return await this.commentsRepository.findCommentById(id);
	}

	async deleteCommentById(id: string) {
		return await this.commentsRepository.deleteCommentById(id);
	}

	async updateCommentById(id: string, content: string) {
		return await this.commentsRepository.updateCommentById(id, content);
	}
}
