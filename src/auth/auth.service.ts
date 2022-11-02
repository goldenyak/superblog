import { Injectable } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthRepository } from './auth.repository';
import { UsersService } from '../users/users.service';
import { genSalt, hash } from 'bcrypt';
import { Auth } from './schemas/auth.schema';

@Injectable()
export class AuthService {
	constructor(
		private readonly authRepository: AuthRepository,
		private readonly usersService: UsersService,
	) {}

	async create(dto: AuthDto) {
		const salt = await genSalt(10);
		const newUser: Auth = {
			login: dto.login,
			password: await hash(dto.password, salt),
			email: dto.login,
		};
		return await this.authRepository.create(newUser);
	}

	async findUser(login: string) {
		return await this.usersService.findUserByLogin(login);
	}
}
