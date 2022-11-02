import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { v4 as uuidv4 } from 'uuid';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
	constructor(private readonly usersRepository: UsersRepository) {}

	async create(dto: CreateUserDto) {
		const newUser: User = {
			login: dto.login,
			email: dto.email,
			id: uuidv4(),
			createdAt: new Date(),
		};
		await this.usersRepository.create(newUser);
		return newUser;
	}

	async getAllUsers(
		searchLoginTerm: string,
		searchEmailTerm: string,
		pageNumber: number,
		pageSize: number,
		sortBy: string,
		sortDirection: string,
	) {
		const countUsers = await this.usersRepository.countUsers(searchLoginTerm, searchEmailTerm);

		const allUsers = await this.usersRepository.getAllUsers(
			searchLoginTerm,
			searchEmailTerm,
			(pageNumber = 1),
			(pageSize = 10),
			sortBy,
			sortDirection,
		);

		return {
			pagesCount: pageNumber,
			page: pageNumber,
			pageSize: pageSize,
			totalCount: countUsers,
			items: allUsers,
		};
	}

	async findUserById(id: string) {
		return this.usersRepository.findUserById(id);
	}

	async findUserByLogin(login: string) {
		return this.usersRepository.findUserByLogin(login);
	}

	async deleteUserById(id: string) {
		return await this.usersRepository.deleteUserById(id);
	}

	async deleteAll() {
		return await this.usersRepository.deleteAll();
	}
}
