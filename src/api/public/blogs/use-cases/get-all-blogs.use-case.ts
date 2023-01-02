import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../blogs.repository';
import { BlogsQueryParams } from '../dto/blogs-query.dto';

@Injectable()
export class GetAllBlogsUseCase {
	constructor(private readonly blogsRepository: BlogsRepository) {}

	async execute({ searchNameTerm, pageNumber, pageSize, sortBy, sortDirection }: BlogsQueryParams) {
		const countBlogs = await this.blogsRepository.countBlogs(searchNameTerm);
		const allBlogs = await this.blogsRepository.getAllBlogs(
			searchNameTerm,
			pageNumber,
			pageSize,
			sortBy,
			sortDirection,
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
