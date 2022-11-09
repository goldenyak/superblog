import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auth, AuthDocument } from './schemas/auth.schema';

@Injectable()
export class AuthRepository {
	constructor(@InjectModel(Auth.name) private readonly authModel: Model<AuthDocument>) {}

	async deleteAll() {
		return this.authModel.deleteMany().exec();
	}
}
