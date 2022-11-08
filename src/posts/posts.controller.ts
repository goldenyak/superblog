import {
	Body,
	Controller,
	Delete,
	Get,
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
import { UpdateBlogDto } from '../blogs/dto/update-blog.dto';
import { NOT_FOUND_POST_ERROR } from './constants/posts.constants';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { CommentsService } from '../comments/comments.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Request } from 'express';
import { UsersService } from "../users/users.service";

@Controller('posts')
export class PostsController {
	constructor(
		private readonly postsService: PostsService,
		private readonly commentsService: CommentsService,
		private readonly usersService: UsersService,
	) {}

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
		if(!user) {
			throw new HttpException('такого юзера не существует', HttpStatus.NOT_FOUND)
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
		@Query('pageNumber') pageNumber: number,
		@Query('pageSize') pageSize: number,
		@Query('sortBy') sortBy: string,
		@Query('sortDirection') sortDirection: string,
	) {
		return await this.postsService.getAllPosts(pageNumber, pageSize, sortBy, sortDirection);
	}

	@HttpCode(200)
	@Get(':id/comments')
	async getAllCommentsByPostId(
		@Param('id') id: string,
		@Query('pageNumber') pageNumber: number,
		@Query('pageSize') pageSize: number,
		@Query('sortBy') sortBy: string,
		@Query('sortDirection') sortDirection: string,
		@Query('postId') postId: string,
	) {
		const postById = await this.postsService.findPostById(id);
		console.log(postById);
		if (!postById) {
			throw new HttpException(NOT_FOUND_POST_ERROR, HttpStatus.NOT_FOUND);
		}
		return await this.postsService.getAllCommentsByPostId(
			pageNumber,
			pageSize,
			sortBy,
			sortDirection,
			postId,
		);
	}

	@Get(':id')
	async findPostById(@Param('id') id: string) {
		const foundedPost = await this.postsService.findPostById(id);
		if (!foundedPost) {
			throw new HttpException(NOT_FOUND_POST_ERROR, HttpStatus.NOT_FOUND);
		}
		return foundedPost;
	}

	@HttpCode(204)
	@Delete(':id')
	async deletePostById(@Param('id') id: string) {
		const deletedPost = await this.postsService.deletePostById(id);
		if (!deletedPost) {
			throw new HttpException(NOT_FOUND_POST_ERROR, HttpStatus.NOT_FOUND);
		}
		return;
	}

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
}
