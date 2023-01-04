import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sessions, SessionsDocument } from './schemas/session.schema';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionsRepository {
	constructor(
		@InjectModel(Sessions.name) private readonly sessionsModel: Model<SessionsDocument>,
	) {}

	async create(session: CreateSessionDto) {
		return await this.sessionsModel.create(session);
	}

	async getAllSessions(userId: string) {
		return this.sessionsModel.find({ userId: userId });
	}

	async getSessionsByDeviceId(deviceId: string) {
		return this.sessionsModel.findOne({ deviceId: deviceId }, { _id: 0 });
	}

	async deleteSessionByDeviceId(deviceId: string) {
		return this.sessionsModel.findOneAndDelete({ deviceId: deviceId });
	}

	async updateSessionAfterRefresh(deviceId: string, lastActiveDate: Date) {
		return this.sessionsModel.findOneAndUpdate({deviceId: deviceId}, {$set: {lastActiveDate: lastActiveDate}})
	}

	async deleteAllSessionsWithExclude(deviceId: string, userId: string) {
		return this.sessionsModel.deleteMany({ deviceId: { $ne: deviceId },  userId: userId} );
	}

	async deleteAll() {
		return this.sessionsModel.deleteMany().exec();
	}

	async getSessionByUserAndDeviceIdAndLastActiveDate(userId: string, deviceId: string, lastActiveDate: Date) {
		return this.sessionsModel.findOne({userId, deviceId, lastActiveDate})
	}

	deleteAllSessionForBanUser(id: string) {
		return this.sessionsModel.deleteMany({ userId: id} );
	}
}
