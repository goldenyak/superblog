import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PostsRepository } from './posts.repository';
import { v4 as uuidv4 } from 'uuid';
import { CreatePostsDto } from './dto/create-post.dto';
import { BlogsService } from '../blogs/blogs.service';
import { CommentsService } from '../comments/comments.service';
import { Posts } from './schemas/posts.schemas';
import { LikesService } from '../likes/likes.service';
import { PostsQueryParams } from './dto/posts-query.dto';

@Injectable()
export class PostsService {
	constructor(
		private readonly postsRepository: PostsRepository,
		private readonly likesService: LikesService,
		@Inject(forwardRef(() => BlogsService)) private readonly blogsService: BlogsService,
		@Inject(forwardRef(() => CommentsService)) private readonly commentsService: CommentsService,
	) {}

	async create(dto: CreatePostsDto, blogId?: string) {
		const foundedBlog = await this.blogsService.findBlogById(dto.blogId ? dto.blogId : blogId);
		if (!foundedBlog) {
			throw new BadRequestException([{
				message: 'blogId',
				field: 'blogId'
			}]);
		} else {
			const newPost: Posts = {
				id: uuidv4(),
				title: dto.title,
				shortDescription: dto.shortDescription,
				content: dto.content,
				blogId: blogId ? blogId : foundedBlog.id,
				blogName: foundedBlog.name,
				createdAt: new Date(),
				extendedLikesInfo: {
					likesCount: 0,
					dislikesCount: 0,
					myStatus: 'None',
					newestLikes: [],
				},
			};
			await this.postsRepository.create(newPost);
			return {
				id: newPost.id,
				title: dto.title,
				shortDescription: dto.shortDescription,
				content: dto.content,
				blogId: newPost.blogId,
				blogName: newPost.blogName,
				createdAt: newPost.createdAt,
				extendedLikesInfo: {
					likesCount: 0,
					dislikesCount: 0,
					myStatus: 'None',
					newestLikes: [],
				},
			};
		}
	}



	async getAllPosts(
		{ pageNumber, pageSize, sortBy, sortDirection }: PostsQueryParams,
		userId: string,
	) {
		const countedAllPosts = await this.postsRepository.countAllPosts();
		const allPosts = await this.postsRepository.getAllPosts(
			pageNumber,
			pageSize,
			sortBy,
			sortDirection,
		);

		const result = await Promise.all(
			allPosts.map(async (post) => {
				return await this.likesService.getLikesInfoForPost(post, userId);
			}),
		);
		// const result = [];
		// for (const post of allPosts) {
		// 	const mappedComment = await this.likesService.getLikesInfoForPost(post, userId);
		// 	result.push(mappedComment);
		// }

		return {
			pagesCount: Math.ceil(countedAllPosts / pageSize),
			page: pageNumber,
			pageSize: pageSize,
			totalCount: countedAllPosts,
			items: result,
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
		return await this.commentsService.getAllCommentsByPostId(
			pageNumber,
			pageSize,
			sortBy,
			sortDirection,
			postId,
			userId,
		);
	}

	async getAllPostsByBlogId(
		pageNumber: number,
		pageSize: number,
		sortBy: string,
		sortDirection: string,
		blogId: string,
		userId: string,
	) {
		const countedPostsByBlogId = await this.postsRepository.countPostsByBlogId(blogId);
		const allPostsByBlogId = await this.postsRepository.getAllPostsByBlogId(
			pageNumber,
			pageSize,
			sortBy,
			sortDirection,
			blogId,
		);
		const result = [];
		for await (let post of allPostsByBlogId) {
			const mappedPost = await this.likesService.getLikesInfoForPost(post, userId);
			result.push(mappedPost);
		}

		return {
			pagesCount: Math.ceil(countedPostsByBlogId / pageSize),
			page: pageNumber,
			pageSize: pageSize,
			totalCount: countedPostsByBlogId,
			items: result,
		};
	}

	async findPostById(id: string, userId?: string | undefined) {
		const foundedPost = await this.postsRepository.findPostById(id);
		if (!foundedPost) {
			throw new NotFoundException();
		}
		return await this.likesService.getLikesInfoForPost(foundedPost, userId);
	}

	async deletePostById(id: string) {
		return await this.postsRepository.deletePostById(id);
	}

	async updatePostById(id: string, title: string, shortDescription: string, content: string) {
		return await this.postsRepository.updatePostById(id, title, shortDescription, content);
	}

	async deleteAll() {
		return await this.postsRepository.deleteAll();
	}

	async addLikePostById(postId: string, userId: string, likeStatus: string) {
		return this.likesService.createLike(postId, userId, likeStatus);
		// await this.likesService.createLike(postId, userId, likeStatus);
		// const foundedPost = await this.findPostById(postId, userId);
		// const updatedPost = await this.likesService.getLikesInfoForPost(foundedPost, userId);
		// return await this.postsRepository.updateLikesInfoByPost(postId, updatedPost);
	}
}
