import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';

export class LoginCommand {
	constructor(public email: string, public id: string, public login: string) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
	constructor(private readonly jwtService: JwtService) {}

	async execute(command: LoginCommand) {
		const { email, id, login } = command;
		const deviceId = uuidv4();
		const payload = { email, id, deviceId, login };
		const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '24h' });
		const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '24h' });
		return {
			accessToken,
			refreshToken,
		};
	}
}
