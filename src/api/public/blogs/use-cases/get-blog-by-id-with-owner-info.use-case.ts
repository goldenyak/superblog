import { BlogsRepository } from '../blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

export class GetBlogByIdWithOwnerInfoCommand {
	constructor(public id: string) {}
}

@CommandHandler(GetBlogByIdWithOwnerInfoCommand)
export class GetBlogByIdWithOwnerInfoUseCase
	implements ICommandHandler<GetBlogByIdWithOwnerInfoCommand>
{
	constructor(private readonly blogsRepository: BlogsRepository) {}

	async execute(command: GetBlogByIdWithOwnerInfoCommand) {
		const { id } = command;
		const foundedBlog = await this.blogsRepository.findBlogById(id);
		if (!foundedBlog) {
			throw new NotFoundException();
		}
		return foundedBlog;
	}
}
