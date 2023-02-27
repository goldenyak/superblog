import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export class GetLastActiveDateFromRefreshTokenCommand {
	constructor(public refreshToken: string) {}
}

@CommandHandler(GetLastActiveDateFromRefreshTokenCommand)
export class GetLastActiveDateFromRefreshTokenUseCase implements ICommandHandler<GetLastActiveDateFromRefreshTokenCommand> {
	constructor(
		private readonly JwtService: JwtService,
	) {}

	async execute(command: GetLastActiveDateFromRefreshTokenCommand) {
		const { refreshToken } = command;
		const result: any = this.JwtService.decode(refreshToken);
		return new Date(result.iat * 1000);
	}
}
