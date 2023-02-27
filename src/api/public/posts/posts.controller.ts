import {
	Body,
	Controller,
	Delete,
	ForbiddenException,
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
import { PostsService } from './posts.service';
import { CreatePostsDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { CommentsService } from '../comments/comments.service';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { Request } from 'express';
import { UsersService } from '../users/users.service';
import { BasicAuthGuard } from '../../../guards/basic-auth.guard';
import { LikePostDto } from './dto/like-post.dto';
import { PostsQueryParams } from './dto/posts-query.dto';
import { CheckRefreshTokenCommand } from '../auth/use-cases/check-refresh-token.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { FindUserByIdCommand } from '../users/use-cases/find-user-by-id.use-case';
import { log } from 'util';
import { GetBlogByIdCommand } from '../blogs/use-cases/get-blog-by-id.use-case';
import { GetBlogByIdWithOwnerInfoCommand } from "../blogs/use-cases/get-blog-by-id-with-owner-info.use-case";

@Controller('posts')
export class PostsController {
	constructor(
		private readonly postsService: PostsService,
		private readonly commentsService: CommentsService,
		private readonly usersService: UsersService,
		private readonly commandBus: CommandBus,
	) {}

	@UseGuards(BasicAuthGuard)
	@Post()
	async create(@Body() dto: CreatePostsDto) {
		const foundedBlog = await this.commandBus.execute(new GetBlogByIdWithOwnerInfoCommand(dto.blogId));
		if (!foundedBlog) {
			throw new NotFoundException();
		}
		return await this.postsService.create(dto, foundedBlog);
	}

	@HttpCode(200)
	@Get()
	async getAllPosts(
		@Query() queryParams: PostsQueryParams,
		@Req() req: Request,
		@Headers('authorization') header: string,
	) {
		let currentUserId;
		if (req.headers.authorization) {
			const token = req.headers.authorization.split(' ')[1];
			const result = await this.commandBus.execute(new CheckRefreshTokenCommand(token));
			if (result) {
				currentUserId = result.id;
			}
		}
		return this.postsService.getAllPosts(queryParams, currentUserId);
	}

	@Get(':id')
	async findPostById(
		@Param('id') id: string,
		@Req() req: Request,
		@Headers('authorization') header: string,
	) {
		let currentUserId = null;
		return await this.postsService.findPostById(id);

		// let currentUserId;
		// if (req.headers.authorization) {
		// 	const token = req.headers.authorization.split(' ')[1];
		// 	const result = await this.authService.checkRefreshToken(token);
		// 	if (result) {
		// 		currentUserId = result.id;
		// 	}
		// }
	}

	@UseGuards(JwtAuthGuard)
	@Post(':postId/comments')
	async createCommentByPostId(
		@Param('postId') postId: string,
		@Body() dto: CreateCommentDto,
		@Req() req: Request,
	) {
		const user = await this.commandBus.execute(new FindUserByIdCommand(req.user.id));
		if (!user) {
			throw new NotFoundException();
		}
		const postById = await this.postsService.findPostById(postId);
		if (!postById) {
			throw new NotFoundException();
		} else {
			return await this.commentsService.create(dto, postId, user);
		}
	}

	@HttpCode(200)
	@Get(':id/comments')
	async getAllCommentsByPostId(
		@Param('id') id: string,
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
			const result = await this.commandBus.execute(new CheckRefreshTokenCommand(token));
			if (result) {
				currentUserId = result.id;
			}
		}
		const postById = await this.postsService.findPostById(id);
		if (!postById) {
			throw new NotFoundException();
		}
		return await this.postsService.getAllCommentsByPostId(
			pageNumber,
			pageSize,
			sortBy,
			sortDirection,
			id,
			currentUserId,
		);
	}

	@UseGuards(BasicAuthGuard)
	@HttpCode(204)
	@Delete(':id')
	async deletePostById(@Param('id') id: string) {
		const deletedPost = await this.postsService.deletePostById(id);
		if (!deletedPost) {
			throw new NotFoundException();
		}
		return;
	}

	@UseGuards(BasicAuthGuard)
	@HttpCode(204)
	@Put(':id')
	async updatePostById(@Body() dto: UpdatePostDto, @Param('id') id: string) {
		const post = await this.postsService.updatePostById(
			id,
			dto.title,
			dto.shortDescription,
			dto.content,
		);
		if (!post) {
			throw new NotFoundException();
		}
		return;
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(204)
	@Put(':id/like-status')
	async addLikePostById(@Body() dto: LikePostDto, @Param('id') id: string, @Req() req: Request) {
		const postById = await this.postsService.findPostById(id);
		console.log('postById', postById);
		if (!postById) {
			console.log('postById', postById);
			// throw new NotFoundException();
		}
		const currentUser = await this.commandBus.execute(new FindUserByIdCommand(req.user.id));

		if (!currentUser || currentUser.banInfo.isBanned) {
			throw new ForbiddenException();
		}
		return await this.postsService.addLikePostById(postById.id, currentUser.id, dto.likeStatus);
	}
}
