import { Module } from '@nestjs/common';
import { ComicsService } from './comics.service';
import { ComicsController } from './comics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Comic, ComicSchema } from 'src/schemas/comic.schema';
import { CategoriesModule } from 'src/categories/categories.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comic.name, schema: ComicSchema }]),
    CategoriesModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [ComicsController],
  providers: [ComicsService],
})
export class ComicsModule {}
