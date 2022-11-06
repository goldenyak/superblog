import { Injectable } from '@nestjs/common';
import { BlogsRepository } from './blogs.repository';
import { CreateBlogsDto } from './dto/create-blogs.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BlogsService {
	constructor(private readonly blogsRepository: BlogsRepository) {}

	async create(dto: CreateBlogsDto) {
		const newBlog = {
			id: uuidv4(),
			name: dto.name,
			youtubeUrl: dto.youtubeUrl,
			createdAt: new Date(),
		};
		return await this.blogsRepository.create(newBlog);
	}

	async getAllBlogs(
		searchNameTerm: string,
		pageNumber: number,
		pageSize: number,
		sortBy: string,
		sortDirection: string,
	) {
		const countBlogs = await this.blogsRepository.countBlogs(searchNameTerm);
		const allBlogs = await this.blogsRepository.getAllBlogs(
			searchNameTerm,
			(pageNumber = 1),
			(pageSize = 10),
			sortBy,
			sortDirection,
		);
		return {
			pagesCount: pageNumber,
			page: pageNumber,
			pageSize: pageSize,
			totalCount: countBlogs,
			items: allBlogs,
		};
	}

	async findBlogById(id: string) {
		return await this.blogsRepository.findBlogById(id);
	}

	async deleteBlogById(id: string) {
		return await this.blogsRepository.deleteBlogById(id);
	}

	async updateBlogById(id: string, name: string, youtubeUrl: string) {
		return await this.blogsRepository.updateBlogById(id, name, youtubeUrl)
	}
}
