import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { v4 as uuidv4 } from 'uuid';
import { CreatePostsDto } from './dto/create-post.dto';
import { BlogsService } from '../blogs/blogs.service';
import { CommentsService } from '../comments/comments.service';

@Injectable()
export class PostsService {
	constructor(
		private readonly postsRepository: PostsRepository,
		@Inject(forwardRef(() => BlogsService)) private readonly blogsService: BlogsService,
		@Inject(forwardRef(() => CommentsService)) private readonly commentsService: CommentsService,
	) {}

	async create(dto: CreatePostsDto) {
		const foundedBlog = await this.blogsService.findBlogById(dto.blogId);
		if (!foundedBlog) {
			return false;
		} else {
			const newPost = {
				id: uuidv4(),
				title: dto.title,
				shortDescription: dto.shortDescription,
				content: dto.content,
				blogId: foundedBlog.id,
				blogName: foundedBlog.name,
				createdAt: new Date(),
			};
			return await this.postsRepository.create(newPost);
		}
	}

	async getAllPosts(pageNumber: number, pageSize: number, sortBy: string, sortDirection: string) {
		const countedAllPosts = await this.postsRepository.countAllPosts();
		const allPosts = await this.postsRepository.getAllPosts(
			(pageNumber = 1),
			(pageSize = 10),
			sortBy,
			sortDirection,
		);
		return {
			pagesCount: pageNumber,
			page: pageNumber,
			pageSize: pageSize,
			totalCount: countedAllPosts,
			items: allPosts,
		};
	}

	async getAllCommentsByPostId(
		pageNumber: number,
		pageSize: number,
		sortBy: string,
		sortDirection: string,
		postId: string,
	) {
		return await this.commentsService.getAllCommentsByPostId(
			pageNumber,
			pageSize,
			sortBy,
			sortDirection,
			postId,
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

	async findPostById(id: string) {
		return await this.postsRepository.findPostById(id);
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
}
