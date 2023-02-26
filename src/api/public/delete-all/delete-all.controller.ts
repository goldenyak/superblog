import { Controller, Delete, HttpCode } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UsersRepository } from '../users/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Model } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { BlogsService } from '../blogs/blogs.service';
import { CommentsService } from '../comments/comments.service';
import { PostsService } from '../posts/posts.service';
import { SessionsService } from '../sessions/sessions.service';
import { LikesService } from '../likes/likes.service';
import { BlogsRepository } from "../blogs/blogs.repository";
import { AuthRepository } from "../auth/auth.repository";
import { CommentsRepository } from "../comments/comments.repository";
import { PostsRepository } from "../posts/posts.repository";
import { SessionsRepository } from "../sessions/sessions.repository";

@Controller('testing')
export class DeleteAllController {
	constructor(
		// private readonly usersService: UsersService,
		// private readonly authService: AuthService,
		// private readonly blogsService: BlogsService,
		// private readonly commentsService: CommentsService,
		// private readonly postsService: PostsService,
		// private readonly sessionsService: SessionsService,
		// private readonly likesService: LikesService,
		private readonly usersRepository: UsersRepository,
		private readonly authRepository: AuthRepository,
		private readonly blogsRepository: BlogsRepository,
		private readonly commentRepository: CommentsRepository,
		private readonly postsRepository: PostsRepository,
		private readonly sessionsRepository: SessionsRepository,
		private readonly likesRepository: SessionsRepository,

	) {}

	@HttpCode(204)
	@Delete('all-data')
	async deleteAll() {
		// await this.usersService.deleteAll();
		// await this.authService.deleteAll();
		// await this.commentsService.deleteAll();
		// await this.postsService.deleteAll();
		// await this.sessionsService.deleteAll();
		// await this.likesService.deleteAll();
		await this.usersRepository.deleteAll();
		await this.authRepository.deleteAll();
		await this.blogsRepository.deleteAll();
		await this.commentRepository.deleteAll();
		await this.postsRepository.deleteAll();
		await this.sessionsRepository.deleteAll();
		await this.likesRepository.deleteAll();
		return true;
	}
}
