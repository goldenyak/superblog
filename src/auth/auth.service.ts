import { Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { UsersService } from '../users/users.service';
import { UsersRepository } from "../users/users.repository";
import { CreateUserDto } from "../users/dto/create-user.dto";

@Injectable()
export class AuthService {
	constructor(
		private readonly authRepository: AuthRepository,
		private readonly usersService: UsersService,
		private readonly usersRepository: UsersRepository
	) {}

	async create(dto: CreateUserDto) {
		return await this.usersService.create(dto);
	}

	async findUser(login: string) {
		return await this.usersRepository.findUserByLogin(login);
	}

	// async deleteAll() {
	// 	return this.authRepository.deleteAll();
	// }
}
