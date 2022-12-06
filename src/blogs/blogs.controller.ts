import {
	Body,
	Controller,
	Delete,
	Get,
	Headers,
	HttpCode,
	HttpException,
	HttpStatus,
	Param,
	Post,
	Put,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';
import { CreateBlogsDto } from './dto/create-blogs.dto';
import { BlogsService } from './blogs.service';
import { NOT_FOUND_BLOG_ERROR } from './constants/blogs.constants';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CreatePostsDto } from '../posts/dto/create-post.dto';
import { BasicAuthGuard } from '../guards/basic-auth.guard';
import { NOT_FOUND_POST_ERROR } from '../posts/constants/posts.constants';
import { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { BlogsQueryParams } from './dto/blogs-query.dto';

@Controller('blogs')
export class BlogsController {
	constructor(
		private readonly blogsService: BlogsService,
		private readonly authService: AuthService,
	) {}

	@UseGuards(BasicAuthGuard)
	@Post()
	async create(@Body() dto: CreateBlogsDto) {
		return await this.blogsService.create(dto);
	}

	@UseGuards(BasicAuthGuard)
	@Post(':blogId/posts')
	async createPostByBlogId(@Param('blogId') blogId: string, @Body() dto: CreatePostsDto) {
		const blogById = await this.blogsService.findBlogById(blogId);
		if (!blogById) {
			throw new HttpException(NOT_FOUND_BLOG_ERROR, HttpStatus.NOT_FOUND);
		}
		return await this.blogsService.createPostByBlogId(dto, blogById.id);
	}

	@HttpCode(200)
	@Get()
	async getAllBlogs(@Query() queryParams: BlogsQueryParams) {
		return await this.blogsService.getAllBlogs(queryParams);
	}

	@HttpCode(200)
	@Get(':blogId/posts')
	async getAllPostsByBlogId(
		@Param('blogId') blogId: string,
		@Query('pageNumber') pageNumber: number,
		@Query('pageSize') pageSize: number,
		@Query('sortBy') sortBy: string,
		@Query('sortDirection') sortDirection: string,
		@Req() req: Request,
		@Headers('authorization') header: string,
	) {
		let currentUserId;
		if (req.headers.authorization) {
			const token = req.headers.authorization.split(' ')[1];
			const result = await this.authService.checkRefreshToken(token);
			if (result) {
				currentUserId = result.id;
			}
		}
		const blogById = await this.blogsService.findBlogById(blogId);
		if (!blogById) {
			throw new HttpException(NOT_FOUND_BLOG_ERROR, HttpStatus.NOT_FOUND);
		}
		return await this.blogsService.getAllPostsByBlogId(
			pageNumber,
			pageSize,
			sortBy,
			sortDirection,
			blogId,
			currentUserId,
		);
	}

	@Get(':id')
	async findBlogById(@Param('id') id: string) {
		const foundedBlog = await this.blogsService.findBlogById(id);
		if (!foundedBlog) {
			throw new HttpException(NOT_FOUND_BLOG_ERROR, HttpStatus.NOT_FOUND);
		}
		return foundedBlog;
	}

	@UseGuards(BasicAuthGuard)
	@HttpCode(204)
	@Delete(':id')
	async deleteBlogById(@Param('id') id: string) {
		const deletedBlog = await this.blogsService.deleteBlogById(id);
		if (!deletedBlog) {
			throw new HttpException(NOT_FOUND_BLOG_ERROR, HttpStatus.NOT_FOUND);
		}
		return;
	}

	@UseGuards(BasicAuthGuard)
	@HttpCode(204)
	@Put(':id')
	async updateBlogById(@Body() dto: UpdateBlogDto, @Param('id') id: string) {
		const blog = await this.blogsService.updateBlogById(id, dto.name, dto.websiteUrl);
		if (!blog) {
			throw new HttpException(NOT_FOUND_BLOG_ERROR, HttpStatus.NOT_FOUND);
		}
		return;
	}
}
