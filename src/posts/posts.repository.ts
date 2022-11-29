import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Posts, PostsDocument } from './schemas/posts.schemas';
import { CreatePostsDto } from './dto/create-post.dto';

@Injectable()
export class PostsRepository {
	constructor(@InjectModel(Posts.name) private readonly postsModel: Model<PostsDocument>) {}

	async create(newPost: CreatePostsDto) {
		return this.postsModel.create(newPost);
	}

	async getAllPosts(pageNumber = 1, pageSize = 10, sortBy: string, sortDirection: string) {
		const sortByFilter = this.getFilterForSortBy(sortBy);
		const sortDirectionFilter = this.getFilterForSortDirection(sortDirection);

		const posts = await this.postsModel
			.find()
			.skip((pageNumber - 1) * pageSize)
			.limit(pageSize)
			.sort({ [sortByFilter]: sortDirectionFilter })
			.lean();

		return posts.map((post) => {
			return {
				id: post.id,
				title: post.title,
				shortDescription: post.shortDescription,
				content: post.content,
				blogId: post.blogId,
				blogName: post.blogName,
				createdAt: post.createdAt,
				extendedLikesInfo: {
					likesCount: 0,
					dislikesCount: 0,
					myStatus: 'None',
				},
			};
		});
	}

	async getAllPostsByBlogId(
		pageNumber = 1,
		pageSize = 10,
		sortBy: string,
		sortDirection: string,
		blogId: string,
	) {
		const filter = this.getFilterForQuery(blogId);
		const sortByFilter = this.getFilterForSortBy(sortBy);
		const sortDirectionFilter = this.getFilterForSortDirection(sortDirection);

		const posts = await this.postsModel
			.find(filter)
			.skip((pageNumber - 1) * pageSize)
			.limit(pageSize)
			.sort({ [sortByFilter]: sortDirectionFilter })
			.lean();

		return posts.map((post) => {
			return {
				id: post.id,
				title: post.title,
				shortDescription: post.shortDescription,
				content: post.content,
				blogId: post.blogId,
				blogName: post.blogName,
				createdAt: post.createdAt,
				extendedLikesInfo: {
					likesCount: 0,
					dislikesCount: 0,
					myStatus: 'None',
					newestLikes: [],
				},
			};
		});
	}

	async findPostById(id: string) {
		return this.postsModel.findOne({ id: id }, { _id: 0 });
	}

	async updatePostById(id: string, title: string, shortDescription: string, content: string) {
		return this.postsModel.findOneAndUpdate(
			{ id: id },
			{ title: title, shortDescription: shortDescription, content: content },
		);
	}

	async updateLikesInfoByPost(postId: string, updatedPost: any) {
		return this.postsModel.updateOne(
			{ id: postId },
			{ $set: { extendedLikesInfo: updatedPost.extendedLikesInfo } },
		);
	}

	async deletePostById(id: string) {
		return this.postsModel.findOneAndDelete({ id: id });
	}

	async countAllPosts() {
		return this.postsModel.count({});
	}

	async countPostsByBlogId(blogId: string | null) {
		const filter = this.getFilterForQuery(blogId);
		return this.postsModel.count(filter);
	}

	private getFilterForQuery(blogId: string | null) {
		if (!blogId) {
			return {};
		} else {
			return { blogId: { $regex: blogId, $options: 'i' } };
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
		return this.postsModel.deleteMany().exec();
	}
}
