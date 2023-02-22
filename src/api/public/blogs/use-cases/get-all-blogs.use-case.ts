import { BlogsRepository } from '../blogs.repository';
import { BlogsQueryParams } from '../dto/blogs-query.dto';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

export class GetAllBlogsCommand{
	constructor(public queryParams: BlogsQueryParams) {
	}
}

@CommandHandler(GetAllBlogsCommand)
export class GetAllBlogsUseCase implements ICommandHandler<GetAllBlogsCommand>{
	constructor(private readonly blogsRepository: BlogsRepository) {
	}

	async execute(command: GetAllBlogsCommand) {
		const { queryParams }  = command
		const countBlogs = await this.blogsRepository.countBlogs(queryParams.searchNameTerm);
		const allBlogs = await this.blogsRepository.getAllBlogs(
			queryParams.searchNameTerm,
			queryParams.pageNumber,
			queryParams.pageSize,
			queryParams.sortBy,
			queryParams.sortDirection,
		);
		return {
			pagesCount: Math.ceil(countBlogs / queryParams.pageSize),
			page: queryParams.pageNumber,
			pageSize: queryParams.pageSize,
			totalCount: countBlogs,
			items: allBlogs,
		};
	}
}
