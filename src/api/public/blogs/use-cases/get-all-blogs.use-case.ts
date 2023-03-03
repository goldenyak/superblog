import { BlogsRepository } from '../blogs.repository';
import { BlogsQueryParams } from '../dto/blogs-query.dto';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

export class GetAllBlogsCommand{
	constructor(public commandOptions: any) {
	}
}

@CommandHandler(GetAllBlogsCommand)
export class GetAllBlogsUseCase implements ICommandHandler<GetAllBlogsCommand>{
	constructor(private readonly blogsRepository: BlogsRepository) {
	}

	async execute(command: GetAllBlogsCommand) {
		const { commandOptions }  = command
		const countBlogs = await this.blogsRepository.countBlogs(commandOptions.searchNameTerm, commandOptions.returnBanned);
		const allBlogs = await this.blogsRepository.getAllBlogs(
			commandOptions.searchNameTerm,
			commandOptions.pageNumber,
			commandOptions.pageSize,
			commandOptions.sortBy,
			commandOptions.sortDirection,
			commandOptions.returnBanned
		);
		return {
			pagesCount: Math.ceil(countBlogs / commandOptions.pageSize),
			page: commandOptions.pageNumber,
			pageSize: commandOptions.pageSize,
			totalCount: countBlogs,
			items: allBlogs,
		};
	}
}
