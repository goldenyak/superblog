import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import {
	BanStatusEnum,
	UpdateBanUserDto,
} from '../../super-admin/api/users/dto/update-ban-user.dto';

@Injectable()
export class UsersRepository {
	constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

	async create(dto: CreateUserDto) {
		return this.userModel.create(dto);
	}

	async getAllUsers(
		banStatus: string,
		searchLoginTerm: string,
		searchEmailTerm: string,
		pageNumber: number,
		pageSize: number,
		sortBy: string,
		sortDirection: string,
	) {
		const filter = this.getFilterForQuery(searchLoginTerm, searchEmailTerm, banStatus);
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
				banInfo: {
					isBanned: user.banInfo.isBanned,
					banDate: user.banInfo.banDate,
					banReason: user.banInfo.banReason,
				},
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

	async updateUserBanInfo(id: string, dto: UpdateBanUserDto) {
		return this.userModel.findOneAndUpdate(
			{ id: id },
			{ 'banInfo.isBanned': dto.isBanned, 'banInfo.banReason': dto.banReason },
		);
	}

	async unbanUser(id: string, dto: UpdateBanUserDto) {
		return this.userModel.findOneAndUpdate(
			{ id: id },
			{ 'banInfo.isBanned': dto.isBanned, 'banInfo.banDate': null, 'banInfo.banReason': null },
		);
	}

	async addNewConfirmationCodeByEmail(email: string, newConfirmationCode: string) {
		return this.userModel.findOneAndUpdate({ email }, { confirmationCode: newConfirmationCode });
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

	async countUsers(
		searchLoginTerm: string | null,
		searchEmailTerm: string | null,
		banStatus: string,
	) {
		const filter = this.getFilterForQuery(searchLoginTerm, searchEmailTerm, banStatus);
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

	private getFilterForQuery(
		searchLoginTerm: string | null,
		searchEmailTerm: string | null,
		banStatus: string,
	) {
		const searchTerms = [];
		if (searchLoginTerm) searchTerms.push({ login: { $regex: searchLoginTerm, $options: 'i' } });
		if (searchEmailTerm) searchTerms.push({ email: { $regex: searchEmailTerm, $options: 'i' } });
		let banFilter;
		switch (banStatus) {
			case BanStatusEnum.all:
				banFilter = null;
				break;
			case BanStatusEnum.banned:
				banFilter = { 'banInfo.isBanned': true };
				break;
			case BanStatusEnum.notBanned:
				banFilter = { 'banInfo.isBanned': false };
		}
		if (!banFilter && !searchTerms.length) {
			return {};
		} else if (banFilter && searchTerms.length)
			return { $and: { $or: [...searchTerms], banFilter } };
		else if (banFilter) {
			return banFilter;
		} else {
			return { $or: [...searchTerms] };
		}
	}
}
