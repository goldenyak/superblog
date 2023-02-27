import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from "../users.repository";

export class FindUserByRecoveryCodeCommand {
  constructor(public recoveryCode: string) {}
}

@CommandHandler(FindUserByRecoveryCodeCommand)
export class FindUserByRecoveryCodeUseCase implements ICommandHandler<FindUserByRecoveryCodeCommand> {
  constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(command: FindUserByRecoveryCodeCommand) {
    const { recoveryCode } = command;
    return await this.usersRepository.findUserByRecoveryCode(recoveryCode);
  }
}

