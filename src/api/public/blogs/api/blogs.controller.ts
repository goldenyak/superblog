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
import { CreateBlogUseCase } from '../use-cases/create-blog.use-case';
import { CreatePostByBlogIdUseCase } from '../use-cases/create-post-by-blog-id.use-case';
import { BlogsRepository } from '../blogs.repository';
import { CommandBus } from '@nestjs/cqrs';
import { CheckUserIdByTokenCommand } from '../../auth/use-cases/check-user-by-token.use-case';
import { GetAllPostsByBlogIdCommand } from '../../posts/use-cases/get-all-posts-by-blog-id.use-case';
import { GetBlogByIdCommand } from '../use-cases/get-blog-by-id.use-case';
import { GetAllBlogsCommand } from "../use-cases/get-all-blogs.use-case";

@Controller('blogs')
export class PublicBlogsController {
	constructor(private readonly commandBus: CommandBus) {}

	@HttpCode(200)
	@Get()
	async getBlogs(@Query() queryParams: BlogsQueryParams) {
		const commandOptions = {
			...queryParams,
			returnBanned: false
		}
		return await this.commandBus.execute(new GetAllBlogsCommand(commandOptions));
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
			const userId = await this.commandBus.execute(new CheckUserIdByTokenCommand(token));
			if (userId) {
				currentUserId = userId;
			}
		}
		const blogById = await this.commandBus.execute(new GetBlogByIdCommand(blogId));
		if (!blogById) {
			throw new NotFoundException();
		}
		return await this.commandBus.execute(
			new GetAllPostsByBlogIdCommand(queryParams, blogId, currentUserId),
		);
	}

	@Get(':id')
	async findBlogById(@Param('id') id: string) {
		return  await this.commandBus.execute(new GetBlogByIdCommand(id));
		// if (!blog) {
		// 	throw new NotFoundException();
		// }
		// return blog;
	}
}
