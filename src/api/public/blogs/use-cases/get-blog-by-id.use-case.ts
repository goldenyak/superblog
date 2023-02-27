import { BlogsRepository } from '../blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from "@nestjs/common";

export class GetBlogByIdCommand {
	constructor(public id: string) {}
}

@CommandHandler(GetBlogByIdCommand)
export class GetBlogByIdUseCase implements ICommandHandler<GetBlogByIdCommand> {
	constructor(private readonly blogsRepository: BlogsRepository) {}

	async execute(command: GetBlogByIdCommand) {
		const { id } = command;
		const foundedBlog = await this.blogsRepository.findBlogById(id);
		if (!foundedBlog) {
			throw new NotFoundException()
		}
		return {
			id: foundedBlog.id,
			name: foundedBlog.name,
			description: foundedBlog.description,
			websiteUrl: foundedBlog.websiteUrl,
			createdAt: foundedBlog.createdAt,
			isMembership: foundedBlog.isMembership,
		};
	}
}
