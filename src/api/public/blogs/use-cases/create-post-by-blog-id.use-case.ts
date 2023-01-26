import { Injectable } from '@nestjs/common';
import { CreatePostsDto } from "../../posts/dto/create-post.dto";
import { PostsService } from "../../posts/posts.service";
import { Blogs } from "../schemas/blogs.schema";

@Injectable()
export class CreatePostByBlogIdUseCase {
	constructor(private readonly postsService: PostsService) {}


	async execute(dto: CreatePostsDto, foundedBlog: Blogs) {
		return await this.postsService.create(dto, foundedBlog);
	}
}
