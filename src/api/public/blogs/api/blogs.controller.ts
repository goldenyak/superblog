import {
	Controller,
	Get,
	Headers,
	HttpCode,
	NotFoundException,
	Param,
	Query,
	Req,
} from '@nestjs/common';
import { BlogsService } from '../blogs.service';
import { Request } from 'express';
import { AuthService } from '../../auth/auth.service';
import { BlogsQueryParams } from '../dto/blogs-query.dto';
import { CreateBlogUseCase } from "../use-cases/create-blog.use-case";
import { CreatePostByBlogIdUseCase } from "../use-cases/create-post-by-blog-id.use-case";
import { BlogsRepository } from "../blogs.repository";
import { CommandBus } from "@nestjs/cqrs";
import { CheckUserIdByTokenCommand } from "../../auth/use-cases/check-user-by-token.use-case";
import { GetAllPostsByBlogIdCommand } from "../../posts/use-cases/get-all-posts.use-case";

@Controller('blogs')
export class PublicBlogsController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly blogsService: BlogsService,
		private readonly blogsRepository: BlogsRepository,
		private readonly createBlogUseCase: CreateBlogUseCase,
		// private readonly getAllBlogs: GetAllBlogsUseCase,
		private readonly createPost: CreatePostByBlogIdUseCase,
		private readonly authService: AuthService,
	) {}

	// @HttpCode(200)
	// @Get()
	// async getBlogs(@Query() queryParams: BlogsQueryParams) {
	// 	return await this.getAllBlogs.execute(queryParams);
	// }

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
			const userId = await this.commandBus.execute(new CheckUserIdByTokenCommand(token));
			if (userId) {
				currentUserId = userId;
			}
		}
		const blogById = await this.blogsRepository.findBlogById(blogId);
		if (!blogById) {
			throw new NotFoundException();
		}
		return await this.commandBus.execute(new GetAllPostsByBlogIdCommand(queryParams, blogId, currentUserId));
	}

	@Get(':id')
	async findBlogById(@Param('id') id: string) {
		return  await this.blogsService.findBlogById(id);
	}
}
