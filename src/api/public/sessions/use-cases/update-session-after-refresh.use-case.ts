import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../sessions.repository';

export class UpdateSessionAfterRefreshCommand {
	constructor(public deviceId: string, public lastActiveDate: Date) {}
}

@CommandHandler(UpdateSessionAfterRefreshCommand)
export class UpdateSessionAfterRefreshUseCase implements ICommandHandler<UpdateSessionAfterRefreshCommand> {
	constructor(private readonly sessionsRepository: SessionsRepository) {}

	async execute(command: UpdateSessionAfterRefreshCommand) {
		const { deviceId, lastActiveDate } = command;
		return await this.sessionsRepository.updateSessionAfterRefresh(deviceId, lastActiveDate)
	}
}
