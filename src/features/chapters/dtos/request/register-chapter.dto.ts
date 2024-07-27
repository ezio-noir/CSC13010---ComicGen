import { Transform } from 'class-transformer';
import { IsArray, IsOptional } from 'class-validator';
import mongoose from 'mongoose';

export class RegisterChapterDto {
  @Transform(({ value }) => mongoose.Types.ObjectId.createFromHexString(value))
  comic: mongoose.Types.ObjectId;
  @Transform(({ value }) => parseInt(value))
  chapterNumber: number;
  @IsOptional()
  title?: string;
  @IsArray()
  pages: string[];
}
