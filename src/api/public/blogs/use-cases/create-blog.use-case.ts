import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../blogs.repository';
import { CreateBlogsDto } from '../dto/create-blogs.dto';
import { v4 as uuidv4 } from 'uuid';
import { Blogs } from '../schemas/blogs.schema';

@Injectable()
export class CreateBlogUseCase {
	constructor(private readonly blogsRepository: BlogsRepository) {}

	async execute(dto: CreateBlogsDto, id: string, login: string) {
		const newBlog: Blogs = {
			id: uuidv4(),
			name: dto.name,
			description: dto.description,
			websiteUrl: dto.websiteUrl,
			createdAt: new Date(),
			isMembership: false,
			bloggerOwnerInfo: {
				userId: id,
				userLogin: login
			},
			banInfo: {
				isBanned: false,
				banDate: null
			}
		};
		await this.blogsRepository.create(newBlog);
		return {
			id: newBlog.id,
			name: newBlog.name,
			description: newBlog.description,
			websiteUrl: newBlog.websiteUrl,
			createdAt: newBlog.createdAt,
			isMembership: newBlog.isMembership,
		};
	}
}
