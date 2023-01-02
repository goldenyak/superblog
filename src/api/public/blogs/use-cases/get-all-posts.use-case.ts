import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../blogs.repository';
import { BlogsQueryParams } from '../dto/blogs-query.dto';
import { CreatePostsDto } from '../../posts/dto/create-post.dto';
import { PostsService } from '../../posts/posts.service';

@Injectable()
export class GetAllPostByBlogIdUseCase {
	constructor(private readonly postsService: PostsService) {}

	async execute({ pageNumber, pageSize, sortBy, sortDirection }, blogId: string, userId: string) {
		return await this.postsService.getAllPostsByBlogId(
			pageNumber,
			pageSize,
			sortBy,
			sortDirection,
			blogId,
			userId,
		);
	}
}
