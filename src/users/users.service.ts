import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { v4 as uuidv4 } from 'uuid';
import { User } from './schemas/user.schema';
import { compare, genSalt, hash } from "bcrypt";
import { UNREGISTERED_USER_ERROR, WRONG_PASSWORD_ERROR } from "./constants/users.constants";

@Injectable()
export class UsersService {
	constructor(private readonly usersRepository: UsersRepository) {}

	async create(dto: CreateUserDto) {
		const salt = await genSalt(10);
		const newUser: User = {
			login: dto.login,
			email: dto.email,
			password: await hash(dto.password, salt),
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

	async validateUser(login: string, password: string) {
		const user = await this.findUserByLogin(login);
		if (!user) {
			throw new HttpException(UNREGISTERED_USER_ERROR, HttpStatus.NOT_FOUND);
		}
		const isPasswordCorrect = await compare(password, user.password);
		if (!isPasswordCorrect) {
			throw new HttpException(WRONG_PASSWORD_ERROR, HttpStatus.BAD_REQUEST);
		}
		return user;
	}

	async deleteAll() {
		return await this.usersRepository.deleteAll();
	}
}
