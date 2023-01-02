import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import {
	transformSortByFilter,
	transformSortDirectionFilter,
} from '../../../../helpers/transform-query-params.helper';

export class UsersQueryDto {
	@IsOptional()
	public searchLoginTerm = '';

	@IsOptional()
	public searchEmailTerm = '';

	@Transform(({ value }) => parseInt(value))
	@IsOptional()
	public pageNumber = 1;

	@Transform(({ value }) => parseInt(value))
	@IsOptional()
	public pageSize = 10;

	@Transform(({ value }) => transformSortByFilter(value))
	@IsOptional()
	@IsString()
	public sortBy = 'createdAt';

	@Transform(({ value }) => transformSortDirectionFilter(value))
	@IsOptional()
	@IsString()
	public sortDirection = 'desc';
}
