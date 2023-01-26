import { Injectable } from '@nestjs/common';
import { PostsService } from "../../posts/posts.service";

@Injectable()
export class FindPostByIdUseCase {
  constructor(private readonly postsService: PostsService) {}


  async execute(postId: string) {
    return await this.postsService.findPostById(postId);
  }
}
