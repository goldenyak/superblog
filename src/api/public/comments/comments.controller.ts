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
	NotFoundException,
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
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { LikeCommentDto } from './dto/like-comment.dto';
import { AuthService } from '../auth/auth.service';
import { FindUserByIdCommand } from "../users/use-cases/find-user-by-id.use-case";
import { CommandBus } from "@nestjs/cqrs";

@Controller('comments')
export class CommentsController {
	constructor(
		private readonly commentsService: CommentsService,
		private readonly usersService: UsersService,
		private readonly authService: AuthService,
		private readonly commandBus: CommandBus,
	) {}

	@HttpCode(200)
	@Get(':id')
	async findCommentById(
		@Param('id') id: string,
		@Req() req: Request,
		@Headers('authorization') header: string,
	) {
		return  await this.commentsService.findCommentById(id);
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(204)
	@Delete(':id')
	async deleteCommentById(@Param('id') id: string, @Req() req: Request) {
		const commentById = await this.commentsService.findCommentById(id);
		if (!commentById) {
			throw new NotFoundException();
		}
		if (req.user.id !== commentById.userId) {
			throw new ForbiddenException();
		}
		return await this.commentsService.deleteCommentById(id);
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
		if (!commentById) {
			throw new NotFoundException();
		}
		if (req.user.id !== commentById.userId) {
			throw new ForbiddenException();
		}
		return await this.commentsService.updateCommentById(id, dto.content);
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
		if (!commentById) {
			throw new HttpException(NOT_FOUND_COMMENT_ERROR, HttpStatus.NOT_FOUND);
		}
		const currentUser = await this.commandBus.execute(new FindUserByIdCommand(req.user.id))
		if (!currentUser || currentUser.banInfo.isBanned) {
			throw new ForbiddenException();
		}
		return await this.commentsService.addLikeCommentById(commentById.id, currentUser.id, dto.likeStatus);
	}
}
