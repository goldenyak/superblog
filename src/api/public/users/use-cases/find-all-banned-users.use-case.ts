import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../users.repository';
import { BannedUsersQueryDto } from '../dto/banned-users-query.dto';

export class FindAllBannedUsersCommand {
	constructor(public queryParams: BannedUsersQueryDto) {}
}

@CommandHandler(FindAllBannedUsersCommand)
export class FindAllBannedUsersUseCase implements ICommandHandler<FindAllBannedUsersCommand> {
	constructor(private readonly usersRepository: UsersRepository) {}

	async execute(command: FindAllBannedUsersCommand) {
		const { queryParams } = command;
		const countBannedUsers = await this.usersRepository.countAllBannedUsers(
			queryParams.searchLoginTerm,
		);
		const allBannedUsers = await this.usersRepository.getAllBannedUsers(
			queryParams.searchLoginTerm,
			queryParams.pageNumber,
			queryParams.pageSize,
			queryParams.sortBy,
			queryParams.sortDirection,
		);
		return {
			pagesCount: Math.ceil(countBannedUsers / queryParams.pageSize),
			page: queryParams.pageNumber,
			pageSize: queryParams.pageSize,
			totalCount: countBannedUsers,
			items: allBannedUsers,
		};
	}
}
