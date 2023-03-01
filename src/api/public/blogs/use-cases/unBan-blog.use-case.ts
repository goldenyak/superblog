import { BlogsRepository } from '../blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdateBanBlogDto } from '../../../super-admin/api/users/dto/update-ban-blog.dto';

export class UnBanBlogCommand {
	constructor(public id: string, public dto: UpdateBanBlogDto) {}
}

@CommandHandler(UnBanBlogCommand)
export class UnBanBlogUseCase implements ICommandHandler<UnBanBlogCommand> {
	constructor(private readonly blogsRepository: BlogsRepository) {}

	async execute(command: UnBanBlogCommand) {
		const { id, dto } = command;
		return await this.blogsRepository.unBanBlog(id, dto);
	}
}
