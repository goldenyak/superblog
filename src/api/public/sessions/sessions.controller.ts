import {
	Controller,
	Delete,
	ForbiddenException,
	Get,
	HttpCode,
	Injectable,
	NotFoundException,
	Param,
	Req,
	UnauthorizedException,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { Request } from 'express';
import { UsersService } from '../users/users.service';
import { CommandBus } from "@nestjs/cqrs";
import { FindUserByIdCommand } from "../users/use-cases/find-user-by-id.use-case";
import { DeleteSessionCommand } from "./use-cases/delete-session.use-case";


@Injectable()
@Controller('security')
export class SessionsController {
	constructor(
		private readonly sessionsService: SessionsService,
		private readonly usersService: UsersService,
		private readonly commandBus: CommandBus,
	) {}

	@HttpCode(200)
	@Get('devices')
	async getAllSessions(@Req() req: Request) {
		const refreshToken = req.cookies.refreshToken;
		const tokenPayload = await this.sessionsService.checkRefreshToken(refreshToken);
		if (!refreshToken || !tokenPayload) {
			throw new UnauthorizedException();
		}
		const currentUser = await this.commandBus.execute(new FindUserByIdCommand(tokenPayload.id));
		if (currentUser) {
			return await this.sessionsService.getAllSessions(tokenPayload.id);
		}
	}

	@HttpCode(204)
	@Delete('devices')
	async deleteAllSessions(@Req() req: Request) {
		const refreshToken = req.cookies.refreshToken;
		const tokenPayload = await this.sessionsService.checkRefreshToken(refreshToken);
		const currentUser = await this.commandBus.execute(new FindUserByIdCommand(tokenPayload.id));
		if (!refreshToken || !tokenPayload) {
			throw new UnauthorizedException();
		}
		const currentSession = await this.sessionsService.getSessionsByDeviceId(tokenPayload.deviceId)
		console.log(currentSession);
		console.log(tokenPayload);
		console.log(currentUser.id);
		if (currentSession.deviceId === tokenPayload.deviceId) {
			return await this.sessionsService.deleteAllSessionsWithExclude(currentSession.deviceId, currentUser.id)
		}
	}

	@HttpCode(204)
	@Delete('devices/:deviceId')
	async deleteSessionByDeviceId(@Param('deviceId') deviceId: string, @Req() req: Request) {
		const refreshToken = req.cookies.refreshToken;
		const tokenPayload = await this.sessionsService.checkRefreshToken(refreshToken);
		const currentUser = await this.commandBus.execute(new FindUserByIdCommand(tokenPayload.id));
		const currentSession = await this.sessionsService.getSessionsByDeviceId(deviceId);
		if (!refreshToken || !tokenPayload) {
			throw new UnauthorizedException();
		}
		if (!currentSession) {
			throw new NotFoundException();
		}
		if (currentSession.userId !== currentUser.id) {
			throw new ForbiddenException();
		}
		if (currentSession.userId === currentUser.id) {
			return await this.commandBus.execute(new DeleteSessionCommand(deviceId));
		}
	}
}
