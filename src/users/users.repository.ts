import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersRepository {
	constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

	async create(dto: CreateUserDto) {
		return this.userModel.create(dto);
	}

	async getAllUsers(
		searchLoginTerm: string,
		searchEmailTerm: string,
		pageNumber = 1,
		pageSize = 10,
		sortBy: string,
		sortDirection: string,
	) {
		const filter = this.getFilterForQuery(searchLoginTerm, searchEmailTerm);
		const sortByFilter = this.getFilterForSortBy(sortBy);
		const sortDirectionFilter = this.getFilterForSortDirection(sortDirection);

		const users = await this.userModel
			.find(filter)
			.skip((pageNumber - 1) * pageSize)
			.limit(pageSize)
			.sort({ [sortByFilter]: sortDirectionFilter });

		return users.map((user) => {
			return {
				id: user.id,
				login: user.login,
				email: user.email,
				createdAt: user.createdAt,
			};
		});
	}

	async findUserById(id: string) {
		return this.userModel.findOne({ id: id }, { _id: 0 });
	}

	async findUserByLogin(login: string) {
		return this.userModel.findOne({ login });
	}

	async findUserByEmail(email: string) {
		return this.userModel.findOne({ email });
	}

	async findUserByConfirmationCode(code: string) {
		return this.userModel.findOne({ confirmationCode: code });
	}

	async findUserByRecoveryCode(recoveryCode: string) {
		return this.userModel.findOne({ recoveryCode: recoveryCode });
	}

	async updateConfirmationCode(code: string) {
		return this.userModel.findOneAndUpdate({ confirmationCode: code }, { isConfirmed: true });
	}

	async addRecoveryCode(email: string, recoveryCode: string) {
		return this.userModel.updateOne({ email: email }, { $set: { recoveryCode: recoveryCode } });
	}

	async setNewPassword(recoveryCode: string, passwordHash: string) {
		return this.userModel.updateOne({ recoveryCode: recoveryCode }, { password: passwordHash });
	}

	async deleteUserById(id: string) {
		return this.userModel.findOneAndDelete({ id: id });
	}

	async deleteAll() {
		return this.userModel.deleteMany().exec();
	}

	async countUsers(searchLoginTerm: string | null, searchEmailTerm: string | null) {
		const filter = this.getFilterForQuery(searchLoginTerm, searchEmailTerm);
		return this.userModel.count(filter);
	}

	private getFilterForSortBy(sortBy: string | null) {
		if (sortBy) {
			return sortBy;
		} else return 'createdAt';
	}

	private getFilterForSortDirection(sortDirection: string | null) {
		if (!sortDirection || sortDirection === 'asc') {
			return 1;
		}
		if (sortDirection === 'desc') {
			return -1;
		}
	}

	private getFilterForQuery(searchLoginTerm: string | null, searchEmailTerm: string | null) {
		if (!searchLoginTerm && !searchEmailTerm) return {};
		if (searchLoginTerm && !searchEmailTerm)
			return { login: { $regex: searchLoginTerm, $options: 'i' } };
		if (!searchLoginTerm && searchEmailTerm)
			return { email: { $regex: searchEmailTerm, $options: 'i' } };
		if (searchLoginTerm && searchEmailTerm)
			return {
				$or: [
					{ login: { $regex: searchLoginTerm, $options: 'i' } },
					{ email: { $regex: searchEmailTerm, $options: 'i' } },
				],
			};
	}
}
