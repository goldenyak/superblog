import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../blogs.repository';
import { BlogsQueryParams } from '../dto/blogs-query.dto';
import { CreatePostsDto } from "../../posts/dto/create-post.dto";
import { PostsService } from "../../posts/posts.service";

@Injectable()
export class CreatePostByBlogIdUseCase {
	constructor(private readonly postsService: PostsService) {}


	async execute(dto: CreatePostsDto, blogId: string) {
		// const newPost = {
		// 	id: uuidv4(),
		// 	title: dto.title,
		// 	shortDescription: dto.shortDescription,
		// 	content: dto.content,
		// 	blogId: blogById.id,
		// 	blogName: blogById.name,
		// 	createdAt: new Date(),
		// };
		return await this.postsService.create(dto, blogId);
	}
}
