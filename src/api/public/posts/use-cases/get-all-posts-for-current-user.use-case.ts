import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsQueryParams } from '../../blogs/dto/blogs-query.dto';
import { PostsRepository } from '../posts.repository';
import { LikesService } from '../../likes/likes.service';

export class GetAllPostsForCurrentUserCommand {
	constructor(public blogId: string) {}
}

@CommandHandler(GetAllPostsForCurrentUserCommand)
export class GetAllPostsForCurrentUserUseCase
	implements ICommandHandler<GetAllPostsForCurrentUserCommand>
{
	constructor(
		private readonly postsRepository: PostsRepository,
	) {}

	async execute(command: GetAllPostsForCurrentUserCommand) {
		const { blogId} = command;
		// const countedPostsByBlogId = await this.postsRepository.countPostsByCurrentUser(currentUserId);
		const allPostsByCurrentUser = await this.postsRepository.getAllPostsByCurrentUser(
			blogId,
		);
		return allPostsByCurrentUser;
	}
}
