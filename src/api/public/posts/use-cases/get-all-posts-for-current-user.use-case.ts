import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsQueryParams } from '../../blogs/dto/blogs-query.dto';
import { PostsRepository } from '../posts.repository';
import { LikesService } from '../../likes/likes.service';

export class GetAllPostsForCurrentUserCommand {
	constructor(public blogId?: string, public currentUserId?: string) {}
}

@CommandHandler(GetAllPostsForCurrentUserCommand)
export class GetAllPostsForCurrentUserUseCase
	implements ICommandHandler<GetAllPostsForCurrentUserCommand>
{
	constructor(
		private readonly postsRepository: PostsRepository,
	) {}

	async execute(command: GetAllPostsForCurrentUserCommand) {
		const { blogId, currentUserId } = command;
		// const countedPostsByBlogId = await this.postsRepository.countPostsByCurrentUser(currentUserId);
		const allPostsByCurrentUser = await this.postsRepository.getAllPostsByCurrentUser(
			blogId,
			currentUserId,
		);
		return allPostsByCurrentUser;
		// const result = [];
		// for await (let post of allPostsByBlogId) {
		//   const mappedPost = await this.likesService.getLikesInfoForPost(post, currentUserId);
		//   result.push(mappedPost);
		// }
		//
		// return {
		//   pagesCount: Math.ceil(countedPostsByBlogId / queryParams.pageSize),
		//   page: queryParams.pageNumber,
		//   pageSize: queryParams.pageSize,
		//   totalCount: countedPostsByBlogId,
		//   items: result,
		// };
	}
}
