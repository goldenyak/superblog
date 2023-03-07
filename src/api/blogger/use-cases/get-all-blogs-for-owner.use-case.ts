
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogsQueryParams } from "../../public/blogs/dto/blogs-query.dto";
import { BlogsRepository } from "../../public/blogs/blogs.repository";

export class GetAllBlogsForOwnerCommand{
	constructor(public queryParams: BlogsQueryParams, public userId: string) {
	}
}

@CommandHandler(GetAllBlogsForOwnerCommand)
export class GetAllBlogsForOwnerUseCase implements ICommandHandler<GetAllBlogsForOwnerCommand>{
	constructor(private readonly blogsRepository: BlogsRepository) {
	}

	async execute(command: GetAllBlogsForOwnerCommand) {
		const { queryParams, userId }  = command
		const allBlogs = await this.blogsRepository.getAllBlogsForCurrentUser(userId)
		const countAllBlogs = await this.blogsRepository.countBlogsForCurrentUser(userId)
		return {
			pagesCount: Math.ceil(countAllBlogs / queryParams.pageSize),
			page: queryParams.pageNumber,
			pageSize: queryParams.pageSize,
			totalCount: countAllBlogs,
			items: allBlogs,
		};
		// const countBlogs = await this.blogsRepository.countBlogsForOwner(queryParams.searchNameTerm);
		// const allBlogs = await this.blogsRepository.getAllBlogsForOwner(
		// 	queryParams.searchNameTerm,
		// 	queryParams.pageNumber,
		// 	queryParams.pageSize,
		// 	queryParams.sortBy,
		// 	queryParams.sortDirection,
		// );
		// return {
		// 	pagesCount: Math.ceil(countBlogs / queryParams.pageSize),
		// 	page: queryParams.pageNumber,
		// 	pageSize: queryParams.pageSize,
		// 	totalCount: countBlogs,
		// 	items: allBlogs,
		// };
	}
}
