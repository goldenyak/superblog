import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../sessions.repository';

export class GetLastActiveSessionCommand {
	constructor(public userId: string, public deviceId: string, public lastActiveDate: Date) {}
}

@CommandHandler(GetLastActiveSessionCommand)
export class GetLastActiveSessionUseCase implements ICommandHandler<GetLastActiveSessionCommand> {
	constructor(
		private readonly sessionsRepository: SessionsRepository,
	) {}

	async execute(command: GetLastActiveSessionCommand) {
		const { userId, deviceId, lastActiveDate } = command;
		return this.sessionsRepository.getSessionByUserAndDeviceIdAndLastActiveDate(userId, deviceId, lastActiveDate)
	}
}
