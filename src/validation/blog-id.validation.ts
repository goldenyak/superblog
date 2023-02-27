import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../api/public/blogs/blogs.repository';

@Injectable()
@ValidatorConstraint({ name: 'blogId', async: true })
export class BlogIdValidation implements ValidatorConstraintInterface {
	constructor(private readonly blogsRepository: BlogsRepository) {}

	async validate(
		value: string | undefined,
		validationArguments?: ValidationArguments,
	): Promise<any> {
		return  await this.blogsRepository.findBlogById(value);
	}
	defaultMessage(validationArguments?: ValidationArguments): string {
		return 'This blogId not found';
	}
}
