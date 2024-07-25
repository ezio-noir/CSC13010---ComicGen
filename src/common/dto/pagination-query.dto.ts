import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsInt()
  page?: number;

  @IsOptional()
  @Min(1)
  @IsInt()
  limit?: number;
}
