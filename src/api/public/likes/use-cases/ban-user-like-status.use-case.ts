import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikesRepository } from "../likes.repository";

export class BanUserLikeStatusCommand {
	constructor(public id: string) {}
}

@CommandHandler(BanUserLikeStatusCommand)
export class BanUserLikeStatusUseCase implements ICommandHandler<BanUserLikeStatusCommand> {
	constructor(private readonly likesRepository: LikesRepository) {}

	async execute(command: BanUserLikeStatusCommand) {
		const { id } = command;
		return await this.likesRepository.banUserLikeStatus(id)
	}
}
