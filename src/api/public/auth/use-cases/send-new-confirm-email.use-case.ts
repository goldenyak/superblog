import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailService } from '../../../../email/email.service';
import { UsersService } from '../../users/users.service';

export class SendNewConfirmEmailCommand {
	constructor(public email: string) {}
}

@CommandHandler(SendNewConfirmEmailCommand)
export class SendNewConfirmEmailUseCase implements ICommandHandler<SendNewConfirmEmailCommand> {
	constructor(
		private readonly emailService: EmailService,
		private readonly usersService: UsersService,
	) {}

	async execute(command: SendNewConfirmEmailCommand) {
		const { email } = command;
		const newCode = await this.usersService.addNewConfirmationCodeByEmail(email);
		return await this.emailService.sendNewConfirmEmail(email, newCode);
	}
}
