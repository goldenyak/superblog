import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikesRepository } from "../likes.repository";

export class UnbanUserLikeStatusCommand {
	constructor(public id: string) {}
}

@CommandHandler(UnbanUserLikeStatusCommand)
export class UnbanUserLikeStatusUseCase implements ICommandHandler<UnbanUserLikeStatusCommand> {
	constructor(private readonly likesRepository: LikesRepository) {}

	async execute(command: UnbanUserLikeStatusCommand) {
		const { id } = command;
		return await this.likesRepository.unbanUserLikeStatus(id)
	}
}
