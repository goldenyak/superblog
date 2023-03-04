import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from "../users.repository";
import { UpdateBanUserForBlogDto } from "../../../super-admin/api/users/dto/update-ban-user-for-blog.dto";

export class UnBanUserForBlogCommand {
  constructor(public id: string, public dto: UpdateBanUserForBlogDto, ) {}
}

@CommandHandler(UnBanUserForBlogCommand)
export class UnBanUserForBlogUseCase implements ICommandHandler<UnBanUserForBlogCommand> {
  constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(command: UnBanUserForBlogCommand) {
    const { id, dto} = command;
    return await this.usersRepository.unbanUser(id, dto);
  }
}