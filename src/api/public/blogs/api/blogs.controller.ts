import {
	Body,
	Controller,
	Delete,
	Get,
	Headers,
	HttpCode,
	NotFoundException,
	Param,
	Post,
	Put,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';
import { CreateBlogsDto } from '../dto/create-blogs.dto';
import { BlogsService } from '../blogs.service';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { CreatePostsDto } from '../../posts/dto/create-post.dto';
import { BasicAuthGuard } from '../../../../guards/basic-auth.guard';
import { Request } from 'express';
import { AuthService } from '../../auth/auth.service';
import { BlogsQueryParams } from '../dto/blogs-query.dto';
import { CreateBlogUseCase } from "../use-cases/create-blog.use-case";
import { GetAllBlogsUseCase } from "../use-cases/get-all-blogs.use-case";
import { CreatePostByBlogIdUseCase } from "../use-cases/create-post-by-blog-id.use-case";
import { BlogsRepository } from "../blogs.repository";
import { GetAllPostByBlogIdUseCase } from "../use-cases/get-all-posts.use-case";
import { JwtAuthGuard } from "../../../../guards/jwt-auth.guard";

@Controller('blogs')
export class PublicBlogsController {
	constructor(
		private readonly blogsService: BlogsService,
		private readonly blogsRepository: BlogsRepository,
		private readonly createBlogUseCase: CreateBlogUseCase,
		private readonly getAllBlogs: GetAllBlogsUseCase,
		private readonly getAllPosts: GetAllPostByBlogIdUseCase,
		private readonly createPost: CreatePostByBlogIdUseCase,
		private readonly authService: AuthService,
	) {}

	@HttpCode(200)
	@Get()
	async getBlogs(@Query() queryParams: BlogsQueryParams) {
		return await this.getAllBlogs.execute(queryParams);
	}

	@HttpCode(200)
	@Get(':blogId/posts')
	async getAllPostsByBlogId(
		@Param('blogId') blogId: string,
		@Query() queryParams: BlogsQueryParams,
		@Req() req: Request,
		@Headers('authorization') header: string,
	) {
		let currentUserId;
		if (req.headers.authorization && req.headers.authorization !== 'Basic') {
			const token = req.headers.authorization.split(' ')[1];
			const userId = await this.authService.checkUserIdByToken(token);
			if (userId) {
				currentUserId = userId;
			}
		}
		const blogById = await this.blogsRepository.findBlogById(blogId);
		if (!blogById) {
			throw new NotFoundException();
		}
		return await this.getAllPosts.execute(queryParams, blogId, currentUserId);
	}

	@Get(':id')
	async findBlogById(@Param('id') id: string) {
		const foundedBlog = await this.blogsService.findBlogById(id);
		if (!foundedBlog) {
			throw new NotFoundException();
		}
		return foundedBlog;
	}
}
