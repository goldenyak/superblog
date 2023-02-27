import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from "../users.repository";

export class FindUserByLoginCommand {
  constructor(public login: string) {}
}

@CommandHandler(FindUserByLoginCommand)
export class FindUserByLoginUseCase implements ICommandHandler<FindUserByLoginCommand> {
  constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(command: FindUserByLoginCommand) {
    const { login } = command;
    return await this.usersRepository.findUserByLogin(login);
  }
}

