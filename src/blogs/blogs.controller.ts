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
	Query, UseGuards
} from "@nestjs/common";
import { CreateBlogsDto } from './dto/create-blogs.dto';
import { BlogsService } from './blogs.service';
import { NOT_FOUND_BLOG_ERROR } from './constants/blogs.constants';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CreatePostsDto } from '../posts/dto/create-post.dto';
import { BasicAuthGuard } from "../guards/basic-auth.guard";

@Controller('blogs')
export class BlogsController {
	constructor(private readonly blogsService: BlogsService) {}

	@UseGuards(BasicAuthGuard)
	@Post()
	async create(@Body() dto: CreateBlogsDto) {
		return await this.blogsService.create(dto);
	}

	@UseGuards(BasicAuthGuard)
	@Post(':blogId/posts')
	async createPostByBlogId(@Param('blogId') blogId: string, @Body() dto: CreatePostsDto) {
		const blogById = await this.blogsService.findBlogById(blogId);
		if (!blogById) {
			throw new HttpException(NOT_FOUND_BLOG_ERROR, HttpStatus.NOT_FOUND);
		}
		return await this.blogsService.createPostByBlogId(blogById, dto);
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

	@HttpCode(200)
	@Get(':id/posts')
	async getAllPostsByBlogId(
		@Param('id') id: string,
		@Query('pageNumber') pageNumber: number,
		@Query('pageSize') pageSize: number,
		@Query('sortBy') sortBy: string,
		@Query('sortDirection') sortDirection: string,
		@Query('blogId') blogId: string,
	) {
		const blogById = await this.blogsService.findBlogById(id);
		if (!blogById) {
			throw new HttpException(NOT_FOUND_BLOG_ERROR, HttpStatus.NOT_FOUND);
		}
		return await this.blogsService.getAllPostsByBlogId(
			pageNumber,
			pageSize,
			sortBy,
			sortDirection,
			blogId,
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

	@UseGuards(BasicAuthGuard)
	@HttpCode(204)
	@Delete(':id')
	async deleteBlogById(@Param('id') id: string) {
		const deletedBlog = await this.blogsService.deleteBlogById(id);
		if (!deletedBlog) {
			throw new HttpException(NOT_FOUND_BLOG_ERROR, HttpStatus.NOT_FOUND);
		}
		return;
	}

	@UseGuards(BasicAuthGuard)
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
