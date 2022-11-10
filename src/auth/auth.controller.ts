import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpException,
	HttpStatus,
	Post,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ALREADY_REGISTERED_ERROR } from '../users/constants/users.constants';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { Request, Response } from 'express';
import { NOT_FOUND_TOKEN_ERROR, NOT_FOUND_USER_BY_TOKEN_ERROR } from './constants/auth.constants';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { FindUserByCodeDto } from '../users/dto/find-user-by-code.dto';
import { EmailResendingDto } from "../users/dto/email-resending.dto";
import { ThrottlerIpGuard } from "../guards/throttle-ip.guard";
import { SessionsService } from "../sessions/sessions.service";
import { CreateSessionDto } from "../sessions/dto/create-session.dto";

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly usersService: UsersService,
		private readonly sessionsService: SessionsService,
	) {}

	@HttpCode(204)
	@Post('registration')
	async register(@Body() dto: CreateUserDto) {
		const currentUser = await this.authService.findUser(dto.login);
		if (currentUser) {
			throw new HttpException(ALREADY_REGISTERED_ERROR, HttpStatus.BAD_REQUEST);
		} else {
			const confirmEmail = await this.authService.sendConfirmEmail(dto);
			const emailResponseCode = confirmEmail.response.split(' ')[0];
			console.log(emailResponseCode);
			return await this.authService.create(dto);
		}
	}

	@UseGuards(ThrottlerIpGuard)
	@HttpCode(200)
	@Post('login')
	async login(
		@Res({ passthrough: true }) res: Response,
		@Req() req: Request,
		@Body() dto: LoginDto,
	) {
		const userIp = req.ip
		const sessionTitle = req.headers["user-agent"]

		const user = await this.usersService.validateUser(dto.login, dto.password);
		const { accessToken, refreshToken } = await this.authService.login(user.email, user.id);
		await res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
		await this.sessionsService.createNewSession(userIp, user.id, refreshToken, sessionTitle)
		return {
			accessToken,
			refreshToken
		};
	}

	@HttpCode(200)
	@Post('refresh-token')
	async refreshToken(@Req() req: Request, @Res() res: Response) {
		const refreshToken = await req.cookies.refreshToken;
		if (!refreshToken) {
			throw new HttpException(NOT_FOUND_TOKEN_ERROR, HttpStatus.UNAUTHORIZED);
		}
		const currentUser = await this.authService.checkRefreshToken(refreshToken);
		if (!currentUser) {
			throw new HttpException(NOT_FOUND_USER_BY_TOKEN_ERROR, HttpStatus.UNAUTHORIZED);
		}
		const { newAccessToken, newRefreshToken } = await this.authService.createToken(currentUser);
		await res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true });
		return {
			accessToken: newAccessToken,
		};
	}

	@HttpCode(204)
	@Post('logout')
	async logout(@Req() req: Request) {
		const refreshToken = req.cookies.refreshToken;
		// console.log(refreshToken);
		// Провалидировать токен
		if (!refreshToken) {
			throw new HttpException(NOT_FOUND_TOKEN_ERROR, HttpStatus.UNAUTHORIZED);
		}
		return await this.authService.checkRefreshToken(refreshToken);
	}


	@UseGuards(ThrottlerIpGuard)
	@HttpCode(204)
	@Post('registration-confirmation')
	async registrationConfirmation(@Body() dto: FindUserByCodeDto) {
		return await this.usersService.findUserByConfirmationCode(dto.code);
	}

	@UseGuards(ThrottlerIpGuard)
	@Post('registration-email-resending')
	async registrationEmailFResending(@Body() dto: EmailResendingDto) {
		const user = await this.usersService.findUserByEmail(dto.email)
		if (user && user.isConfirmed) {
			// throw new HttpException({}, 200);
		}
	}

	@HttpCode(200)
	@UseGuards(JwtAuthGuard)
	@Get('me')
	async me(@Req() req: Request) {
		const user = await this.usersService.findUserById(req.user.id);
		return {
			email: user.email,
			login: user.login,
			userId: user.id,
		};
	}
}
