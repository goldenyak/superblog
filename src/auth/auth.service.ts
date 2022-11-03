import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { UsersService } from '../users/users.service';
import { UsersRepository } from '../users/users.repository';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { doc } from 'prettier';
import path from 'path';

@Injectable()
export class AuthService {
	constructor(
		private readonly authRepository: AuthRepository,
		private readonly usersService: UsersService,
		private readonly usersRepository: UsersRepository,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly mailerService: MailerService,
	) {}

	async create(dto: CreateUserDto) {
		return await this.usersService.create(dto);
	}

	async findUser(login: string) {
		return await this.usersRepository.findUserByLogin(login);
	}

	async login(email: string) {
		const payload = { email };
		return {
			accessToken: await this.jwtService.signAsync(payload, { expiresIn: '1h' }),
		};
	}

	async sendConfirmEmail(dto: CreateUserDto) {
		return await this.mailerService
			.sendMail({
				to: dto.email,
				subject: 'Email confirmation code',
				text: 'welcome',
				html: '<b>welcome</b>',
			})
			.catch((e) => {
				throw new HttpException(
					`Ошибка работы почты: ${JSON.stringify(e)}`,
					HttpStatus.UNPROCESSABLE_ENTITY,
				);
			});
	}

	// async deleteAll() {
	// 	return this.authRepository.deleteAll();
	// }
}
