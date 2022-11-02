import { Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { UsersService } from '../users/users.service';
import { UsersRepository } from "../users/users.repository";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
	constructor(
		private readonly authRepository: AuthRepository,
		private readonly usersService: UsersService,
		private readonly usersRepository: UsersRepository,
		private readonly jwtService: JwtService,
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
			accessToken: await this.jwtService.signAsync(payload),
		};
	}

	// async deleteAll() {
	// 	return this.authRepository.deleteAll();
	// }
}
