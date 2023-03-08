import {
	Body,
	Controller,
	Delete,
	ForbiddenException,
	Get,
	HttpCode,
	NotFoundException,
	Param,
	Post,
	Put,
	Query,
	Req,
	UnauthorizedException,
	UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { BlogsService } from '../../public/blogs/blogs.service';
import { BlogsRepository } from '../../public/blogs/blogs.repository';
import { CreateBlogUseCase } from '../../public/blogs/use-cases/create-blog.use-case';
import { CreatePostByBlogIdUseCase } from '../../public/blogs/use-cases/create-post-by-blog-id.use-case';
import { CreateBlogsDto } from '../../public/blogs/dto/create-blogs.dto';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { CreatePostsDto } from '../../public/posts/dto/create-post.dto';
import { UpdateBlogDto } from '../../public/blogs/dto/update-blog.dto';
import {
	GetAllBlogsForCurrentUserCommand,
	GetAllBlogsForCurrentUserUseCase,
} from '../use-cases/get-all-blogs-for-current-user.use-case';
import { UpdatePostDto } from '../../public/posts/dto/update-post.dto';
import { FindPostByIdUseCase } from '../../public/blogs/use-cases/find-post-by-id.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { GetBlogByIdWithOwnerInfoCommand } from '../../public/blogs/use-cases/get-blog-by-id-with-owner-info.use-case';
import { FindAllBannedUsersCommand } from '../../public/users/use-cases/find-all-banned-users.use-case';
import { BannedUsersQueryDto } from '../../public/users/dto/banned-users-query.dto';
import { FindUserByIdCommand } from '../../public/users/use-cases/find-user-by-id.use-case';
import { UnbanUserLikeStatusCommand } from '../../public/likes/use-cases/unban-user-like-status.use-case';
import { BanUserLikeStatusCommand } from '../../public/likes/use-cases/ban-user-like-status.use-case';
import { DeleteAllSessionForBanUserCommand } from '../../public/sessions/use-cases/delete-all-session-for-ban-user.use-case';
import { UpdateBanUserForBlogDto } from '../../super-admin/api/users/dto/update-ban-user-for-blog.dto';
import { BanUserForBlogCommand } from '../../public/users/use-cases/ban-user-for-blog.use-case';
import { UnBanUserForBlogCommand } from '../../public/users/use-cases/unban-user-for-blog.use-case';
import { AllCommentsForBlogQueryParams } from '../../public/comments/dto/all-comments-for-blog-query.dto';
import { GetAllPostsForCurrentUserCommand } from '../../public/posts/use-cases/get-all-posts-for-current-user.use-case';
import { GetAllCommentsForCurrentUserCommand } from '../../public/comments/use-cases/get-all-comments-for-current-user.use-case';
import { BlogsQueryParams } from '../../public/blogs/dto/blogs-query.dto';
import { GetAllBlogsForOwnerCommand } from '../use-cases/get-all-blogs-for-owner.use-case';

@Controller('blogger')
export class BloggersController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly blogsService: BlogsService,
		private readonly blogsRepository: BlogsRepository,
		private readonly createBlogUseCase: CreateBlogUseCase,
		private readonly getAllBlogsByUser: GetAllBlogsForCurrentUserUseCase,
		private readonly createPost: CreatePostByBlogIdUseCase,
		private readonly findPostById: FindPostByIdUseCase,
	) {}

	@UseGuards(JwtAuthGuard)
	@HttpCode(200)
	@Get('/blogs')
	async getAllBlogsForOwner(@Query() queryParams: BlogsQueryParams, @Req() req: Request) {
		const currentUser = await this.commandBus.execute(new FindUserByIdCommand(req.user.id));
		if (!currentUser) {
			throw new UnauthorizedException();
		}
		return await this.commandBus.execute(
			new GetAllBlogsForOwnerCommand(queryParams, currentUser.id),
		);
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(200)
	@Get('/users/blog/:id')
	async getAllBannedUsersForBlog(
		@Param('id') id: string,
		@Query() queryParams: BannedUsersQueryDto,
		@Req() req: Request,
	) {
		const currentUser = await this.commandBus.execute(new FindUserByIdCommand(req.user.id));
		const blog = await this.commandBus.execute(new GetBlogByIdWithOwnerInfoCommand(id));
		if (!blog) {
			throw new NotFoundException();
		}
		if (currentUser.id !== blog.bloggerOwnerInfo.userId || !currentUser) {
			throw new ForbiddenException();
		}
		return await this.commandBus.execute(new FindAllBannedUsersCommand(queryParams));
	}

	@HttpCode(200)
	@Get('/users/blog')
	async getAllBannedUsers(@Query() queryParams: BannedUsersQueryDto, @Req() req: Request) {
		return await this.commandBus.execute(new FindAllBannedUsersCommand(queryParams));
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(204)
	@Put('/users/:id/ban')
	async updateBanUserForBlog(
		@Param('id') id: string,
		@Body() dto: UpdateBanUserForBlogDto,
		@Req() req: Request,
	) {
		const blog = await this.commandBus.execute(new GetBlogByIdWithOwnerInfoCommand(dto.blogId));
		if (!blog) {
			throw new NotFoundException();
		}
		if (blog.bloggerOwnerInfo.userId !== req.user.id) {
			throw new ForbiddenException();
		}
		const foundedUser = await this.commandBus.execute(new FindUserByIdCommand(id));
		if (!foundedUser) {
			throw new NotFoundException();
		}
		if (!dto.isBanned) {
			await this.commandBus.execute(new UnbanUserLikeStatusCommand(id));
			return await this.commandBus.execute(new UnBanUserForBlogCommand(id, dto));
		}
		await this.commandBus.execute(new BanUserForBlogCommand(id, dto));
		await this.commandBus.execute(new BanUserLikeStatusCommand(id));
		return await this.commandBus.execute(new DeleteAllSessionForBanUserCommand(id));
	}

	@UseGuards(JwtAuthGuard)
	@Post('/blogs')
	async createBlog(@Body() dto: CreateBlogsDto, @Req() req: Request) {
		const { id, login } = req.user;
		const user = await this.commandBus.execute(new FindUserByIdCommand(id));
		if (!user || user.banInfo.isBanned) {
			throw new UnauthorizedException();
		}
		return await this.createBlogUseCase.execute(dto, id, login);
	}

	@UseGuards(JwtAuthGuard)
	@Post('/blogs/:blogId/posts')
	async createPostByBlogId(
		@Param('blogId') blogId: string,
		@Body() dto: CreatePostsDto,
		@Req() req: Request,
	) {
		const foundedBlog = await this.blogsRepository.findBlogById(blogId);
		if (!foundedBlog) {
			throw new NotFoundException();
		}
		// if (foundedBlog.bloggerOwnerInfo.userId !== req.user.id) {
		//   throw new ForbiddenException();
		// }
		return await this.createPost.execute(dto, foundedBlog);
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(204)
	@Put('/blogs/:id')
	async updateBlogById(@Body() dto: UpdateBlogDto, @Param('id') id: string, @Req() req: Request) {
		const foundedBlog = await this.blogsService.findBlogByIdWithBloggerInfo(id);
		if (!foundedBlog) {
			throw new NotFoundException();
		}
		if (foundedBlog.bloggerOwnerInfo.userId !== req.user.id) {
			throw new ForbiddenException();
		}
		return await this.blogsService.updateBlogById(id, dto.name, dto.description, dto.websiteUrl);
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(204)
	@Delete('/blogs/:id')
	async deleteBlogById(@Param('id') id: string, @Req() req: Request) {
		const foundedBlog = await this.commandBus.execute(new GetBlogByIdWithOwnerInfoCommand(id));
		if (!foundedBlog) {
			throw new NotFoundException();
		}
		if (foundedBlog.bloggerOwnerInfo.userId !== req.user.id) {
			throw new ForbiddenException();
		}
		return await this.blogsService.deleteBlogById(id);
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(204)
	@Put('/blogs/:blogId/posts/:postId')
	async updatePostForSpecifiedBlog(
		@Body() dto: UpdatePostDto,
		@Param('blogId') blogId: string,
		@Param('postId') postId: string,
		@Req() req: Request,
	) {
		const foundedBlog = await this.commandBus.execute(new GetBlogByIdWithOwnerInfoCommand(blogId));
		if (!foundedBlog) {
			throw new NotFoundException();
		}
		if (foundedBlog.bloggerOwnerInfo.userId !== req.user.id) {
			throw new ForbiddenException();
		}
		const foundedPost = await this.findPostById.execute(postId);
		if (!foundedPost) {
			throw new NotFoundException();
		}
		if (foundedPost.blogId !== blogId) {
			throw new ForbiddenException();
		}
		return await this.blogsService.updatePostForSpecifiedBlog(postId, dto);
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(204)
	@Delete('/blogs/:blogId/posts/:postId')
	async deletePostForSpecifiedBlog(
		@Param('blogId') blogId: string,
		@Param('postId') postId: string,
		@Req() req: Request,
	) {
		const foundedBlog = await this.blogsService.findBlogByIdWithBloggerInfo(blogId);
		if (!foundedBlog) {
			throw new NotFoundException();
		}
		if (foundedBlog.bloggerOwnerInfo.userId !== req.user.id) {
			throw new ForbiddenException();
		}
		const foundedPost = await this.findPostById.execute(postId);
		if (!foundedPost) {
			throw new NotFoundException();
		}
		if (foundedPost.blogId !== blogId) {
			throw new ForbiddenException();
		}
		return await this.blogsService.deletePostForSpecifiedBlog(postId);
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(200)
	@Get('/blogs/comments')
	async getAllCommentsForAllPosts(
		// @Query('pageNumber') pageNumber = 1,
		// @Query('pageSize') pageSize = 10,
		// @Query('sortBy') sortBy = 'createdAt',
		@Query('sortDirection') sortDirection = 'desc',
		@Query() queryParams: AllCommentsForBlogQueryParams,
		@Req() req: Request,
	) {
		const currentUser = await this.commandBus.execute(new FindUserByIdCommand(req.user.id));
		if (!currentUser) {
			throw new NotFoundException();
		}
		const blogs = await this.commandBus.execute(
			new GetAllBlogsForCurrentUserCommand(currentUser.id),
		);
		const posts = await Promise.all(
			blogs.map((blog) => this.commandBus.execute(new GetAllPostsForCurrentUserCommand(blog.id))),
		);
		const comments = await Promise.all(
			posts
				.flat()
				.map((post) => this.commandBus.execute(new GetAllCommentsForCurrentUserCommand(post.id))),
		);

		const allComments = comments.flat();
		const sortedComments = allComments.sort((a, b) => {
			if (sortDirection === 'asc') {
				return a[queryParams.sortBy] > b[queryParams.sortBy] ? 1 : -1;
			} else {
				return a[queryParams.sortBy] < b[queryParams.sortBy] ? 1 : -1;
			}
		});
		const startIndex = (queryParams.pageNumber - 1) * queryParams.pageSize;
		const endIndex = startIndex + queryParams.pageSize;
		const pageComments = sortedComments.slice(startIndex, endIndex);

		const totalCount = allComments.length;
		const pagesCount = Math.ceil(totalCount / queryParams.pageSize);
		const page = queryParams.pageNumber;

		const items = pageComments.map((comment) => {
			const post = posts.flat().find((p) => p.id === comment.postId);

			return {
				id: comment.id,
				content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        commentatorInfo: {
          userId: comment.userId,
          userLogin: comment.userLogin,
        },
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
				postInfo: {
          blogId: post.blogId,
          blogName: post.blogName,
          title: post.title,
					id: post.id,
				},
			};
		});

		return {
			pagesCount: pagesCount,
			page: page,
			pageSize: queryParams.pageSize,
			totalCount: totalCount,
			items: items,
		};
	}
}
