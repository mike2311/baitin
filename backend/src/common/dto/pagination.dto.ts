import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Pagination DTO
 *
 * Standard pagination parameters for list/search endpoints.
 */
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number = 50;
}

export class PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}