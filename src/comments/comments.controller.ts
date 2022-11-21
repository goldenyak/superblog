import {
	Body,
	Controller,
	Delete,
	ForbiddenException,
	Get,
	HttpCode,
	HttpException,
	HttpStatus,
	Param,
	Post,
	Put,
	Req,
	UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { NOT_FOUND_COMMENT_ERROR } from './constants/comments.constants';
import { Request } from 'express';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { BasicAuthGuard } from '../guards/basic-auth.guard';
import { LikeCommentDto } from './dto/like-comment.dto';
import { log } from 'util';
import { AuthService } from '../auth/auth.service';

@Controller('comments')
export class CommentsController {
	constructor(
		private readonly commentsService: CommentsService,
		private readonly usersService: UsersService,
		private readonly authService: AuthService,
	) {}

	@UseGuards(JwtAuthGuard)
	@HttpCode(200)
	@Get(':id')
	async findCommentById(@Param('id') id: string, @Req() req: Request) {
		let currentUserId;
		console.log(req.user);
		if (req.user) {
			currentUserId = req.user.id;
		}
		const commentById = await this.commentsService.findCommentById(id, currentUserId);
		if (!commentById) {
			throw new HttpException(NOT_FOUND_COMMENT_ERROR, HttpStatus.NOT_FOUND);
		}
		return commentById;
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(204)
	@Delete(':id')
	async deleteCommentById(@Param('id') id: string, @Req() req: Request) {
		const commentById = await this.commentsService.findCommentById(id);
		const user = await this.usersService.findUserById(req.user.id);
		if (!commentById) {
			throw new HttpException(NOT_FOUND_COMMENT_ERROR, HttpStatus.NOT_FOUND);
		}
		if (!user) {
			throw new ForbiddenException();
		}
		if (user.id === commentById.userId) {
			return await this.commentsService.deleteCommentById(id);
		}
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(204)
	@Put(':id')
	async updateCommentById(
		@Body() dto: UpdateCommentDto,
		@Param('id') id: string,
		@Req() req: Request,
	) {
		const commentById = await this.commentsService.findCommentById(id);
		const user = await this.usersService.findUserById(req.user.id);

		if (!commentById) {
			throw new HttpException(NOT_FOUND_COMMENT_ERROR, HttpStatus.NOT_FOUND);
		}
		if (!user) {
			throw new ForbiddenException();
		}
		if (user.id === commentById.userId) {
			return await this.commentsService.updateCommentById(id, dto.content);
		}
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(204)
	@Put(':id/like-status')
	async addLikeCommentById(
		@Body() dto: LikeCommentDto,
		@Param('id') id: string,
		@Req() req: Request,
	) {
		const commentById = await this.commentsService.findCommentById(id);
		const user = await this.usersService.findUserById(req.user.id);
		if (!commentById) {
			throw new HttpException(NOT_FOUND_COMMENT_ERROR, HttpStatus.NOT_FOUND);
		}
		if (!user) {
			throw new ForbiddenException();
		}
		return await this.commentsService.addReactionByParentId(id, user.id, dto.likeStatus);
	}
}
