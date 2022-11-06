import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blogs, BlogsDocument } from './schemas/blogs.schema';
import { AuthDocument } from '../auth/schemas/auth.schema';
import { CreateBlogsDto } from './dto/create-blogs.dto';

@Injectable()
export class BlogsRepository {
	constructor(@InjectModel(Blogs.name) private readonly blogsModel: Model<BlogsDocument>) {}

	async create(newBlog: CreateBlogsDto) {
		return this.blogsModel.create(newBlog);
	}

	async getAllBlogs(
		searchNameTerm: string,
		pageNumber = 1,
		pageSize = 10,
		sortBy: string,
		sortDirection: string,
	) {
		const filter = this.getFilterForQuery(searchNameTerm);
		const sortByFilter = this.getFilterForSortBy(sortBy);
		const sortDirectionFilter = this.getFilterForSortDirection(sortDirection);

		const blogs = await this.blogsModel
			.find(filter)
			.skip((pageNumber - 1) * pageSize)
			.limit(pageSize)
			.sort({ [sortByFilter]: sortDirectionFilter });

		return blogs.map((blogs) => {
			return {
				id: blogs.id,
				name: blogs.name,
				youtubeUrl: blogs.youtubeUrl,
				createdAt: blogs.createdAt,
			};
		});
	}

	async findBlogById(id: string) {
		return this.blogsModel.findOne({ id: id }, { _id: 0 });
	}

	async updateBlogById(id: string, name: string, youtubeUrl: string) {
		return this.blogsModel.findOneAndUpdate({ id: id }, { name: name,  youtubeUrl: youtubeUrl});
	}

	async deleteBlogById(id: string) {
		return this.blogsModel.findOneAndDelete({ id: id });
	}

	async countBlogs(searchNameTerm: string | null) {
		const filter = this.getFilterForQuery(searchNameTerm);
		return this.blogsModel.count(filter);
	}

	private getFilterForSortBy(sortBy: string | null) {
		if (sortBy) {
			return sortBy;
		} else return 'createdAt';
	}

	private getFilterForSortDirection(sortDirection: string | null) {
		if (!sortDirection || sortDirection === 'asc') {
			return 1;
		}
		if (sortDirection === 'desc') {
			return -1;
		}
	}

	private getFilterForQuery(searchNameTerm: string | null) {
		if (!searchNameTerm) {
			return {};
		} else {
			return { name: { $regex: searchNameTerm, $options: 'i' } };
		}
	}
}
