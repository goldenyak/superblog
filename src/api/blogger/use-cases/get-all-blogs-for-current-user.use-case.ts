import { BlogsRepository } from '../../public/blogs/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AllCommentsForBlogQueryParams } from '../../public/comments/dto/all-comments-for-blog-query.dto';

export class GetAllBlogsForCurrentUserCommand {
	constructor(
		//public queryParams?: AllCommentsForBlogQueryParams,
		public userId: string) {}
}

@CommandHandler(GetAllBlogsForCurrentUserCommand)
export class GetAllBlogsForCurrentUserUseCase
	implements ICommandHandler<GetAllBlogsForCurrentUserCommand>
{
	constructor(private readonly blogsRepository: BlogsRepository) {}

	async execute(command: GetAllBlogsForCurrentUserCommand) {
		const {
			//queryParams,
			userId } = command;
		const countBlogs = await this.blogsRepository.countBlogsForCurrentUser(userId);
		const allBlogsForCurrentUser = await this.blogsRepository.getAllBlogsForCurrentUser(
			// queryParams.pageNumber,
			// queryParams.pageSize,
			// queryParams.sortBy,
			// queryParams.sortDirection,
			userId,
		);
		return allBlogsForCurrentUser;
		// return {
		// 	pagesCount: Math.ceil(countBlogs / commandOptions.pageSize),
		// 	page: commandOptions.pageNumber,
		// 	pageSize: commandOptions.pageSize,
		// 	totalCount: countBlogs,
		// 	items: allBlogs,
		// };
	}
}
