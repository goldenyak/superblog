import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from "../users.repository";

export class FindUserByConfirmationCodeCommand {
  constructor(public confirmationCode: string) {}
}

@CommandHandler(FindUserByConfirmationCodeCommand)
export class FindUserByConfirmationCodeUseCase implements ICommandHandler<FindUserByConfirmationCodeCommand> {
  constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(command: FindUserByConfirmationCodeCommand) {
    const { confirmationCode } = command;
    return await this.usersRepository.findUserByConfirmationCode(confirmationCode);
  }
}

