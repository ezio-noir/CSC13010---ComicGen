import { Module } from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { ChaptersController } from './chapters.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ChapterSchema } from 'src/shared/schemas/chapter.schema';
import { ComicChaptersSchema } from 'src/shared/schemas/comic-chapters.schema';
import { ComicSchema } from 'src/shared/schemas/comic.schema';
import { UsersModule } from '../users/users.module';
import { ImageSchema } from 'src/shared/schemas/image.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Chapter', schema: ChapterSchema },
      { name: 'Comic', schema: ComicSchema },
      { name: 'ComicChapters', schema: ComicChaptersSchema },
      { name: 'Image', schema: ImageSchema },
    ]),
    UsersModule,
  ],
  controllers: [ChaptersController],
  providers: [ChaptersService],
})
export class ChaptersModule {}
