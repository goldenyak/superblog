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
import { CreatePostByBlogIdUseCase } from '../../public/blogs/use-cases/create-post-by-blog-id.use-case';
import { CreateBlogsDto } from '../../public/blogs/dto/create-blogs.dto';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { CreatePostsDto } from '../../public/posts/dto/create-post.dto';
import { UpdateBlogDto } from '../../public/blogs/dto/update-blog.dto';
import { BlogsQueryParams } from '../../public/blogs/dto/blogs-query.dto';
import { GetAllBlogsForCurrentUserUseCase } from '../use-cases/get-all-blogs-for-current-user.use-case';
import { UpdatePostDto } from '../../public/posts/dto/update-post.dto';
import { FindPostByIdUseCase } from '../../public/blogs/use-cases/find-post-by-id.use-case';
import { CommandBus } from "@nestjs/cqrs";
import { GetBlogByIdWithOwnerInfoCommand } from "../../public/blogs/use-cases/get-blog-by-id-with-owner-info.use-case";

@Controller('blogger/blogs')
export class BlogsController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly blogsService: BlogsService,
		private readonly blogsRepository: BlogsRepository,
		private readonly createBlogUseCase: CreateBlogUseCase,
		private readonly getAllBlogsByUser: GetAllBlogsForCurrentUserUseCase,
		private readonly createPost: CreatePostByBlogIdUseCase,
		private readonly findPostById: FindPostByIdUseCase,
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
		if (foundedBlog.bloggerOwnerInfo.userId!== req.user.id) {
			throw new ForbiddenException();
		}
		return await this.createPost.execute(dto, foundedBlog);
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(204)
	@Put(':id')
	async updateBlogById(@Body() dto: UpdateBlogDto, @Param('id') id: string, @Req() req: Request) {
		const foundedBlog = await this.blogsService.findBlogByIdWithBloggerInfo(id);
		if (!foundedBlog) {
			throw new NotFoundException();
		}
		if (foundedBlog.bloggerOwnerInfo.userId !== req.user.id) {
			throw new ForbiddenException();
		}
		return  await this.blogsService.updateBlogById(id, dto.name, dto.description, dto.websiteUrl);
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(204)
	@Delete(':id')
	async deleteBlogById(@Param('id') id: string, @Req() req: Request) {
		const foundedBlog = await this.commandBus.execute(new GetBlogByIdWithOwnerInfoCommand(id));
		if (!foundedBlog) {
			throw new NotFoundException();
		}
		if (foundedBlog.bloggerOwnerInfo.userId !== req.user.id) {
			throw new ForbiddenException();
		}
		return await this.blogsService.deleteBlogById(id);
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(204)
	@Put(':blogId/posts/:postId')
	async updatePostForSpecifiedBlog(
		@Body() dto: UpdatePostDto,
		@Param('blogId') blogId: string,
		@Param('postId') postId: string,
		@Req() req: Request,
	) {
		const foundedBlog = await this.commandBus.execute(new GetBlogByIdWithOwnerInfoCommand(blogId));
		if (!foundedBlog) {
			throw new NotFoundException();
		}
		if (foundedBlog.bloggerOwnerInfo.userId !== req.user.id) {
			throw new ForbiddenException();
		}
		const foundedPost = await this.findPostById.execute(postId);
		if (!foundedPost) {
			throw new NotFoundException();
		}
		if (foundedPost.blogId !== blogId) {
			throw new ForbiddenException();
		}
		return await this.blogsService.updatePostForSpecifiedBlog(postId, dto);
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(204)
	@Delete(':blogId/posts/:postId')
	async deletePostForSpecifiedBlog(
		@Param('blogId') blogId: string,
		@Param('postId') postId: string,
		@Req() req: Request,
	) {
		const foundedBlog = await this.blogsService.findBlogByIdWithBloggerInfo(blogId);
		if (!foundedBlog) {
			throw new NotFoundException();
		}
		if (foundedBlog.bloggerOwnerInfo.userId !== req.user.id) {
			throw new ForbiddenException();
		}
		const foundedPost = await this.findPostById.execute(postId);
		if (!foundedPost) {
			throw new NotFoundException();
		}
		if (foundedPost.blogId !== blogId) {
			throw new ForbiddenException();
		}
		return await this.blogsService.deletePostForSpecifiedBlog(postId);
	}
}
