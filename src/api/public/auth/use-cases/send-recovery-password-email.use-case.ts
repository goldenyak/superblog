import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailService } from '../../../../email/email.service';
import { v4 as uuidv4 } from "uuid";
import { UsersService } from "../../users/users.service";

export class SendRecoveryPasswordEmailCommand {
	constructor(public email: string) {}
}

@CommandHandler(SendRecoveryPasswordEmailCommand)
export class SendRecoveryPasswordEmailUseCase implements ICommandHandler<SendRecoveryPasswordEmailCommand> {
	constructor(
		private readonly emailService: EmailService,
		private readonly usersService: UsersService,
	) {}

	async execute(command: SendRecoveryPasswordEmailCommand) {
		const { email } = command;
		const recoveryCode = uuidv4();
		await this.usersService.addRecoveryCode(email, recoveryCode);
		return this.emailService.sendRecoveryPasswordEmail(email, recoveryCode);
	}
}
