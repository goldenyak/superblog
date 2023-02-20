import { BlogsModule } from '../api/public/blogs/blogs.module';
import { BlogIdValidation } from './blog-id.validation';
import { Module } from '@nestjs/common';

@Module({
	imports: [BlogsModule],
	controllers: [],
	providers: [BlogIdValidation],
	exports: [BlogIdValidation],
})
export class ValidationModule {}
