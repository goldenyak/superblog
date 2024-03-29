import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpException,
	HttpStatus,
	NotFoundException,
	Param,
	Post,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ALREADY_REGISTERED_ERROR, NOT_FOUND_USER_ERROR } from './constants/users.constants';
import { Request } from 'express';
import { BasicAuthGuard } from '../../../guards/basic-auth.guard';
import { UsersQueryDto } from './dto/users-query.dto';
import { FindUserByIdCommand } from "./use-cases/find-user-by-id.use-case";
import { CommandBus } from "@nestjs/cqrs";

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService,
							private readonly commandBus: CommandBus) {}

	// @UseGuards(BasicAuthGuard)
	// @HttpCode(201)
	// @Post()
	// async create(@Body() dto: CreateUserDto, @Req() req: Request) {
	// 	const currentUser = await this.usersService.findUserByLogin(dto.login);
	// 	if (currentUser) {
	// 		throw new BadRequestException();
	// 	} else {
	// 		return await this.usersService.create(dto);
	// 	}
	// 	// return await this.usersService.create(dto);
	// }

	// @HttpCode(200)
	// @Get()
	// async getAllUsers(@Query() queryParams: UsersQueryDto) {
	// 	return this.usersService.getAllUsers(queryParams);
	// }

	@Get(':id')
	async findUserById(@Param('id') id: string) {
		const foundedUser = await this.commandBus.execute(new FindUserByIdCommand(id))
		if (!foundedUser) {
			throw new NotFoundException(NOT_FOUND_USER_ERROR);
		}
		return foundedUser;
	}

	// @UseGuards(BasicAuthGuard)
	// @HttpCode(204)
	// @Delete('/:id')
	// async deleteUserById(@Param('id') id: string) {
	// 	const deletedUser = await this.usersService.deleteUserById(id);
	// 	if (!deletedUser) {
	// 		throw new NotFoundException(NOT_FOUND_USER_ERROR);
	// 	}
	// 	return;
	// }


	@Delete()
	async deleteAllUsers() {
		return this.usersService.deleteAll();
	}
}
