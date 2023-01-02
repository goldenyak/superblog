import {
	Body,
	Controller,
	Delete, ForbiddenException, Get,
	HttpCode,
	NotFoundException,
	Param,
	Post,
	Put, Query,
	Req,
	UseGuards
} from "@nestjs/common";
import { Request } from 'express';
import { BlogsService } from "../../public/blogs/blogs.service";
import { BlogsRepository } from "../../public/blogs/blogs.repository";
import { CreateBlogUseCase } from "../../public/blogs/use-cases/create-blog.use-case";
import { GetAllBlogsUseCase } from "../../public/blogs/use-cases/get-all-blogs.use-case";
import { GetAllPostByBlogIdUseCase } from "../../public/blogs/use-cases/get-all-posts.use-case";
import { CreatePostByBlogIdUseCase } from "../../public/blogs/use-cases/create-post-by-blog-id.use-case";
import { CreateBlogsDto } from "../../public/blogs/dto/create-blogs.dto";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { BasicAuthGuard } from "../../../guards/basic-auth.guard";
import { CreatePostsDto } from "../../public/posts/dto/create-post.dto";
import { UpdateBlogDto } from "../../public/blogs/dto/update-blog.dto";
import { BlogsQueryParams } from "../../public/blogs/dto/blogs-query.dto";
import { GetAllBlogsForCurrentUserUseCase } from "../use-cases/get-all-blogs-for-current-user.use-case";

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
	async createBlog(@Body() dto: CreateBlogsDto, @Req() req: Request ) {
		const {id, login} = req.user
		return await this.createBlogUseCase.execute(dto, id, login);
	}

	@UseGuards(BasicAuthGuard)
	@Post(':blogId/posts')
	async createPostByBlogId(@Param('blogId') blogId: string, @Body() dto: CreatePostsDto) {
		const blogById = await this.blogsRepository.findBlogById(blogId);
		if (!blogById) {
			throw new NotFoundException();
		}
		return await this.createPost.execute(dto, blogById.id);
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(204)
	@Delete(':id')
	async deleteBlogById(@Param('id') id: string, @Req() req: Request) {
		const foundedBlog = await this.blogsService.findBlogById(id)
		if (foundedBlog.bloggerInfo.id !== req.user.id) {
			throw new ForbiddenException()
		}
		const deletedBlog = await this.blogsService.deleteBlogById(id);
		if (!deletedBlog) {
			throw new NotFoundException();
		}
		return;
	}

	@UseGuards(BasicAuthGuard)
	@HttpCode(204)
	@Put(':id')
	async updateBlogById(@Body() dto: UpdateBlogDto, @Param('id') id: string, @Req() req: Request) {
		const foundedBlog = await this.blogsService.findBlogById(id)
		if (foundedBlog.bloggerInfo.id !== req.user.id) {
			throw new ForbiddenException()
		}
		const blog = await this.blogsService.updateBlogById(
			id,
			dto.name,
			dto.description,
			dto.websiteUrl,
		);
		if (!blog) {
			throw new NotFoundException();
		}
		return;
	}
}
