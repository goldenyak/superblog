import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export class CheckRefreshTokenCommand {
	constructor(public token: string) {}
}

@CommandHandler(CheckRefreshTokenCommand)
export class CheckRefreshTokenUseCase implements ICommandHandler<CheckRefreshTokenCommand> {
	constructor(
		private readonly JwtService: JwtService,
		private readonly configService: ConfigService,
	) {}

	async execute(command: CheckRefreshTokenCommand) {
		const { token } = command;
		try {
			return await this.JwtService.verify(token, this.configService.get('JWT_SECRET'));
		} catch (e) {
			return null;
		}
	}
}
