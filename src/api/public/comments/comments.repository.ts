import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comments, CommentsDocument } from './schemas/comments.schema';
import { AllCommentsForBlogQueryParams } from './dto/all-comments-for-blog-query.dto';

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
			.sort({ [sortByFilter]: sortDirectionFilter })
			.lean();

		return comments.map((comment) => {
			return {
				id: comment.id,
				content: comment.content,
				userId: comment.userId,
				userLogin: comment.userLogin,
				createdAt: comment.createdAt,
				likesInfo: {
					likesCount: 0,
					dislikesCount: 0,
					myStatus: 'None',
				},
			};
		});
	}

	async getAllCommentsByCurrentUser(
		//queryParams: AllCommentsForBlogQueryParams,
		postId: string,
		currentUserId: string,
	) {
		// const sortByFilter = this.getFilterForSortBy(queryParams.sortBy);
		// const sortDirectionFilter = this.getFilterForSortDirection(queryParams.sortDirection);

		return this.commentsModel
			.find({ postId: postId, userId: currentUserId })
			// .skip((queryParams.pageNumber - 1) * queryParams.pageSize)
			// .limit(queryParams.pageSize)
			// .sort({ [sortByFilter]: sortDirectionFilter })
			.lean();
	}

	async findCommentById(commentId: string) {
		return this.commentsModel.findOne({ id: commentId }, { _id: 0, postId: 0 });
	}

	async deleteCommentById(id: string) {
		return this.commentsModel.findOneAndDelete({ id: id });
	}

	async updateCommentById(id: string, content: string) {
		return this.commentsModel.findOneAndUpdate({ id: id }, { content: content });
	}

	async updateLikesInfoByComment(commentId: string, updatedComment: any) {
		return this.commentsModel.updateOne(
			{ id: commentId },
			{ $set: { likesInfo: updatedComment.likesInfo } },
		);
	}

	async countCommentsByPostId(postId: string | null) {
		const filter = this.getFilterForQuery(postId);
		return this.commentsModel.count(filter);
	}

	async countAllCommentsForCurrentUser(postId: string, userId) {
		return this.commentsModel.count({
			postId: { $regex: postId, $options: 'i' },
			userId: { $regex: userId, $options: 'i' },
		});
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
		if (!sortDirection || sortDirection === 'desc') {
			return -1;
		}
		if (sortDirection === 'asc') {
			return 1;
		}
	}

	async deleteAll() {
		return this.commentsModel.deleteMany().exec();
	}
}
