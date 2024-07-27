import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Chapter } from 'src/shared/schemas/chapter.schema';
import { ComicChapters } from 'src/shared/schemas/comic-chapters.schema';
import { RegisterChapterDto } from './dtos/request/register-chapter.dto';
import { Comic } from 'src/shared/schemas/comic.schema';
import { ResourceNotFoundError } from 'src/common/errors/resource-not-found.error';

@Injectable()
export class ChaptersService {
  private readonly logger = new Logger(ChaptersService.name);

  constructor(
    @InjectModel('Chapter') private chapterModel: mongoose.Model<Chapter>,
    @InjectModel('Comic') private comicModel: mongoose.Model<Comic>,
    @InjectModel('ComicChapters')
    private comicChaptersModel: mongoose.Model<ComicChapters>,
  ) {}

  async createChapter(dto: RegisterChapterDto) {
    const session = await this.chapterModel.db.startSession();
    try {
      const newChapter = await session.withTransaction(async () => {
        const comic = await this.comicModel
          .findOne({ _id: dto.comic })
          .session(session);
        if (!comic) throw new ResourceNotFoundError('Comic does not exist.');

        const newChapter = new this.chapterModel({
          ...dto,
          pages:
            dto.pages?.map((value, index) => {
              return { pageNumber: index, url: value };
            }) || [],
        });
        await newChapter.save({ session });

        const comicChapters = await this.comicChaptersModel
          .findOne({ _id: comic.chapterList })
          .session(session);
        const chapterNumbers = comicChapters.chapters.map(
          (chapter) => chapter.chapterNumber,
        );

        if (chapterNumbers.includes(newChapter.chapterNumber as number))
          throw new Error('Chapter already registered.');

        comicChapters.chapters.push({
          chapterNumber: newChapter.chapterNumber,
          chapter: newChapter._id,
        });
        await comicChapters.save({ session });

        return newChapter;
      });

      this.logger.log(`Chapter registered: ${newChapter.id}`);
      return newChapter;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
