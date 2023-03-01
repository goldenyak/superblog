import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blogs, BlogsDocument } from './schemas/blogs.schema';
import { CreateBlogsDto } from './dto/create-blogs.dto';
import { UpdateBanBlogDto } from '../../super-admin/api/users/dto/update-ban-blog.dto';

@Injectable()
export class BlogsRepository {
	constructor(@InjectModel(Blogs.name) private readonly blogsModel: Model<BlogsDocument>) {}

	async create(newBlog: CreateBlogsDto) {
		return this.blogsModel.create(newBlog);
	}

	async getAllBlogs(
		searchNameTerm: string,
		pageNumber: number,
		pageSize: number,
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
			.sort({ [sortByFilter]: sortDirectionFilter })
			.lean();

		return blogs.map((blog) => {
			return {
				id: blog.id,
				name: blog.name,
				description: blog.description,
				websiteUrl: blog.websiteUrl,
				createdAt: blog.createdAt,
				isMembership: blog.isMembership,
				blogOwnerInfo: {
					userId: blog.bloggerOwnerInfo.userId,
					userLogin: blog.bloggerOwnerInfo.userLogin,
				},
			};
		});
	}

	async getAllBlogsForCurrentUser(
		searchNameTerm: string,
		pageNumber: number,
		pageSize: number,
		sortBy: string,
		sortDirection: string,
		userId: string,
	) {
		const filter = this.getFilterForQueryAndCurrentUser(searchNameTerm, userId);
		const sortByFilter = this.getFilterForSortBy(sortBy);
		const sortDirectionFilter = this.getFilterForSortDirection(sortDirection);

		const blogs = await this.blogsModel
			.find(filter)
			.skip((pageNumber - 1) * pageSize)
			.limit(pageSize)
			.sort({ [sortByFilter]: sortDirectionFilter })
			.lean();

		return blogs.map((blogs) => {
			return {
				id: blogs.id,
				name: blogs.name,
				description: blogs.description,
				websiteUrl: blogs.websiteUrl,
				createdAt: blogs.createdAt,
				isMembership: blogs.isMembership,
			};
		});
	}

	async findBlogById(id: string) {
		return this.blogsModel.findOne({ id: id }, { _id: 0 });
	}

	async updateBlogById(id: string, name: string, description: string, websiteUrl: string) {
		return this.blogsModel.findOneAndUpdate(
			{ id: id },
			{ name: name, description: description, websiteUrl: websiteUrl },
		);
	}

	async banBlog(id: string, dto: UpdateBanBlogDto) {
		return this.blogsModel.findOneAndUpdate(
			{ id: id },
			{
				'banInfo.isBanned': dto.isBanned,
				'banInfo.banDate': new Date().toISOString(),
			},
		);
	}

	async unBanBlog(id: string, dto: UpdateBanBlogDto) {
		return this.blogsModel.findOneAndUpdate(
			{ id: id },
			{ 'banInfo.isBanned': dto.isBanned, 'banInfo.banDate': null },
		);
	}

	async deleteBlogById(id: string) {
		return this.blogsModel.findOneAndDelete({ id: id });
	}

	async countBlogs(searchNameTerm: string | null) {
		const filter = this.getFilterForQuery(searchNameTerm);
		return this.blogsModel.count(filter);
	}

	async countBlogsForCurrentUser(searchNameTerm: string | null, userId: string) {
		const filter = this.getFilterForQueryAndCurrentUser(searchNameTerm, userId);
		return this.blogsModel.countDocuments(filter);
	}

	private getFilterForSortBy(sortBy: string | null) {
		if (sortBy) {
			return sortBy;
		} else return 'createdAt';
	}

	private getFilterForSortDirection(sortDirection: string | null) {
		if (!sortDirection || sortDirection === 'desc') {
			return -1;
		}
		if (sortDirection === 'asc') {
			return 1;
		}
	}

	private getFilterForQuery(searchNameTerm: string | null) {
		if (!searchNameTerm) {
			return {};
		} else {
			return { name: { $regex: searchNameTerm, $options: 'i' }, 'banInfo.isBanned': false, };
		}
	}

	private getFilterForQueryAndCurrentUser(searchNameTerm: string | null, userId?: string) {
		if (!searchNameTerm) {
			return { 'bloggerOwnerInfo.userId': userId };
		} else {
			return { name: { $regex: searchNameTerm, $options: 'i' }, 'bloggerOwnerInfo.userId': userId };
		}
	}

	async deleteAll() {
		return this.blogsModel.deleteMany().exec();
	}
}
