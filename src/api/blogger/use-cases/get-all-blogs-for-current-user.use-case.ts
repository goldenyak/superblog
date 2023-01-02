import { Injectable } from '@nestjs/common';
import { BlogsRepository } from "../../public/blogs/blogs.repository";
import { BlogsQueryParams } from "../../public/blogs/dto/blogs-query.dto";


@Injectable()
export class GetAllBlogsForCurrentUserUseCase {
	constructor(private readonly blogsRepository: BlogsRepository) {}

	async execute({ searchNameTerm, pageNumber, pageSize, sortBy, sortDirection }: BlogsQueryParams, userId: string) {
		const countBlogs = await this.blogsRepository.countBlogsForCurrentUser(searchNameTerm, userId);
		const allBlogs = await this.blogsRepository.getAllBlogsForCurrentUser(
			searchNameTerm,
			pageNumber,
			pageSize,
			sortBy,
			sortDirection,
			userId
		);
		return {
			pagesCount: Math.ceil(countBlogs / pageSize),
			page: pageNumber,
			pageSize: pageSize,
			totalCount: countBlogs,
			items: allBlogs,
		};
	}
}
