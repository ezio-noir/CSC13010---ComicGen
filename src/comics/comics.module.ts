import { Module } from '@nestjs/common';
import { ComicsService } from './comics.service';
import { ComicsController } from './comics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Comic, ComicSchema } from 'src/schemas/comic.schema';
import { CategoriesModule } from 'src/categories/categories.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import {
  ComicCreationList,
  ComicCreationListSchema,
} from 'src/schemas/comic-creation-list.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Category, CategorySchema } from 'src/schemas/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
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
