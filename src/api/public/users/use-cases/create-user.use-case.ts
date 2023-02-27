import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from "../users.repository";
import { CreateUserDto } from "../dto/create-user.dto";
import { genSalt, hash } from "bcrypt";
import { User } from "../schemas/user.schema";
import { v4 as uuidv4 } from "uuid";

export class CreateUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(command: CreateUserCommand) {
    const { dto } = command;
    const salt = await genSalt(10);
    const newUser: User = {
      login: dto.login,
      email: dto.email,
      password: await hash(dto.password, salt),
      id: uuidv4(),
      createdAt: new Date(),
      confirmationCode: uuidv4(),
      isConfirmed: false,
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
    };
    await this.usersRepository.create(newUser);
    return {
      id: newUser.id,
      login: newUser.login,
      email: newUser.email,
      createdAt: newUser.createdAt,
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
    };
  }
}