import { forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BlogsRepository } from './blogs.repository';
import { CreateBlogsDto } from './dto/create-blogs.dto';
import { v4 as uuidv4 } from 'uuid';
import { CreatePostsDto } from '../posts/dto/create-post.dto';
import { PostsService } from '../posts/posts.service';
import { Blogs } from './schemas/blogs.schema';
import { BlogsQueryParams } from './dto/blogs-query.dto';
import { UpdatePostDto } from "../posts/dto/update-post.dto";

@Injectable()
export class BlogsService {
	constructor(
		private readonly blogsRepository: BlogsRepository,
		@Inject(forwardRef(() => PostsService)) private readonly postsService: PostsService,
	) {}

	async findBlogById(id: string) {
		try {
			const foundedBlog = await this.blogsRepository.findBlogById(id);
			return {
				id: foundedBlog.id,
				name: foundedBlog.name,
				description: foundedBlog.description,
				websiteUrl: foundedBlog.websiteUrl,
				createdAt: foundedBlog.createdAt,
				isMembership: foundedBlog.isMembership
			}
		} catch (e) {
			throw new NotFoundException()
		}
	}


	async findBlogByIdWithBloggerInfo(id: string) {
		return  await this.blogsRepository.findBlogById(id);
	}

	async deleteBlogById(id: string) {
		return await this.blogsRepository.deleteBlogById(id);
	}

	async updateBlogById(id: string, name: string, description: string, websiteUrl: string) {
		return await this.blogsRepository.updateBlogById(id, name, description, websiteUrl);
	}

	async updatePostForSpecifiedBlog(postId: string, {title, shortDescription, content}: UpdatePostDto) {
		return await this.postsService.updatePostById(postId, title, shortDescription, content);
	}

	async deletePostForSpecifiedBlog(postId: string) {
		return this.postsService.deletePostById(postId);
	}

	async deleteAll() {
		return await this.blogsRepository.deleteAll();
	}

}
