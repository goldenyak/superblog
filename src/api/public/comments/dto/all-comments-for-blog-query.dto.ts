import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { transformSortByFilter, transformSortDirectionFilter } from "../../../../helpers/transform-query-params.helper";

export class AllCommentsForBlogQueryParams {
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  public pageNumber;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  public pageSize;

  @Transform(({ value }) => transformSortByFilter(value))
  @IsOptional()
  @IsString()
  public sortBy;

  @Transform(({ value }) => transformSortDirectionFilter(value))
  @IsOptional()
  @IsString()
  public sortDirection;
}
