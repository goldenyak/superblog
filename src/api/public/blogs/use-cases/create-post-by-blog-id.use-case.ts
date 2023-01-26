import { Injectable } from '@nestjs/common';
import { CreatePostsDto } from "../../posts/dto/create-post.dto";
import { PostsService } from "../../posts/posts.service";

@Injectable()
export class CreatePostByBlogIdUseCase {
	constructor(private readonly postsService: PostsService) {}


	async execute(dto: CreatePostsDto, blogId: string) {
		return await this.postsService.create(dto, blogId);
	}
}
