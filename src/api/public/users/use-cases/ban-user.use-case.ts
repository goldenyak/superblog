import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from "../users.repository";
import { CreateUserDto } from "../dto/create-user.dto";
import { genSalt, hash } from "bcrypt";
import { User } from "../schemas/user.schema";
import { v4 as uuidv4 } from "uuid";
import { UpdateBanUserDto } from "../../../super-admin/api/users/dto/update-ban-user.dto";

export class BanUserCommand {
  constructor(public id: string, public dto: UpdateBanUserDto, ) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(command: BanUserCommand) {
    const { id, dto} = command;
    return await this.usersRepository.unbanUser(id, dto);
  }
}