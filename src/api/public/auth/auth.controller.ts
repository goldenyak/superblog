import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpCode,
	Post,
	Req,
	Res,
	UnauthorizedException,
	UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { FindUserByCodeDto } from '../users/dto/find-user-by-code.dto';
import { EmailResendingDto } from './dto/email-resending.dto';
import { ThrottlerIpGuard } from '../../../guards/throttle-ip.guard';
import { SessionsService } from '../sessions/sessions.service';
import { NewPasswordDto } from './dto/new-password.dto';
import { CommandBus } from '@nestjs/cqrs';
import { FindUserByLoginCommand } from '../users/use-cases/find-user-by-login.use-case';
import { CreateUserCommand } from '../users/use-cases/create-user.use-case';
import { CheckRefreshTokenCommand } from './use-cases/check-refresh-token.use-case';
import { SendConfirmEmailCommand } from './use-cases/send-confirm-email.use-case';
import { LoginCommand } from './use-cases/login.use-case';
import { CreateNewTokenCommand } from './use-cases/create-new-token.use-case';
import { GetLastActiveDateFromRefreshTokenCommand } from './use-cases/get-last-active-date-from-refresh-token.use-case';
import { SendNewConfirmEmailCommand } from './use-cases/send-new-confirm-email.use-case';
import { SendRecoveryPasswordEmailCommand } from './use-cases/send-recovery-password-email.use-case';
import { SetNewPasswordCommand } from './use-cases/set-new-password.use-case';
import { FindUserByEmailCommand } from '../users/use-cases/find-user-by-email.use-case';
import { ValidateUserCommand } from '../users/use-cases/validate-user.use-case';
import { FindUserByConfirmationCodeCommand } from '../users/use-cases/find-user-by-confirmation-code.use-case';
import { UpdateConfirmationCodeCommand } from '../users/use-cases/update-confirmation-code.use-case';
import { FindUserByRecoveryCodeCommand } from '../users/use-cases/find-user-by-recovery-code.use-case';
import { FindUserByIdCommand } from '../users/use-cases/find-user-by-id.use-case';
import { CreateNewSessionCommand } from '../sessions/use-cases/create-new-session.use-case';
import { GetLastActiveSessionCommand } from '../sessions/use-cases/get-last-active-session.use-case';
import { DeleteSessionCommand } from "../sessions/use-cases/delete-session.use-case";
import { UpdateSessionAfterRefreshCommand } from "../sessions/use-cases/update-session-after-refresh.use-case";

@Controller('auth')
export class AuthController {
	constructor(
		private readonly commandBus: CommandBus,
	) {}

	@UseGuards(ThrottlerIpGuard)
	@HttpCode(204)
	@Post('registration')
	async register(@Body() dto: CreateUserDto) {
		const checkUserByLogin = await this.commandBus.execute(new FindUserByLoginCommand(dto.login));
		const checkUserByEmail = await this.commandBus.execute(new FindUserByEmailCommand(dto.email));
		const existsErrors = [];
		if (checkUserByLogin) {
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
		const newUser = await this.commandBus.execute(new CreateUserCommand(dto));
		const confirmEmail = await this.commandBus.execute(new SendConfirmEmailCommand(dto.email));
		const emailResponseCode = confirmEmail.response.split(' ')[0];
		return newUser;
	}

	// @UseGuards(ThrottlerIpGuard)
	@HttpCode(200)
	@Post('login')
	async login(
		@Res({ passthrough: true }) res: Response,
		@Req() req: Request,
		@Body() dto: LoginDto,
	) {
		const userIp = req.ip;
		const sessionTitle = req.headers['user-agent'];

		const user = await this.commandBus.execute(
			new ValidateUserCommand(dto.loginOrEmail, dto.password),
		);
		const { accessToken, refreshToken } = await this.commandBus.execute(
			new LoginCommand(user.email, user.id, user.login),
		);
		await this.commandBus.execute(
			new CreateNewSessionCommand(userIp, user.id, refreshToken, sessionTitle),
		);
		res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
		return {
			accessToken,
			refreshToken,
		};
	}

	@HttpCode(200)
	@Post('refresh-token')
	async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		const refreshToken = req.cookies.refreshToken;
		if (!req.cookies || !refreshToken) {
			throw new UnauthorizedException();
		}
		const result = await this.commandBus.execute(new CheckRefreshTokenCommand(refreshToken));
		if (!result) {
			throw new UnauthorizedException();
		}
		const oldLastActiveDate = new Date(result.iat * 1000);
		const foundedDevice = await this.commandBus.execute(
			new GetLastActiveSessionCommand(result.id, result.deviceId, oldLastActiveDate),
		);
		if (!foundedDevice) {
			throw new UnauthorizedException();
		}
		const { newAccessToken, newRefreshToken } = await this.commandBus.execute(
			new CreateNewTokenCommand(result.email, result.id, result.deviceId),
		);
		const newLastActiveDate = await this.commandBus.execute(
			new GetLastActiveDateFromRefreshTokenCommand(newRefreshToken),
		);
		await this.commandBus.execute(new UpdateSessionAfterRefreshCommand(foundedDevice.deviceId, newLastActiveDate));
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
		const result = await this.commandBus.execute(new CheckRefreshTokenCommand(refreshToken));
		if (!result) {
			throw new UnauthorizedException();
		}
		const lastActiveDate = await this.commandBus.execute(
			new GetLastActiveDateFromRefreshTokenCommand(refreshToken),
		);
		const foundedDevice = await this.commandBus.execute(
			new GetLastActiveSessionCommand(result.id, result.deviceId, lastActiveDate),
		);
		if (!foundedDevice) {
			throw new UnauthorizedException();
		}
		res.clearCookie('refreshToken');
		return this.commandBus.execute(new DeleteSessionCommand(result.deviceId));
	}

	@UseGuards(ThrottlerIpGuard)
	@HttpCode(204)
	@Post('registration-confirmation')
	async registrationConfirmation(@Body() dto: FindUserByCodeDto) {
		const foundedUser = await this.commandBus.execute(
			new FindUserByConfirmationCodeCommand(dto.code),
		);
		if (!foundedUser || foundedUser.isConfirmed === true) {
			throw new BadRequestException([
				{
					message: 'wrong code',
					field: 'code',
				},
			]);
		}
		return await this.commandBus.execute(new UpdateConfirmationCodeCommand(dto.code));
	}

	@UseGuards(ThrottlerIpGuard)
	@HttpCode(204)
	@Post('registration-email-resending')
	async registrationEmailResending(@Body() dto: EmailResendingDto, @Req() req: Request) {
		const checkUserByEmail = await this.commandBus.execute(new FindUserByEmailCommand(dto.email));
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
		return this.commandBus.execute(new SendNewConfirmEmailCommand(dto.email));
		// const emailResponseCode = confirmEmail.response.split(' ')[0];
		// console.log(emailResponseCode);
		// return confirmEmail;
	}

	@UseGuards(ThrottlerIpGuard)
	@HttpCode(204)
	@Post('password-recovery')
	async passwordRecovery(@Body() dto: EmailResendingDto, @Req() req: Request) {
		return await this.commandBus.execute(new SendRecoveryPasswordEmailCommand(dto.email));
	}

	@UseGuards(ThrottlerIpGuard)
	@HttpCode(204)
	@Post('new-password')
	async newPassword(@Body() dto: NewPasswordDto, @Req() req: Request) {
		const user = await this.commandBus.execute(new FindUserByRecoveryCodeCommand(dto.recoveryCode));
		if (!user || user.recoveryCode !== dto.recoveryCode) {
			throw new BadRequestException([
				{
					message: 'bad recoveryCode',
					field: 'recoveryCode',
				},
			]);
		}
		return await this.commandBus.execute(
			new SetNewPasswordCommand(dto.recoveryCode, dto.newPassword),
		);
	}

	@HttpCode(200)
	@UseGuards(JwtAuthGuard)
	@Get('me')
	async me(@Req() req: Request) {
		const user = await this.commandBus.execute(new FindUserByIdCommand(req.user.id));
		return {
			email: user.email,
			login: user.login,
			userId: user.id,
		};
	}
}
