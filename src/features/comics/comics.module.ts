import { Module } from '@nestjs/common';
import { ComicsService } from './comics.service';
import { ComicsController } from './comics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Comic, ComicSchema } from 'src/shared/schemas/comic.schema';
import { CategoriesModule } from 'src/features/categories/categories.module';
import { AuthModule } from 'src/features/auth/auth.module';
import { UsersModule } from '../users/users.module';
import {
  ComicCreationList,
  ComicCreationListSchema,
} from 'src/shared/schemas/comic-creation-list.schema';
import { User, UserSchema } from 'src/shared/schemas/user.schema';
import { Category, CategorySchema } from 'src/shared/schemas/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Comic.name, schema: ComicSchema },
      { name: ComicCreationList.name, schema: ComicCreationListSchema },
    ]),
    CategoriesModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [ComicsController],
  providers: [ComicsService],
})
export class ComicsModule {}
