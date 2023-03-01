import { BlogsRepository } from '../blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdateBanBlogDto } from '../../../super-admin/api/users/dto/update-ban-blog.dto';

export class BanBlogCommand {
	constructor(public id: string, public dto: UpdateBanBlogDto) {}
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase implements ICommandHandler<BanBlogCommand> {
	constructor(private readonly blogsRepository: BlogsRepository) {}

	async execute(command: BanBlogCommand) {
		const { id, dto } = command;
		return await this.blogsRepository.banBlog(id, dto);
	}
}
