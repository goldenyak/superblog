import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from "../users.repository";
import { CreateUserDto } from "../dto/create-user.dto";
import { genSalt, hash } from "bcrypt";
import { User } from "../schemas/user.schema";
import { v4 as uuidv4 } from "uuid";
import { UpdateBanUserDto } from "../../../super-admin/api/users/dto/update-ban-user.dto";

export class UnbanUserCommand {
  constructor(public id: string, public dto: UpdateBanUserDto, ) {}
}

@CommandHandler(UnbanUserCommand)
export class UnbanUserUseCase implements ICommandHandler<UnbanUserCommand> {
  constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(command: UnbanUserCommand) {
    const { id, dto} = command;
    return await this.usersRepository.unbanUser(id, dto);
  }
}