import { BlogsModule } from "../api/public/blogs/blogs.module";
import { BlogIdValidation } from "./blog-id.validation";
import { forwardRef, Module } from "@nestjs/common";
import { PostsModule } from "../api/public/posts/posts.module";

@Module({
	imports: [
		BlogsModule,
	],
	controllers: [],
	providers: [BlogIdValidation],
	exports: [BlogIdValidation],
})
export class ValidationModule {}
