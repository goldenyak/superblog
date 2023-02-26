import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SessionsRepository } from './sessions.repository';
import { UsersService } from '../users/users.service';

@Injectable()
export class SessionsService {
	constructor(
		private readonly sessionsRepository: SessionsRepository,
		private readonly JwtService: JwtService,
		private readonly configService: ConfigService,
		//private readonly usersService: UsersService,
	) {}

	async createNewSession(
		userIp: string,
		userId: string,
		refreshToken: string,
		sessionTitle: string,
	) {
		// const newRefreshToken = refreshToken.split('.').splice(0, 2).join('.');
		const tokenPayload: any = await this.JwtService.decode(refreshToken);
		// console.log(tokenPayload);
		const session: CreateSessionDto = {
			ip: userIp,
			title: sessionTitle,
			lastActiveDate: new Date(tokenPayload.iat * 1000),
			deviceId: tokenPayload.deviceId,
			userId: userId,
		};
		return await this.sessionsRepository.create(session);
	}

	async getAllSessions(userId: string) {
		const userSessions = await this.sessionsRepository.getAllSessions(userId);
		return userSessions.map((el) => ({
			ip: el.ip,
			title: el.title,
			lastActiveDate: el.lastActiveDate,
			deviceId: el.deviceId,
		}));
	}

	async getSessionsByDeviceId(deviceId: string) {
		return this.sessionsRepository.getSessionsByDeviceId(deviceId);
	}

	async getSessionByUserAndDeviceIdAndLastActiveDate(userId: string, deviceId: string, lastActiveDate: Date) {
		return this.sessionsRepository.getSessionByUserAndDeviceIdAndLastActiveDate(userId, deviceId, lastActiveDate)
	}


	async deleteAllSessionsWithExclude(deviceId: string, userId: string) {
		return await this.sessionsRepository.deleteAllSessionsWithExclude(deviceId, userId)
	}

	async deleteSessionByDeviceId(deviceId: string) {
		return await this.sessionsRepository.deleteSessionByDeviceId(deviceId)
	}

	async updateSessionAfterRefresh(deviceId: string, lastActiveDate: Date) {
		return await this.sessionsRepository.updateSessionAfterRefresh(deviceId, lastActiveDate)
	}

	async checkRefreshToken(refreshToken: string) {
		try {
			return await this.JwtService.verify(refreshToken, this.configService.get('JWT_SECRET'));
		} catch (error) {
			return false;
		}
	}

	async deleteAll() {
		return await this.sessionsRepository.deleteAll();
	}

	async deleteAllSessionForBanUser(id: string) {
		return this.sessionsRepository.deleteAllSessionForBanUser(id)
	}
}
