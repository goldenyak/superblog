import { BlogsRepository } from '../blogs.repository';
import { BlogsQueryParams } from '../dto/blogs-query.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class GetBlogByIdCommand {
	constructor(public id: string) {}
}

@CommandHandler(GetBlogByIdCommand)
export class GetBlogByIdUseCase implements ICommandHandler<GetBlogByIdCommand> {
	constructor(private readonly blogsRepository: BlogsRepository) {}

	async execute(command: GetBlogByIdCommand) {
		const { id } = command;
		return this.blogsRepository.findBlogById(id);
	}
}
