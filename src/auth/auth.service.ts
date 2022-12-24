import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { UsersService } from '../users/users.service';
import { UsersRepository } from '../users/users.repository';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Jwt, JwtDocument } from './schemas/jwt.schema';
import { v4 as uuidv4 } from 'uuid';
import { compare, genSalt, hash } from 'bcrypt';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(Jwt.name) private readonly jwtModel: Model<JwtDocument>,
		private readonly authRepository: AuthRepository,
		private readonly usersService: UsersService,
		private readonly usersRepository: UsersRepository,
		private readonly JwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly emailService: EmailService,
	) {}

	async create(dto: CreateUserDto) {
		return await this.usersService.create(dto);
	}

	async findUser(login: string) {
		return await this.usersRepository.findUserByLogin(login);
	}

	async login(email: string, id: string) {
		const deviceId = uuidv4();
		const payload = { email, id, deviceId };
		const accessToken = await this.JwtService.signAsync(payload, { expiresIn: '10s' });
		const refreshToken = await this.JwtService.signAsync(payload, { expiresIn: '20s' });
		return {
			accessToken,
			refreshToken,
		};
	}

	async createNewToken(email: string, id: string, deviceId: string) {
		const newAccessToken = await this.JwtService.signAsync({ email, id }, { expiresIn: '10s' });
		const newRefreshToken = await this.JwtService.signAsync(
			{ email, id, deviceId },
			{ expiresIn: '20s' },
		);
		return {
			newAccessToken,
			newRefreshToken,
		};
	}

	async checkRefreshToken(refreshToken: string) {
		try {
			return await this.JwtService.verify(refreshToken, this.configService.get('JWT_SECRET'));
		} catch (e) {
			return null;
		}
	}

	getLastActiveDateFromRefreshToken(newRefreshToken: string) {
		const result: any = this.JwtService.decode(newRefreshToken);
		return new Date(result.iat * 1000);
	}

	async checkUserIdByToken(token: string) {
		try {
			const result = await this.JwtService.verify(token, this.configService.get('JWT_SECRET'));
			return result.id;
		} catch (e) {
			return null;
		}
	}

	async sendConfirmEmail(email: string) {
		const user = await this.usersService.findUserByEmail(email);
		return this.emailService.sendConfirmEmail(email, user.confirmationCode);
	}

	async sendNewConfirmEmail(email: string) {
		const newCode = await this.usersService.addNewConfirmationCodeByEmail(email);
		return await this.emailService.sendNewConfirmEmail(email, newCode);
	}

	async sendRecoveryPasswordEmail(email: string) {
		const recoveryCode = uuidv4();
		await this.usersService.addRecoveryCode(email, recoveryCode);
		return this.emailService.sendRecoveryPasswordEmail(email, recoveryCode);
	}

	async setNewPassword(recoveryCode: string, newPassword: string) {
		const passwordHash = await hash(newPassword, 10);
		return await this.usersRepository.setNewPassword(recoveryCode, passwordHash);
	}

	// async createRefreshToken(email: string, id: string) {
	// 	const refreshToken = await this.JwtService.signAsync({ email, id }, { expiresIn: '20s' });
	// 	const newRefreshToken: Jwt = {
	// 		id: uuidv4(),
	// 		token: refreshToken,
	// 		isValid: true,
	// 		user: id,
	// 	};
	// 	await this.jwtModel.create(newRefreshToken);
	// 	return refreshToken;
	// }
	//
	// getTokenByUserId(id: string) {
	// 	return this.jwtModel.find({ user: id });
	// }

	// getToken(token: string) {
	// 	return this.jwtModel.findOne({ token });
	// }
	//
	// deactivateToken(refreshToken: string) {
	// 	return this.jwtModel.findOneAndUpdate({ token: refreshToken }, { isValid: false });
	// }

	async deleteAll() {
		return this.authRepository.deleteAll();
	}


}
