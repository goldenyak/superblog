import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../comments.repository';
import { AllCommentsForBlogQueryParams } from '../dto/all-comments-for-blog-query.dto';

export class GetAllCommentsForCurrentUserCommand {
	constructor(
		//public queryParams: AllCommentsForBlogQueryParams,
		public postId?: string,
		public currentUserId?: string,
	) {}
}

@CommandHandler(GetAllCommentsForCurrentUserCommand)
export class GetAllCommentsForCurrentUserUseCase
	implements ICommandHandler<GetAllCommentsForCurrentUserCommand>
{
	constructor(private readonly commentsRepository: CommentsRepository) {}

	async execute(command: GetAllCommentsForCurrentUserCommand) {
		const {
			//queryParams,
			postId, currentUserId } = command;
		const countedAllCommentsByCurrentUser =
			await this.commentsRepository.countAllCommentsForCurrentUser(postId, currentUserId);
		const allCommentsByCurrentUser = await this.commentsRepository.getAllCommentsByCurrentUser(
			//queryParams,
			postId,
			currentUserId,
		);
		return allCommentsByCurrentUser
		// return {
		// 	pagesCount: Math.ceil(countedAllCommentsByCurrentUser / queryParams.pageSize),
		// 	page: queryParams.pageNumber,
		// 	pageSize: queryParams.pageSize,
		// 	totalCount: countedAllCommentsByCurrentUser,
		// 	items: allCommentsByCurrentUser,
		// };
	}
}
