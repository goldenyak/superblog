import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { HttpException, HttpStatus } from "@nestjs/common";
import { UNREGISTERED_USER_ERROR, WRONG_PASSWORD_ERROR } from "../constants/users.constants";
import { compare } from "bcrypt";
import { FindUserByLoginCommand } from "./find-user-by-login.use-case";

export class ValidateUserCommand {
  constructor(public loginOrEmail: string, public password: string) {}
}

@CommandHandler(ValidateUserCommand)
export class ValidateUserUseCase implements ICommandHandler<ValidateUserCommand> {
  constructor(
    private readonly commandBus: CommandBus
  ) {}

  async execute(command: ValidateUserCommand) {
    const { loginOrEmail, password } = command;
    const user = await this.commandBus.execute(new FindUserByLoginCommand(loginOrEmail))
    if (!user) {
      throw new HttpException(UNREGISTERED_USER_ERROR, HttpStatus.UNAUTHORIZED);
    }
    if (user.banInfo.isBanned) {
      throw new HttpException(UNREGISTERED_USER_ERROR, HttpStatus.UNAUTHORIZED);
    }
    const isPasswordCorrect = await compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new HttpException(WRONG_PASSWORD_ERROR, HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
}