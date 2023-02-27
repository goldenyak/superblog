import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export class CheckUserIdByTokenCommand {
	constructor(public token: string) {}
}

@CommandHandler(CheckUserIdByTokenCommand)
export class CheckUserIdByTokenUseCase implements ICommandHandler<CheckUserIdByTokenCommand> {
	constructor(
		private readonly JwtService: JwtService,
		private readonly configService: ConfigService,
	) {}

	async execute(command: CheckUserIdByTokenCommand) {
		const { token } = command;
		try {
			const result = await this.JwtService.verify(token, this.configService.get('JWT_SECRET'));
			return result.id;
		} catch (e) {
			return null;
		}
	}
}
