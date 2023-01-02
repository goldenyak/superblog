import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { BlogsRepository } from './blogs.repository';
import { CreateBlogsDto } from './dto/create-blogs.dto';
import { v4 as uuidv4 } from 'uuid';
import { CreatePostsDto } from '../posts/dto/create-post.dto';
import { PostsService } from '../posts/posts.service';
import { Blogs } from './schemas/blogs.schema';
import { BlogsQueryParams } from './dto/blogs-query.dto';

@Injectable()
export class BlogsService {
	constructor(
		private readonly blogsRepository: BlogsRepository,
		@Inject(forwardRef(() => PostsService)) private readonly postsService: PostsService,
	) {}




	async findBlogById(id: string) {
		return this.blogsRepository.findBlogById(id);
	}

	async deleteBlogById(id: string) {
		return await this.blogsRepository.deleteBlogById(id);
	}

	async updateBlogById(id: string, name: string, description: string, websiteUrl: string) {
		return await this.blogsRepository.updateBlogById(id, name, description, websiteUrl);
	}

	async deleteAll() {
		return await this.blogsRepository.deleteAll();
	}
}
