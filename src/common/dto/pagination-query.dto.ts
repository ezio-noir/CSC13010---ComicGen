import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class QueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  populate?: boolean;
}
