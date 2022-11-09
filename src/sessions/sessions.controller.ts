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
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { elementAt } from 'rxjs';

@Injectable()
@Controller('security')
export class SessionsController {
	constructor(
		private readonly sessionsService: SessionsService,
		private readonly usersService: UsersService,
	) {}

	@HttpCode(200)
	@Get('devices')
	async getAllSessions(@Req() req: Request) {
		const refreshToken = req.cookies.refreshToken;
		const tokenPayload = await this.sessionsService.checkRefreshToken(refreshToken);
		// console.log('tokenPayload', tokenPayload);
		if (!refreshToken || !tokenPayload) {
			throw new UnauthorizedException();
		}
		const currentUser = await this.usersService.findUserById(tokenPayload.id);
		if (currentUser) {
			return await this.sessionsService.getAllSessions(tokenPayload.id);
		}
	}

	@HttpCode(204)
	@Delete('devices/:deviceId')
	async deleteSessionByDeviceId(@Param('deviceId') deviceId: string, @Req() req: Request) {
		const refreshToken = req.cookies.refreshToken;
		const tokenPayload = await this.sessionsService.checkRefreshToken(refreshToken);
		const currentUser = await this.usersService.findUserById(tokenPayload.id);
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
			return await this.sessionsService.deleteSessionByDeviceId(deviceId);
		}
	}
}
