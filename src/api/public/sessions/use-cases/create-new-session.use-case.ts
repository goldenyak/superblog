import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateSessionDto } from '../dto/create-session.dto';
import { SessionsRepository } from '../sessions.repository';
import { JwtService } from '@nestjs/jwt';

export class CreateNewSessionCommand {
	constructor(
		public userIp: string,
		public userId: string,
		public refreshToken: string,
		public sessionTitle: string,
	) {}
}

@CommandHandler(CreateNewSessionCommand)
export class CreateNewSessionUseCase implements ICommandHandler<CreateNewSessionCommand> {
	constructor(
		private readonly sessionsRepository: SessionsRepository,
		private readonly JwtService: JwtService,
	) {}

	async execute(command: CreateNewSessionCommand) {
		const { userIp, userId, refreshToken, sessionTitle } = command;
		// const newRefreshToken = refreshToken.split('.').splice(0, 2).join('.');
		const tokenPayload: any = await this.JwtService.decode(refreshToken);
		const session: CreateSessionDto = {
			ip: userIp,
			title: sessionTitle,
			lastActiveDate: new Date(tokenPayload.iat * 1000),
			deviceId: tokenPayload.deviceId,
			userId: userId,
		};
		return await this.sessionsRepository.create(session);
	}
}
