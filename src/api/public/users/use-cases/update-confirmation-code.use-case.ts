import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from "../users.repository";

export class UpdateConfirmationCodeCommand {
  constructor(public confirmationCode: string) {}
}

@CommandHandler(UpdateConfirmationCodeCommand)
export class UpdateConfirmationCodeUseCase implements ICommandHandler<UpdateConfirmationCodeCommand> {
  constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(command: UpdateConfirmationCodeCommand) {
    const { confirmationCode } = command;
    return await this.usersRepository.updateConfirmationCode(confirmationCode);
  }
}

