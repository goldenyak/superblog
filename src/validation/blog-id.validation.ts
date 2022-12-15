import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { BlogsRepository } from '../blogs/blogs.repository';
import { BlogsModule } from '../blogs/blogs.module';
import { InjectModel } from '@nestjs/mongoose';
import { Blogs, BlogsDocument } from '../blogs/schemas/blogs.schema';
import { Model } from 'mongoose';

@Injectable()
@ValidatorConstraint({ name: 'blogId', async: true })
export class BlogIdValidation implements ValidatorConstraintInterface {
	constructor(private readonly blogsRepository: BlogsRepository) {}

	async validate(value: string | undefined, validationArguments?: ValidationArguments): Promise<any> {
		const blogId = await this.blogsRepository.findBlogById(value);
		if (!blogId) {
			return false;
		}
    console.log(value);
		return true;

	}

	defaultMessage(validationArguments?: ValidationArguments): string {
		return 'This blogId not found';
	}
}

// import {
//   ValidationArguments,
//   ValidatorConstraintInterface,
// } from 'class-validator';
// import { Injectable } from '@nestjs/common';
// import { BlogsRepository } from "../blogs/blogs.repository";
//
// @Injectable()
// export class BlogIdValidation {
//
//   constructor(private blogsRepository: BlogsRepository, private value: string) {
//   }
//
//     blogId = await this.blogsRepository.findBlogById(value);
//     if (!blogId) {
//       return false;
//     }
//     return true;
//   }

// export const BlogIdValidation = (blogId: string) => {
//   console.log('blogId', blogId);
// }
