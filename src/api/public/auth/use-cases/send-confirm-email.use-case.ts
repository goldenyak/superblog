import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendEmailCommand } from "../../../../email/use-cases/send-email.use-case";
import { FindUserByEmailCommand } from "../../users/use-cases/find-user-by-email.use-case";

export class SendConfirmEmailCommand {
	constructor(public email: string) {}
}

@CommandHandler(SendConfirmEmailCommand)
export class SendConfirmEmailUseCase implements ICommandHandler<SendConfirmEmailCommand> {
	constructor(
		private readonly commandBus: CommandBus,
	) {}

	async execute(command: SendConfirmEmailCommand) {
		const { email } = command;
		const user = await this.commandBus.execute(new FindUserByEmailCommand(email));
		return this.commandBus.execute(new SendEmailCommand(email, user.confirmationCode));
	}
}
