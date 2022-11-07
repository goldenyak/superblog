import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpException,
	HttpStatus,
	Param,
	Post,
	Put,
	Query,
} from '@nestjs/common';
import { CreateBlogsDto } from './dto/create-blogs.dto';
import { BlogsService } from './blogs.service';
import { NOT_FOUND_BLOG_ERROR } from './constants/blogs.constants';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Controller('blogs')
export class BlogsController {
	constructor(private readonly blogsService: BlogsService) {}

	@Post()
	async create(@Body() dto: CreateBlogsDto) {
		return await this.blogsService.create(dto);
	}

	@HttpCode(200)
	@Get()
	async getAllBlogs(
		@Query('searchNameTerm') searchNameTerm: string,
		@Query('pageNumber') pageNumber: number,
		@Query('pageSize') pageSize: number,
		@Query('sortBy') sortBy: string,
		@Query('sortDirection') sortDirection: string,
	) {
		return await this.blogsService.getAllBlogs(
			searchNameTerm,
			pageNumber,
			pageSize,
			sortBy,
			sortDirection,
		);
	}

	@Get(':id')
	async findBlogById(@Param('id') id: string) {
		const foundedBlog = await this.blogsService.findBlogById(id);
		if (!foundedBlog) {
			throw new HttpException(NOT_FOUND_BLOG_ERROR, HttpStatus.NOT_FOUND);
		}
		return foundedBlog;
	}

	@HttpCode(204)
	@Delete(':id')
	async deleteBlogById(@Param('id') id: string) {
		const deletedBlog = await this.blogsService.deleteBlogById(id);
		if (!deletedBlog) {
			throw new HttpException(NOT_FOUND_BLOG_ERROR, HttpStatus.NOT_FOUND);
		}
		return;
	}

	@HttpCode(204)
	@Put(':id')
	async updateBlogById(@Body() dto: UpdateBlogDto, @Param('id') id: string) {
		const blog = await this.blogsService.updateBlogById(id, dto.name, dto.youtubeUrl);
		if (!blog) {
			throw new HttpException(NOT_FOUND_BLOG_ERROR, HttpStatus.NOT_FOUND);
		}
		return;
	}
}
