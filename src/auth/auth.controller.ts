import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from './auth.service';

import { CreateUserDto } from "../users/dto/create-user.dto";
import { ALREADY_REGISTERED_ERROR } from "../users/constants/users.constants";

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@HttpCode(204)
	@Post('registration')
	async register(@Body() dto: CreateUserDto) {
		const currentUser = await this.authService.findUser(dto.login);
		if (currentUser) {
			throw new HttpException(ALREADY_REGISTERED_ERROR, HttpStatus.BAD_REQUEST);
		} else {
			return await this.authService.create(dto);
		}
	}

	@Post('login')
	async login() {}

	@Post('refresh-token')
	async refreshToken() {}

	@Post('registration-confirmation')
	async registrationConfirmation() {}

	@Post('registration-email-=resending')
	async registrationEmailFResending() {}

	@Post('logout')
	async logout() {}

	@Get('me')
	async me() {}
}
