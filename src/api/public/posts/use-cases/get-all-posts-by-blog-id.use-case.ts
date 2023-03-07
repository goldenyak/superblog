import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsQueryParams } from '../../blogs/dto/blogs-query.dto';
import { PostsRepository } from '../posts.repository';
import { LikesService } from "../../likes/likes.service";

export class GetAllPostsByBlogIdCommand {
	constructor(
		public queryParams: BlogsQueryParams,
		public blogId: string,
		public currentUserId: string,
	) {}
}

@CommandHandler(GetAllPostsByBlogIdCommand)
export class GetAllPostsByBlogIdUseCase implements ICommandHandler<GetAllPostsByBlogIdCommand> {
	constructor(private readonly postsRepository: PostsRepository,
              private readonly likesService: LikesService) {}

	async execute(command: GetAllPostsByBlogIdCommand) {
		const { queryParams, blogId, currentUserId } = command;
    const countedPostsByBlogId = await this.postsRepository.countPostsByBlogId(blogId);
    const allPostsByBlogId = await this.postsRepository.getAllPostsByBlogId(
      queryParams.pageNumber,
      queryParams.pageSize,
      queryParams.sortBy,
      queryParams.sortDirection,
      blogId,
    );
    const result = [];
    for await (let post of allPostsByBlogId) {
      const mappedPost = await this.likesService.getLikesInfoForPost(post, currentUserId);
      result.push(mappedPost);
    }

    return {
      pagesCount: Math.ceil(countedPostsByBlogId / queryParams.pageSize),
      page: queryParams.pageNumber,
      pageSize: queryParams.pageSize,
      totalCount: countedPostsByBlogId,
      items: result,
    };
	}
}
