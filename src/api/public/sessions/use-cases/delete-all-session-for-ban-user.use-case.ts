import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../sessions.repository';

export class DeleteAllSessionForBanUserCommand {
	constructor(public userId: string) {}
}

@CommandHandler(DeleteAllSessionForBanUserCommand)
export class DeleteAllSessionForBanUserUseCase implements ICommandHandler<DeleteAllSessionForBanUserCommand> {
	constructor(private readonly sessionsRepository: SessionsRepository) {}

	async execute(command: DeleteAllSessionForBanUserCommand) {
		const { userId } = command;
		return this.sessionsRepository.deleteAllSessionForBanUser(userId)
	}
}
