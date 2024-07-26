import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Chapter } from 'src/shared/schemas/chapter.schema';
import { ComicChapters } from 'src/shared/schemas/comic-chapters.schema';

@Injectable()
export class ChaptersService {
  private readonly logger = new Logger(ChaptersService.name);

  constructor(
    @InjectModel('Chapter') private chapterModel: mongoose.Model<Chapter>,
    @InjectModel('ComicChapters')
    private comicChaptersModel: mongoose.Model<ComicChapters>,
  ) {}

  // async createChapter()
}
