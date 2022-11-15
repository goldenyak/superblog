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

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(Jwt.name) private readonly jwtModel: Model<JwtDocument>,
		private readonly authRepository: AuthRepository,
		private readonly usersService: UsersService,
		private readonly usersRepository: UsersRepository,
		private readonly JwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly mailerService: MailerService,
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
		const accessToken = await this.JwtService.signAsync(payload, { expiresIn: '24h' });
		const refreshToken = await this.JwtService.signAsync(payload, { expiresIn: '25h' });
		// const refreshToken = await this.createRefreshToken(email, id);
		return {
			accessToken,
			refreshToken,
		};
	}

	async createToken(email: string, id: string, deviceId: string) {
		const newAccessToken = await this.JwtService.signAsync({ email, id }, { expiresIn: '24h' });
		const newRefreshToken = await this.JwtService.signAsync(
			{ email, id, deviceId },
			{ expiresIn: '25h' },
		);
		return {
			newAccessToken,
			newRefreshToken,
		};
	}

	async checkRefreshToken(refreshToken: string) {
		return this.JwtService.verify(refreshToken, this.configService.get('JWT_SECRET'));
	}

	async sendConfirmEmail(email: string) {
		const user = await this.usersService.findUserByEmail(email);
		return await this.mailerService
			.sendMail({
				to: email,
				subject: 'Email confirmation code',
				text: 'welcome',
				html: `<a href=\'https://superblog-eight.vercel.app/auth/registration-confirmation?code=${user.confirmationCode}\'>confirm your email</a>`,
			})
			.catch((e) => {
				throw new HttpException(
					`Ошибка работы почты! Потому что что? Потому что ты ввел какую-то хуйню!`,
					HttpStatus.UNPROCESSABLE_ENTITY,
				);
			});
	}

	async sendRecoveryPasswordEmail(email: string) {
		const recoveryCode = uuidv4();
		await this.usersService.addRecoveryCode(email, recoveryCode);
		return await this.mailerService
			.sendMail({
				to: email,
				subject: 'Email recovery code',
				text: 'welcome',
				html: `<a href=\'https://superblog-eight.vercel.app/auth/password-recovery?recoveryCode=${recoveryCode}\'>recovery password</a>`,
			})
			.catch(() => {
				throw new HttpException(
					`Ошибка работы почты! Потому что что? Потому что ты ввел какую-то хуйню!`,
					HttpStatus.BAD_REQUEST,
				);
			});
	}

	async setNewPassword(recoveryCode: string, newPassword: string) {
		const passwordHash = await hash(newPassword, 10)
		return await this.usersRepository.setNewPassword(recoveryCode, passwordHash);
	}

	async createRefreshToken(email: string, id: string) {
		const refreshToken = await this.JwtService.signAsync({ email, id }, { expiresIn: '24h' });
		const newRefreshToken: Jwt = {
			id: uuidv4(),
			token: refreshToken,
			isValid: true,
			user: id,
		};
		await this.jwtModel.create(newRefreshToken);
		return refreshToken;
	}

	getTokenByUserId(id: string) {
		return this.jwtModel.find({ user: id });
	}

	getToken(token: string) {
		return this.jwtModel.findOne({ token });
	}

	deactivateToken(refreshToken: string) {
		return this.jwtModel.findOneAndUpdate({ token: refreshToken }, { isValid: false });
	}

	async deleteAll() {
		return this.authRepository.deleteAll();
	}
}
