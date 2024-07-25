import { IsArray, IsOptional, IsString } from 'class-validator';
import { ComicStatus } from 'src/shared/schemas/comic.schema';

export class EditComicDetailsDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  categories?: string[];

  @IsOptional()
  status: ComicStatus;
}
