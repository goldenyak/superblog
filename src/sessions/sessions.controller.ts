import { Controller, Get, HttpCode, Injectable, Req, UnauthorizedException } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
@Controller('security')
export class SessionsController {
	constructor(
		private readonly sessionsService: SessionsService,
		private readonly usersService: UsersService,
	) {}

	@HttpCode(200)
	@Get('devices')
	async getAllDevices(@Req() req: Request) {
		const refreshToken = req.cookies.refreshToken;
		const tokenPayload = await this.sessionsService.checkRefreshToken(refreshToken);
		console.log('tokenPayload', tokenPayload);
		if (!refreshToken || !tokenPayload) {
			throw new UnauthorizedException();
		}
		const currentUser = await this.usersService.findUserById(tokenPayload.id);
		if (currentUser) {
			return  await this.sessionsService.getAllDevices(tokenPayload.id);
		}
	}
}
