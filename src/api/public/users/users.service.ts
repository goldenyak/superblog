import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { v4 as uuidv4 } from 'uuid';
import { User } from './schemas/user.schema';
import { compare, genSalt, hash } from 'bcrypt';
import { UNREGISTERED_USER_ERROR, WRONG_PASSWORD_ERROR } from './constants/users.constants';
import { UsersQueryDto } from './dto/users-query.dto';
import { UpdateBanUserDto } from '../../super-admin/api/users/dto/update-ban-user.dto';

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
			confirmationCode: uuidv4(),
			isConfirmed: false,
			banInfo: {
				isBanned: false,
				banDate: new Date().toISOString(),
				banReason: 'notBanned',
			},
		};
		await this.usersRepository.create(newUser);
		return {
			id: newUser.id,
			login: newUser.login,
			email: newUser.email,
			createdAt: newUser.createdAt,
			banInfo: {
				isBanned: false,
				banDate: null,
				banReason: null,
			},
		};
	}

	async getAllUsers({
		banStatus,
		searchLoginTerm,
		searchEmailTerm,
		pageNumber,
		pageSize,
		sortBy,
		sortDirection,
	}: UsersQueryDto) {
		const countUsers = await this.usersRepository.countUsers(
			searchLoginTerm,
			searchEmailTerm,
			banStatus,
		);

		const allUsers = await this.usersRepository.getAllUsers(
			banStatus,
			searchLoginTerm,
			searchEmailTerm,
			pageNumber,
			pageSize,
			sortBy,
			sortDirection,
		);

		return {
			pagesCount: Math.ceil(countUsers / pageSize),
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

	async findUserByEmail(email: string) {
		return await this.usersRepository.findUserByEmail(email);
	}

	async findUserByConfirmationCode(code: string) {
		return await this.usersRepository.findUserByConfirmationCode(code);
	}

	async findUserByRecoveryCode(recoveryCode: string) {
		return await this.usersRepository.findUserByRecoveryCode(recoveryCode);
	}

	async updateConfirmationCode(code: string) {
		return await this.usersRepository.updateConfirmationCode(code);
	}
	async addNewConfirmationCodeByEmail(email: string) {
		const newConfirmationCode = uuidv4();
		await this.usersRepository.addNewConfirmationCodeByEmail(email, newConfirmationCode);
		return newConfirmationCode;
	}

	async updateUserBanInfo(id: string, dto: UpdateBanUserDto) {
		return this.usersRepository.updateUserBanInfo(id, dto);
	}

	async addRecoveryCode(email: string, recoveryCode: string) {
		return await this.usersRepository.addRecoveryCode(email, recoveryCode);
	}

	async deleteUserById(id: string) {
		return await this.usersRepository.deleteUserById(id);
	}

	async validateUser(login: string, password: string) {
		const user = await this.findUserByLogin(login);
		if (!user) {
			throw new HttpException(UNREGISTERED_USER_ERROR, HttpStatus.UNAUTHORIZED);
		}
		if(user.banInfo.isBanned) {
			throw new HttpException(UNREGISTERED_USER_ERROR, HttpStatus.UNAUTHORIZED);
		}
		const isPasswordCorrect = await compare(password, user.password);
		if (!isPasswordCorrect) {
			throw new HttpException(WRONG_PASSWORD_ERROR, HttpStatus.UNAUTHORIZED);
		}
		return user;
	}

	async deleteAll() {
		return await this.usersRepository.deleteAll();
	}
}
