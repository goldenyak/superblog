import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { v4 as uuidv4 } from 'uuid';
import { CreatePostsDto } from './dto/create-post.dto';
import { BlogsService } from '../blogs/blogs.service';
import { CommentsService } from '../comments/comments.service';
import { Posts } from './schemas/posts.schemas';
import { LikesService } from '../likes/likes.service';

@Injectable()
export class PostsService {
	constructor(
		private readonly postsRepository: PostsRepository,
		private readonly likesService: LikesService,
		@Inject(forwardRef(() => BlogsService)) private readonly blogsService: BlogsService,
		@Inject(forwardRef(() => CommentsService)) private readonly commentsService: CommentsService,
	) {}

	async create(dto: CreatePostsDto) {
		const foundedBlog = await this.blogsService.findBlogById(dto.blogId);
		if (!foundedBlog) {
			return false;
		} else {
			const newPost: Posts = {
				id: uuidv4(),
				title: dto.title,
				shortDescription: dto.shortDescription,
				content: dto.content,
				blogId: foundedBlog.id,
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
				id: uuidv4(),
				title: dto.title,
				shortDescription: dto.shortDescription,
				content: dto.content,
				blogId: foundedBlog.id,
				blogName: foundedBlog.name,
				createdAt: new Date(),
				extendedLikesInfo: {
					likesCount: 0,
					dislikesCount: 0,
					myStatus: 'None',
					newestLikes: [],
				},
			}
		}
	}

	async getAllPosts(pageNumber: number, pageSize: number, sortBy: string, sortDirection: string, userId: string) {
		const countedAllPosts = await this.postsRepository.countAllPosts();
		const allPosts = await this.postsRepository.getAllPosts(
			(pageNumber = 1),
			(pageSize = 10),
			sortBy,
			sortDirection,
		);
		const result = [];
		for (const post of allPosts) {
			const mappedComment = await this.likesService.getLikesInfoForPost(post, userId);
			result.push(mappedComment);
		}

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
	) {
		const countedPostsByBlogId = await this.postsRepository.countPostsByBlogId(blogId);
		const allPostsByBlogId = await this.postsRepository.getAllPostsByBlogId(
			(pageNumber = 1),
			(pageSize = 10),
			sortBy,
			sortDirection,
			blogId,
		);
		return {
			pagesCount: pageNumber,
			page: pageNumber,
			pageSize: pageSize,
			totalCount: countedPostsByBlogId,
			items: allPostsByBlogId,
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
		await this.likesService.createLike(postId, userId, likeStatus);
		const foundedPost = await this.findPostById(postId, userId);
		const updatedPost = await this.likesService.getLikesInfoForPost(foundedPost, userId);
		return await this.postsRepository.updateLikesInfoByPost(postId, updatedPost);
	}


}
