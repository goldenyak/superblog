import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from "../users.repository";

export class FindUserByEmailCommand {
  constructor(public email: string) {}
}

@CommandHandler(FindUserByEmailCommand)
export class FindUserByEmailUseCase implements ICommandHandler<FindUserByEmailCommand> {
  constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(command: FindUserByEmailCommand) {
    const { email } = command;
    return await this.usersRepository.findUserByEmail(email);
  }
}

