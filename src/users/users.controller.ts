import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	NotFoundException,
	Param,
	Post,
	Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { NOT_FOUND_USER_ERROR } from './constants/users.constants';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@HttpCode(200)
	@Get()
	async getAllUsers(
		@Query('searchLoginTerm') searchLoginTerm: string,
		@Query('searchEmailTerm') searchEmailTerm: string,
		@Query('pageNumber') pageNumber: number,
		@Query('pageSize') pageSize: number,
		@Query('sortBy') sortBy: string,
		@Query('sortDirection') sortDirection: string,
	) {
		return this.usersService.getAllUsers(
			searchLoginTerm,
			searchEmailTerm,
			pageNumber,
			pageSize,
			sortBy,
			sortDirection,
		);
	}

	@HttpCode(201)
	@Post('create')
	async create(@Body() dto: CreateUserDto) {
		return await this.usersService.create(dto);
	}

	@Get(':id')
	async findUserById(@Param('id') id: string) {
		const foundedUser = await this.usersService.findUserById(id);
		if (!foundedUser) {
			throw new NotFoundException(NOT_FOUND_USER_ERROR);
		}
		return foundedUser;
	}

	@HttpCode(204)
	@Delete('/:id')
	async deleteUserById(@Param('id') id: string) {
		const deletedUser = await this.usersService.deleteUserById(id);
		if (!deletedUser) {
			throw new NotFoundException(NOT_FOUND_USER_ERROR);
		}
	}

	@Delete()
	async deleteAllUsers() {
		return this.usersService.deleteAll();
	}
}
