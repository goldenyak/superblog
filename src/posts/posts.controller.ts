import {
	Body,
	Controller,
	Delete,
	ForbiddenException,
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
import { PostsService } from './posts.service';
import { CreatePostsDto } from './dto/create-post.dto';
import { NOT_FOUND_BLOG_ERROR } from '../blogs/constants/blogs.constants';
import { NOT_FOUND_POST_ERROR } from './constants/posts.constants';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { CommentsService } from '../comments/comments.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Request } from 'express';
import { UsersService } from '../users/users.service';
import { BasicAuthGuard } from '../guards/basic-auth.guard';
import { AuthService } from '../auth/auth.service';
import { LikePostDto } from './dto/like-post.dto';
import { PostsQueryParams } from "./dto/posts-query.dto";

@Controller('posts')
export class PostsController {
	constructor(
		private readonly postsService: PostsService,
		private readonly commentsService: CommentsService,
		private readonly usersService: UsersService,
		private readonly authService: AuthService,
	) {}

	@UseGuards(BasicAuthGuard)
	@Post()
	async create(@Body() dto: CreatePostsDto) {
		return await this.postsService.create(dto);
	}

	@UseGuards(JwtAuthGuard)
	@Post(':postId/comments')
	async createCommentByPostId(
		@Param('postId') postId: string,
		@Body() dto: CreateCommentDto,
		@Req() req: Request,
	) {
		const user = await this.usersService.findUserById(req.user.id);
		if (!user) {
			throw new HttpException('такого юзера не существует', HttpStatus.NOT_FOUND);
		}
		const postById = await this.postsService.findPostById(postId);
		if (!postById) {
			throw new HttpException('not found post by ID', HttpStatus.NOT_FOUND);
		} else {
			return await this.commentsService.create(dto, postId, user);
		}
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
			const result = await this.authService.checkRefreshToken(token);
			if (result) {
				currentUserId = result.id;
			}
		}
		return this.postsService.getAllPosts(queryParams, currentUserId);
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
			const result = await this.authService.checkRefreshToken(token);
			if (result) {
				currentUserId = result.id;
			}
		}
		const postById = await this.postsService.findPostById(id);
		if (!postById) {
			throw new HttpException(NOT_FOUND_POST_ERROR, HttpStatus.NOT_FOUND)
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

	@Get(':id')
	async findPostById(
		@Param('id') id: string,
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
		const foundedPost = await this.postsService.findPostById(id, currentUserId);
		if (!foundedPost) {
			throw new HttpException(NOT_FOUND_POST_ERROR, HttpStatus.NOT_FOUND);
		}
		return foundedPost;
	}

	@UseGuards(BasicAuthGuard)
	@HttpCode(204)
	@Delete(':id')
	async deletePostById(@Param('id') id: string) {
		const deletedPost = await this.postsService.deletePostById(id);
		if (!deletedPost) {
			throw new HttpException(NOT_FOUND_POST_ERROR, HttpStatus.NOT_FOUND);
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
			throw new HttpException(NOT_FOUND_BLOG_ERROR, HttpStatus.NOT_FOUND);
		}
		return;
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(204)
	@Put(':id/like-status')
	async addLikePostById(@Body() dto: LikePostDto, @Param('id') id: string, @Req() req: Request) {
		const postById = await this.postsService.findPostById(id);
		const user = await this.usersService.findUserById(req.user.id);
		if (!postById) {
			throw new HttpException(NOT_FOUND_POST_ERROR, HttpStatus.NOT_FOUND);
		}
		if (!user) {
			throw new ForbiddenException();
		}
		return await this.postsService.addLikePostById(postById.id, user.id, dto.likeStatus);
	}
}
