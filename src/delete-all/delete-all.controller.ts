import { Controller, Delete } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UsersRepository } from '../users/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Model } from 'mongoose';
import { AuthService } from '../auth/auth.service';

@Controller('delete-all')
export class DeleteAllController {
	constructor(
		private readonly usersService: UsersService,
		private readonly authService: AuthService,
	) {}

	@Delete()
	async deleteAll() {
		return await this.usersService.deleteAll();
		// await this.authService.deleteAll();
	}
}
