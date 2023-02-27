import {Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Jwt, JwtDocument } from './schemas/jwt.schema';

@Injectable()
export class AuthService {
	constructor(
		private readonly authRepository: AuthRepository,
	) {}

	async deleteAll() {
		return this.authRepository.deleteAll();
	}


}
