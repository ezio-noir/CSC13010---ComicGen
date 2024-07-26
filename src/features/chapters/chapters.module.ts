import { Module } from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { ChaptersController } from './chapters.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ChapterSchema } from 'src/shared/schemas/chapter.schema';
import { ComicChaptersSchema } from 'src/shared/schemas/comic-chapters.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Chapter', schema: ChapterSchema },
      { name: 'ComicChapters', schema: ComicChaptersSchema },
    ]),
  ],
  controllers: [ChaptersController],
  providers: [ChaptersService],
})
export class ChaptersModule {}
