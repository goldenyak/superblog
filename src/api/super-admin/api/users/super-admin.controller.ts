import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
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
import { UsersQueryDto } from '../../../public/users/dto/users-query.dto';
import { NOT_FOUND_USER_ERROR } from '../../../public/users/constants/users.constants';
import { UpdateBanUserDto } from './dto/update-ban-user.dto';
import { SessionsService } from '../../../public/sessions/sessions.service';
import { LikesService } from '../../../public/likes/likes.service';
import { GetAllBlogsCommand } from '../../../public/blogs/use-cases/get-all-blogs.use-case';
import { BlogsQueryParams } from '../../../public/blogs/dto/blogs-query.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../../public/users/use-cases/create-user.use-case';
import { FindUserByIdCommand } from '../../../public/users/use-cases/find-user-by-id.use-case';
import { UpdateBanBlogDto } from './dto/update-ban-blog.dto';
import { GetBlogByIdWithOwnerInfoCommand } from '../../../public/blogs/use-cases/get-blog-by-id-with-owner-info.use-case';
import { BanBlogCommand } from '../../../public/blogs/use-cases/ban-blog.use-case';
import { UnBanBlogCommand } from "../../../public/blogs/use-cases/unBan-blog.use-case";

@Controller('sa')
export class SuperAdminController {
	constructor(
		private readonly usersService: UsersService,
		private readonly sessionsService: SessionsService,
		private readonly likesService: LikesService,
		private readonly commandBus: CommandBus,
	) {}

	@UseGuards(BasicAuthGuard)
	@HttpCode(201)
	@Post('/users')
	async create(@Body() dto: CreateUserDto, @Req() req: Request) {
		return await this.commandBus.execute(new CreateUserCommand(dto));
	}

	@UseGuards(BasicAuthGuard)
	@HttpCode(200)
	@Get('/users')
	async getAllUsers(@Query() queryParams: UsersQueryDto) {
		return this.usersService.getAllUsers(queryParams);
	}

	@UseGuards(BasicAuthGuard)
	@HttpCode(200)
	@Get('/blogs')
	async getBlogs(@Query() queryParams: BlogsQueryParams) {
		return this.commandBus.execute(new GetAllBlogsCommand(queryParams));
	}

	@UseGuards(BasicAuthGuard)
	@HttpCode(204)
	@Put('/users/:id/ban')
	async updateBanUser(@Param('id') id: string, @Body() dto: UpdateBanUserDto) {
		const foundedUser = await this.commandBus.execute(new FindUserByIdCommand(id));
		if (!foundedUser) {
			throw new NotFoundException();
		}
		if (!dto.isBanned) {
			await this.likesService.unbanUserLikeStatus(id);
			return await this.usersService.unbanUser(id, dto);
		}
		await this.usersService.banUser(id, dto);
		await this.likesService.banUserLikeStatus(id);
		return await this.sessionsService.deleteAllSessionForBanUser(id);
	}

	@UseGuards(BasicAuthGuard)
	@HttpCode(204)
	@Put('/blogs/:id/ban')
	async updateBanBlog(@Param('id') id: string, @Body() dto: UpdateBanBlogDto) {
		const foundedBlog = await this.commandBus.execute(new GetBlogByIdWithOwnerInfoCommand(id));
		if (!foundedBlog) {
			throw new NotFoundException();
		}
		if (!dto.isBanned) {
			return await this.commandBus.execute(new UnBanBlogCommand(id, dto));
		}
		await this.commandBus.execute(new BanBlogCommand(id, dto));
	}

	@UseGuards(BasicAuthGuard)
	@HttpCode(204)
	@Delete('/users/:id')
	async deleteUserById(@Param('id') id: string) {
		const deletedUser = await this.usersService.deleteUserById(id);
		if (!deletedUser) {
			throw new NotFoundException(NOT_FOUND_USER_ERROR);
		}
		return;
	}
}
