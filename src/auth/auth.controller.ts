import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpException,
	HttpStatus,
	Post,
	Req,
	Res
} from "@nestjs/common";
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ALREADY_REGISTERED_ERROR } from '../users/constants/users.constants';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly usersService: UsersService,
	) {}

	@HttpCode(204)
	@Post('registration')
	async register(@Body() dto: CreateUserDto) {
		const currentUser = await this.authService.findUser(dto.login);
		if (currentUser) {
			throw new HttpException(ALREADY_REGISTERED_ERROR, HttpStatus.BAD_REQUEST);
		} else {
			// const confirmEmail = await this.authService.sendConfirmEmail(dto);
			// const emailResponseCode = confirmEmail.response.split(' ')[0];
			return await this.authService.create(dto);
		}
	}

	@HttpCode(200)
	@Post('login')
	async login(
		@Res({ passthrough: true }) res: Response,
		@Req() req: Request,
		@Body() dto: LoginDto,
	) {
		const user = await this.usersService.validateUser(dto.login, dto.password);
		const { accessToken, refreshToken } = await this.authService.login(user.email);
		await res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
		return {
			accessToken: accessToken,
			refreshToken
		};
	}

	@Post('refresh-token')
	async refreshToken() {}

	@Post('registration-confirmation')
	async registrationConfirmation() {}

	@Post('registration-email-resending')
	async registrationEmailFResending() {}

	@Post('logout')
	async logout() {}

	@Get('me')
	async me() {}
}
