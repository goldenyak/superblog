import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../blogs/blogs.repository';
import { PostsRepository } from './posts.repository';
import { CreateBlogsDto } from '../blogs/dto/create-blogs.dto';
import { v4 as uuidv4 } from 'uuid';
import { CreatePostsDto } from './dto/create-post.dto';
import { BlogsService } from '../blogs/blogs.service';

@Injectable()
export class PostsService {
	constructor(
		private readonly postsRepository: PostsRepository,
		private readonly blogsService: BlogsService,
	) {}

	async create(dto: CreatePostsDto) {
		const foundedBlog = await this.blogsService.findBlogById(dto.blogId);
		if (foundedBlog) {
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

	async getAllPosts(
		pageNumber: number,
		pageSize: number,
		sortBy: string,
		sortDirection: string,
	) {
		const countPosts = await this.postsRepository.countPosts();
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
			totalCount: countPosts,
			items: allPosts,
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
}
