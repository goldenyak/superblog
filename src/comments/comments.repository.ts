import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comments, CommentsDocument } from './schemas/comments.schema';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsRepository {
	constructor(
		@InjectModel(Comments.name) private readonly commentsModel: Model<CommentsDocument>,
	) {}

	async create(newComment: Comments) {
		return this.commentsModel.create(newComment);
	}

	async getAllCommentsByPostId(
		pageNumber = 1,
		pageSize = 10,
		sortBy: string,
		sortDirection: string,
		postId: string,
	) {
		const filter = this.getFilterForQuery(postId);
		const sortByFilter = this.getFilterForSortBy(sortBy);
		const sortDirectionFilter = this.getFilterForSortDirection(sortDirection);

		const comments = await this.commentsModel
			.find(filter)
			.skip((pageNumber - 1) * pageSize)
			.limit(pageSize)
			.sort({ [sortByFilter]: sortDirectionFilter });

		return comments.map((comment) => {
			return {
				id: comment.id,
				content: comment.content,
				userId: comment.userId,
				userLogin: comment.userLogin,
				createdAt: comment.createdAt,
			};
		});
	}

	async findCommentById(id: string) {
		return this.commentsModel.findOne({ id: id }, { _id: 0 });
	}

	async deleteCommentById(id: string) {
		return this.commentsModel.findOneAndDelete({ id: id });
	}

	async updateCommentById(id: string, content: string) {
		return this.commentsModel.findOneAndUpdate({id: id}, {content: content})
	}

	async countCommentsByPostId(postId: string | null) {
		const filter = this.getFilterForQuery(postId);
		return this.commentsModel.count(filter);
	}

	private getFilterForQuery(postId: string | null) {
		if (!postId) {
			return {};
		} else {
			return { postId: { $regex: postId, $options: 'i' } };
		}
	}

	private getFilterForSortBy(sortBy: string | null) {
		if (sortBy) {
			return sortBy;
		} else return 'createdAt';
	}

	private getFilterForSortDirection(sortDirection: string | null) {
		if (!sortDirection || sortDirection === 'asc') {
			return 1;
		}
		if (sortDirection === 'desc') {
			return -1;
		}
	}


	async deleteAll() {
		return this.commentsModel.deleteMany().exec();
	}
}
