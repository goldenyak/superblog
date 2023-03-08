import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../comments.repository';
import { AllCommentsForBlogQueryParams } from '../dto/all-comments-for-blog-query.dto';

export class GetAllCommentsForCurrentUserCommand {
	constructor(
		public postId: string,
		//public currentUserId: string,
	) {}
}

@CommandHandler(GetAllCommentsForCurrentUserCommand)
export class GetAllCommentsForCurrentUserUseCase
	implements ICommandHandler<GetAllCommentsForCurrentUserCommand>
{
	constructor(private readonly commentsRepository: CommentsRepository) {}

	async execute(command: GetAllCommentsForCurrentUserCommand) {
		const { postId,
		//	currentUserId
		} = command;
		const countedAllCommentsByCurrentUser =
			await this.commentsRepository.countAllCommentsForCurrentUser(postId);
		const allCommentsByCurrentUser = await this.commentsRepository.getAllCommentsByCurrentUser(
			postId,
		);
		return allCommentsByCurrentUser;
	}
}
