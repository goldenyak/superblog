import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from "../users.repository";
import { UpdateBanUserForBlogDto } from "../../../super-admin/api/users/dto/update-ban-user-for-blog.dto";

export class BanUserForBlogCommand {
  constructor(public id: string, public dto: UpdateBanUserForBlogDto, ) {}
}

@CommandHandler(BanUserForBlogCommand)
export class BanUserForBlogUseCase implements ICommandHandler<BanUserForBlogCommand> {
  constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(command: BanUserForBlogCommand) {
    const { id, dto} = command;
    return await this.usersRepository.banUser(id, dto);
  }
}