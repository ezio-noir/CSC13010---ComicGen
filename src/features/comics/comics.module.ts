import { Module } from '@nestjs/common';
import { ComicsService } from './comics.service';
import { ComicsController } from './comics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ComicSchema } from 'src/shared/schemas/comic.schema';
import { CategoriesModule } from 'src/features/categories/categories.module';
import { AuthModule } from 'src/shared/auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ComicCreationListSchema } from 'src/shared/schemas/comic-creation-list.schema';
import { UserSchema } from 'src/shared/schemas/user.schema';
import { CategorySchema } from 'src/shared/schemas/category.schema';
import { StorageModule } from 'src/shared/storage/storage.module';
import { ComicStatisticsSchema } from 'src/shared/schemas/comic-statistics.schema';
import { ComicChaptersSchema } from 'src/shared/schemas/comic-chapters.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Category', schema: CategorySchema },
      { name: 'Comic', schema: ComicSchema },
      { name: 'ComicCreationList', schema: ComicCreationListSchema },
      { name: 'ComicStatistics', schema: ComicStatisticsSchema },
      { name: 'ComicChapters', schema: ComicChaptersSchema },
    ]),
    CategoriesModule,
    StorageModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [ComicsController],
  providers: [ComicsService],
})
export class ComicsModule {}
