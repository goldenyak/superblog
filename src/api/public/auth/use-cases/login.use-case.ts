import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';

export class LoginCommand {
	constructor(public email: string, public userId: string, public login: string) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
	constructor(private readonly JwtService: JwtService) {}

	async execute(command: LoginCommand) {
		const { email, userId, login } = command;
		const deviceId = uuidv4();
		const payload = { email, userId, deviceId, login };
		const accessToken = await this.JwtService.signAsync(payload, { expiresIn: '24h' });
		const refreshToken = await this.JwtService.signAsync(payload, { expiresIn: '24h' });
		return {
			accessToken,
			refreshToken,
		};
	}
}
