import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpCode,
	HttpException,
	HttpStatus,
	Post,
	Req,
	Res,
	UnauthorizedException,
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
import { EmailResendingDto } from './dto/email-resending.dto';
import { ThrottlerIpGuard } from '../guards/throttle-ip.guard';
import { SessionsService } from '../sessions/sessions.service';
import { NewPasswordDto } from './dto/new-password.dto';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly usersService: UsersService,
		private readonly sessionsService: SessionsService,
	) {}

	@UseGuards(ThrottlerIpGuard)
	@HttpCode(204)
	@Post('registration')
	async register(@Body() dto: CreateUserDto) {
		const checkUser = await this.authService.findUser(dto.login);
		const checkUserByEmail = await this.usersService.findUserByEmail(dto.email);
		const existsErrors = [];
		if (checkUser) {
			existsErrors.push({
				message: 'Такой login уже существует',
				field: 'login',
			});
		}
		if (checkUserByEmail) {
			existsErrors.push({
				message: 'Такой email уже существует',
				field: 'email',
			});
		}
		if (existsErrors.length > 0) {
			throw new BadRequestException(existsErrors);
		}
		const newUser = await this.authService.create(dto);
		const confirmEmail = await this.authService.sendConfirmEmail(dto.email);
		const emailResponseCode = confirmEmail.response.split(' ')[0];
		return newUser;
	}

	@UseGuards(ThrottlerIpGuard)
	@HttpCode(200)
	@Post('login')
	async login(
		@Res({ passthrough: true }) res: Response,
		@Req() req: Request,
		@Body() dto: LoginDto,
	) {
		const userIp = req.ip;
		const sessionTitle = req.headers['user-agent'];

		const user = await this.usersService.validateUser(dto.loginOrEmail, dto.password);
		const { accessToken, refreshToken } = await this.authService.login(user.email, user.id);
		await this.sessionsService.createNewSession(userIp, user.id, refreshToken, sessionTitle);
		res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
		return {
			accessToken,
			refreshToken,
		};
	}

	@HttpCode(200)
	@Post('refresh-token')
	async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		// if (!req.cookies) {
		// 	throw new UnauthorizedException();
		// }
		const refreshToken = req.cookies.refreshToken;
		console.log('refreshToken', refreshToken);
		if (!refreshToken) {
			throw new UnauthorizedException();
		}
		const result = await this.authService.checkRefreshToken(refreshToken);
		console.log('result', result);
		if (!result) {
			throw new UnauthorizedException();
		}
		const oldLastActiveDate = new Date(result.iat * 1000)
		const foundedDevice = await this.sessionsService.getSessionByUserAndDeviceIdAndLastActiveDate(result.id, result.deviceId, oldLastActiveDate);
		console.log('foundedDevice', foundedDevice);
		if (!foundedDevice) {
			throw new UnauthorizedException();
		}
		const { newAccessToken, newRefreshToken } = await this.authService.createNewToken(
			result.email,
			result.id,
			result.deviceId,
		);
		const newLastActiveDate = this.authService.getLastActiveDateFromRefreshToken(newRefreshToken)
		await this.sessionsService.updateSessionAfterRefresh(foundedDevice.deviceId, newLastActiveDate);
		res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true });
		return {
			accessToken: newAccessToken,
			newRefreshToken,
		};
	}

	@HttpCode(204)
	@Post('logout')
	async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		const refreshToken = await req.cookies.refreshToken;
		if (!refreshToken) {
			throw new UnauthorizedException();
		}
		const result = await this.authService.checkRefreshToken(refreshToken);
		if (!result) {
			throw new UnauthorizedException();
		}
		const lastActiveDate = this.authService.getLastActiveDateFromRefreshToken(refreshToken)
		const foundedDevice = await this.sessionsService.getSessionByUserAndDeviceIdAndLastActiveDate(result.id, result.deviceId, lastActiveDate);
		if (!foundedDevice) {
			throw new UnauthorizedException();
		}
		res.clearCookie('refreshToken');
		return this.sessionsService.deleteSessionByDeviceId(result.deviceId);
	}

	@UseGuards(ThrottlerIpGuard)
	@HttpCode(204)
	@Post('registration-confirmation')
	async registrationConfirmation(@Body() dto: FindUserByCodeDto) {
		const foundedUser = await this.usersService.findUserByConfirmationCode(dto.code);
		if (!foundedUser || foundedUser.isConfirmed === true) {
			throw new BadRequestException([
				{
					message: 'wrong code',
					field: 'code',
				},
			]);
		}
		return await this.usersService.updateConfirmationCode(dto.code);
	}

	@UseGuards(ThrottlerIpGuard)
	@HttpCode(204)
	@Post('registration-email-resending')
	async registrationEmailResending(@Body() dto: EmailResendingDto, @Req() req: Request) {
		const checkUserByEmail = await this.usersService.findUserByEmail(dto.email);
		if (!checkUserByEmail) {
			throw new BadRequestException([
				{
					message: 'email it does not exist',
					field: 'email',
				},
			]);
		}
		if (checkUserByEmail.isConfirmed) {
			throw new BadRequestException([
				{
					message: 'user has already verified',
					field: 'email',
				},
			]);
		}
		return this.authService.sendNewConfirmEmail(dto.email);
		// const emailResponseCode = confirmEmail.response.split(' ')[0];
		// console.log(emailResponseCode);
		// return confirmEmail;
	}

	@UseGuards(ThrottlerIpGuard)
	@HttpCode(204)
	@Post('password-recovery')
	async passwordRecovery(@Body() dto: EmailResendingDto, @Req() req: Request) {
		return await this.authService.sendRecoveryPasswordEmail(dto.email);
	}

	@UseGuards(ThrottlerIpGuard)
	@HttpCode(204)
	@Post('new-password')
	async newPassword(@Body() dto: NewPasswordDto, @Req() req: Request) {
		const user = await this.usersService.findUserByRecoveryCode(dto.recoveryCode);
		if (!user || user.recoveryCode !== dto.recoveryCode) {
			throw new BadRequestException([
				{
					message: 'bad recoveryCode',
					field: 'recoveryCode',
				},
			]);
		}
		return await this.authService.setNewPassword(dto.recoveryCode, dto.newPassword);
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
