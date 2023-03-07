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
		returnBanned: boolean,
	) {
		const filter = this.getFilterForQuery(searchNameTerm, returnBanned);
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
				banInfo: {
					isBanned: blog.banInfo.isBanned,
					banDate: blog.banInfo.banDate,
				},
			};
		});
	}

	async getAllBlogsForOwner(
		searchNameTerm: string,
		pageNumber: number,
		pageSize: number,
		sortBy: string,
		sortDirection: string,
	) {
		const filter = this.getFilterForQueryForOwner(searchNameTerm);
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
				banInfo: {
					isBanned: blog.banInfo.isBanned,
					banDate: blog.banInfo.banDate,
				},
			};
		});
	}

	async getAllBlogsForCurrentUser(userId: string) {
		const filter = this.getFilterForQueryAndCurrentUser(userId);
		const blogs = await this.blogsModel.find(filter).lean();
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

	async countBlogs(searchNameTerm: string | null, returnBanned: boolean) {
		const filter = this.getFilterForQuery(searchNameTerm, returnBanned);
		return this.blogsModel.count(filter);
	}

	async countBlogsForOwner(userId: string) {
		const filter = this.getFilterForQueryAndCurrentUser(userId);
		return this.blogsModel.countDocuments(filter);
	}

	async countBlogsForCurrentUser(userId: string) {
		const filter = this.getFilterForQueryAndCurrentUser(userId);
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

	private getFilterForQuery(searchNameTerm: string | null, returnBanned: boolean) {
		if (!returnBanned) {
			if (!searchNameTerm) {
				return { 'banInfo.isBanned': returnBanned };
			} else {
				return {
					name: { $regex: searchNameTerm, $options: 'i' },
					'banInfo.isBanned': returnBanned,
				};
			}
		} else {
			return { name: { $regex: searchNameTerm ? searchNameTerm : '', $options: 'i' } };
		}
	}

	private getFilterForQueryForOwner(searchNameTerm: string | null) {
		return { name: { $regex: searchNameTerm ? searchNameTerm : '', $options: 'i' } };
	}

	private getFilterForQueryAndCurrentUser(userId: string) {
		return { 'bloggerOwnerInfo.userId': userId };
	}

	async deleteAll() {
		return this.blogsModel.deleteMany().exec();
	}
}
