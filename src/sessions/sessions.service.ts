import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SessionsService {
	constructor(private readonly JwtService: JwtService,
							private readonly configService: ConfigService) {}

	async createNewSession(
		userIp: string,
		userId: string,
		refreshToken: string,
		sessionTitle: string,
	) {
    const newRefreshToken = refreshToken.split('.').splice(0,2).join('.')
    console.log(newRefreshToken);
		const tokenPayload = await this.JwtService.verify(
			refreshToken
			// this.configService.get('JWT_SECRET'),
		);
		console.log(tokenPayload);
		const session: CreateSessionDto = {
			ip: userIp,
      title: sessionTitle,
      lastActiveDate: new Date(),
      deviceId: uuidv4(),
      tokenExpiredDate: tokenPayload.expiresIn,
      userId: userId,
		};
    console.log(session);
	}
}
