import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { hash } from "bcrypt";
import { UsersRepository } from "../../users/users.repository";

export class SetNewPasswordCommand {
  constructor(public recoveryCode: string, public newPassword: string) {}
}

@CommandHandler(SetNewPasswordCommand)
export class SetNewPasswordUseCase implements ICommandHandler<SetNewPasswordCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: SetNewPasswordCommand) {
    const { recoveryCode, newPassword } = command;
    const passwordHash = await hash(newPassword, 10);
    return await this.usersRepository.setNewPassword(recoveryCode, passwordHash);
  }
}