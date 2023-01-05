import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	ForbiddenException,
	Get,
	HttpCode,
	HttpException,
	HttpStatus,
	NotFoundException,
	Param,
	Post,
	Put,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { BasicAuthGuard } from '../../../../guards/basic-auth.guard';
import { CreateUserDto } from '../../../public/users/dto/create-user.dto';
import { UsersService } from '../../../public/users/users.service';
import { UsersQueryDto } from "../../../public/users/dto/users-query.dto";
import { NOT_FOUND_USER_ERROR } from "../../../public/users/constants/users.constants";
import { UpdateBanUserDto } from "./dto/update-ban-user.dto";
import { SessionsService } from "../../../public/sessions/sessions.service";

@Controller('sa/users')
export class SuperAdminController {
	constructor(private readonly usersService: UsersService,
							private readonly sessionsService: SessionsService) {}

	@UseGuards(BasicAuthGuard)
	@HttpCode(201)
	@Post()
	async create(@Body() dto: CreateUserDto, @Req() req: Request) {
		// const currentUser = await this.usersService.findUserByLogin(dto.login);
		// if (currentUser) {
		// 	throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		// }
		return await this.usersService.create(dto);
	}

	@HttpCode(200)
	@Get()
	async getAllUsers(@Query() queryParams: UsersQueryDto) {
		return this.usersService.getAllUsers(queryParams);
	}

	@UseGuards(BasicAuthGuard)
	@HttpCode(204)
	@Put('/:id/ban')
	async updateBanUser(@Param('id') id: string, @Body() dto: UpdateBanUserDto) {
		const foundedUser = await this.usersService.findUserById(id);
		if (!foundedUser) {
			throw new NotFoundException();
		}
		if (!dto.isBanned) {
			return await this.usersService.unbanUser(id, dto)
		}
		await this.usersService.updateUserBanInfo(id, dto)
		return await this.sessionsService.deleteAllSessionForBanUser(id)
	}

	@UseGuards(BasicAuthGuard)
	@HttpCode(204)
	@Delete('/:id')
	async deleteUserById(@Param('id') id: string) {
		const deletedUser = await this.usersService.deleteUserById(id);
		if (!deletedUser) {
			throw new NotFoundException(NOT_FOUND_USER_ERROR);
		}
		return;
	}
}
