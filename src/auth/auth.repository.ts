import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Auth, AuthDocument } from "./schemas/auth.schema";
import { AuthDto } from "./dto/auth.dto";

@Injectable()
export class AuthRepository {
	constructor(@InjectModel(Auth.name) private readonly authModel: Model<AuthDocument>) {}

	async create(dto: AuthDto) {
		return await this.authModel.create(dto);
	}
}
