import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../sessions.repository';

export class DeleteSessionCommand {
	constructor(public deviceId: string) {}
}

@CommandHandler(DeleteSessionCommand)
export class DeleteSessionUseCase implements ICommandHandler<DeleteSessionCommand> {
	constructor(private readonly sessionsRepository: SessionsRepository) {}

	async execute(command: DeleteSessionCommand) {
		const { deviceId } = command;
		return await this.sessionsRepository.deleteSessionByDeviceId(deviceId);
	}
}
