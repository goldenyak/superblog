import { Controller, Delete } from '@nestjs/common';
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

@Controller('testing')
export class DeleteAllController {
	constructor(
		private readonly usersService: UsersService,
		private readonly authService: AuthService,
		private readonly blogsService: BlogsService,
		private readonly commentsService: CommentsService,
		private readonly postsService: PostsService,
		private readonly sessionsService: SessionsService,
	) {}

	@Delete('all-data')
	async deleteAll() {
		await this.usersService.deleteAll();
		await this.blogsService.deleteAll();
		await this.commentsService.deleteAll();
		await this.postsService.deleteAll();
		await this.sessionsService.deleteAll();
		await this.authService.deleteAll();
		return true;
	}
}
