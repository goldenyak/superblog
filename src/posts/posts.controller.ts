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
  Put, Query
} from "@nestjs/common";
import { PostsService } from './posts.service';
import { CreatePostsDto } from './dto/create-post.dto';
import { NOT_FOUND_BLOG_ERROR } from '../blogs/constants/blogs.constants';
import { UpdateBlogDto } from '../blogs/dto/update-blog.dto';
import { NOT_FOUND_POST_ERROR } from './constants/posts.constants';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
	constructor(private readonly postsService: PostsService) {}

	@Post()
	async create(@Body() dto: CreatePostsDto) {
		return await this.postsService.create(dto);
	}

  @HttpCode(200)
  @Get()
  async getAllPosts(
    @Query('pageNumber') pageNumber: number,
    @Query('pageSize') pageSize: number,
    @Query('sortBy') sortBy: string,
    @Query('sortDirection') sortDirection: string,
  ) {
    return await this.postsService.getAllPosts(
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    );
  }

	@Get(':id')
	async findPostById(@Param('id') id: string) {
		const foundedPost = await this.postsService.findPostById(id);
		if (!foundedPost) {
			throw new HttpException(NOT_FOUND_POST_ERROR, HttpStatus.NOT_FOUND);
		}
		return foundedPost;
	}

	@HttpCode(204)
	@Delete(':id')
	async deletePostById(@Param('id') id: string) {
		const deletedPost = await this.postsService.deletePostById(id);
		if (!deletedPost) {
			throw new HttpException(NOT_FOUND_POST_ERROR, HttpStatus.NOT_FOUND);
		}
		return;
	}

	@HttpCode(204)
	@Put(':id')
	async updatePostById(@Body() dto: UpdatePostDto, @Param('id') id: string) {
		const post = await this.postsService.updatePostById(
			id,
			dto.title,
			dto.shortDescription,
			dto.content,
		);
		if (!post) {
			throw new HttpException(NOT_FOUND_BLOG_ERROR, HttpStatus.NOT_FOUND);
		}
		return;
	}
}
