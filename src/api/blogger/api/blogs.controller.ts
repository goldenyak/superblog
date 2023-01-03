import {
	Body,
	Controller,
	Delete,
	ForbiddenException,
	Get,
	HttpCode,
	NotFoundException,
	Param,
	Post,
	Put,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { BlogsService } from '../../public/blogs/blogs.service';
import { BlogsRepository } from '../../public/blogs/blogs.repository';
import { CreateBlogUseCase } from '../../public/blogs/use-cases/create-blog.use-case';
import { GetAllPostByBlogIdUseCase } from '../../public/blogs/use-cases/get-all-posts.use-case';
import { CreatePostByBlogIdUseCase } from '../../public/blogs/use-cases/create-post-by-blog-id.use-case';
import { CreateBlogsDto } from '../../public/blogs/dto/create-blogs.dto';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { CreatePostsDto } from '../../public/posts/dto/create-post.dto';
import { UpdateBlogDto } from '../../public/blogs/dto/update-blog.dto';
import { BlogsQueryParams } from '../../public/blogs/dto/blogs-query.dto';
import { GetAllBlogsForCurrentUserUseCase } from '../use-cases/get-all-blogs-for-current-user.use-case';
import { UpdatePostDto } from '../../public/posts/dto/update-post.dto';

@Controller('blogger/blogs')
export class BlogsController {
	constructor(
		private readonly blogsService: BlogsService,
		private readonly blogsRepository: BlogsRepository,
		private readonly createBlogUseCase: CreateBlogUseCase,
		private readonly getAllBlogsByUser: GetAllBlogsForCurrentUserUseCase,
		private readonly getAllPosts: GetAllPostByBlogIdUseCase,
		private readonly createPost: CreatePostByBlogIdUseCase,
	) {}

	@UseGuards(JwtAuthGuard)
	@HttpCode(200)
	@Get()
	async getAllBlogsForCurrentUser(@Query() queryParams: BlogsQueryParams, @Req() req: Request) {
		return await this.getAllBlogsByUser.execute(queryParams, req.user.id);
	}

	@UseGuards(JwtAuthGuard)
	@Post()
	async createBlog(@Body() dto: CreateBlogsDto, @Req() req: Request) {
		const { id, login } = req.user;
		return await this.createBlogUseCase.execute(dto, id, login);
	}

	@UseGuards(JwtAuthGuard)
	@Post(':blogId/posts')
	async createPostByBlogId(
		@Param('blogId') blogId: string,
		@Body() dto: CreatePostsDto,
		@Req() req: Request,
	) {
		const foundedBlog = await this.blogsRepository.findBlogById(blogId);
		if (!foundedBlog) {
			throw new NotFoundException();
		}
		if (foundedBlog.bloggerInfo.id !== req.user.id) {
			throw new ForbiddenException();
		}
		return await this.createPost.execute(dto, foundedBlog.id);
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(204)
	@Delete(':id')
	async deleteBlogById(@Param('id') id: string, @Req() req: Request) {
		const foundedBlog = await this.blogsService.findBlogById(id);
		if (foundedBlog.bloggerInfo.id !== req.user.id) {
			throw new ForbiddenException();
		}
		const deletedBlog = await this.blogsService.deleteBlogById(id);
		if (!deletedBlog) {
			throw new NotFoundException();
		}
		return;
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(204)
	@Delete(':blogId/posts/:postId')
	async deletePostForSpecifiedBlog(
		@Param('blogId') blogId: string,
		@Param('postId') postId: string,
		@Req() req: Request,
	) {
		const foundedBlog = await this.blogsService.findBlogById(blogId);
		if (!foundedBlog) {
			throw new NotFoundException();
		}
		if (foundedBlog.bloggerInfo.id !== req.user.id) {
			throw new ForbiddenException();
		}
		const deletedPost = await this.blogsService.deletePostForSpecifiedBlog(postId, blogId);
		if (!deletedPost) {
			throw new NotFoundException();
		}
		return;
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(204)
	@Put(':id')
	async updateBlogById(@Body() dto: UpdateBlogDto, @Param('id') id: string, @Req() req: Request) {
		const foundedBlog = await this.blogsService.findBlogById(id);
		if (!foundedBlog) {
			throw new NotFoundException();
		}
		if (foundedBlog.bloggerInfo.id !== req.user.id) {
			throw new ForbiddenException();
		}
		await this.blogsService.updateBlogById(id, dto.name, dto.description, dto.websiteUrl);
		return;
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(204)
	@Put(':id')
	async updatePostForSpecifiedBlog(
		@Body() dto: UpdatePostDto,
		@Param('blogId') blogId: string,
		@Param('postId') postId: string,
		@Req() req: Request,
	) {
		const foundedBlog = await this.blogsService.findBlogById(blogId);
		if (!foundedBlog) {
			throw new NotFoundException();
		}
		if (foundedBlog.bloggerInfo.id !== req.user.id) {
			throw new ForbiddenException();
		}
		return await this.blogsService.updatePostForSpecifiedBlog(postId, dto);
	}
}
