import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { BlogsRepository } from './blogs.repository';
import { CreateBlogsDto } from './dto/create-blogs.dto';
import { v4 as uuidv4 } from 'uuid';
import { CreatePostsDto } from '../posts/dto/create-post.dto';
import { PostsService } from '../posts/posts.service';
import { Blogs } from './schemas/blogs.schema';

@Injectable()
export class BlogsService {
	constructor(
		private readonly blogsRepository: BlogsRepository,
		@Inject(forwardRef(() => PostsService)) private readonly postsService: PostsService,
	) {}

	async create(dto: CreateBlogsDto) {
		const newBlog = {
			id: uuidv4(),
			name: dto.name,
			description: dto.description,
			websiteUrl: dto.websiteUrl,
			createdAt: new Date(),
		};
		return await this.blogsRepository.create(newBlog);
	}

	async createPostByBlogId(blogById: Blogs, dto: CreatePostsDto) {
		const newPost = {
			id: uuidv4(),
			title: dto.title,
			shortDescription: dto.shortDescription,
			content: dto.content,
			blogId: blogById.id,
			blogName: blogById.name,
			createdAt: new Date(),
		};
		return await this.postsService.create(newPost);
	}

	async getAllBlogs(
		searchNameTerm: string,
		pageNumber: number,
		pageSize: number,
		sortBy: string,
		sortDirection: string,
	) {
		const countBlogs = await this.blogsRepository.countBlogs(searchNameTerm);
		const allBlogs = await this.blogsRepository.getAllBlogs(
			searchNameTerm,
			(pageNumber = 1),
			(pageSize = 10),
			sortBy,
			sortDirection,
		);
		return {
			pagesCount: pageNumber,
			page: pageNumber,
			pageSize: pageSize,
			totalCount: countBlogs,
			items: allBlogs,
		};
	}

	async getAllPostsByBlogId(
		pageNumber: number,
		pageSize: number,
		sortBy: string,
		sortDirection: string,
		blogId: string,
	) {
		return await this.postsService.getAllPostsByBlogId(
			pageNumber,
			pageSize,
			sortBy,
			sortDirection,
			blogId,
		);
	}

	async findBlogById(id: string) {
		return await this.blogsRepository.findBlogById(id);
	}

	async deleteBlogById(id: string) {
		return await this.blogsRepository.deleteBlogById(id);
	}

	async updateBlogById(id: string, name: string, youtubeUrl: string) {
		return await this.blogsRepository.updateBlogById(id, name, youtubeUrl);
	}

	async deleteAll() {
		return await this.blogsRepository.deleteAll();
	}
}
