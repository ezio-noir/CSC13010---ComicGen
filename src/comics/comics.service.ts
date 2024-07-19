import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { SaveOptions, Types } from 'mongoose';
import { Comic } from 'src/schemas/comic.schema';
import { CreateComicDto } from './dto/request/create-comic.dto';
import { CategoriesService } from 'src/categories/categories.service';
import { UsersService } from 'src/users/users.service';
import { UserNotFoundError } from 'src/shared/error/user-not-found.error';
import { CreateComicError } from './error/create-comic.error';

@Injectable()
export class ComicsService {
  private readonly logger = new Logger(ComicsService.name);

  constructor(
    private categoriesService: CategoriesService,
    private usersService: UsersService,
    @InjectModel(Comic.name) private comicModel: mongoose.Model<Comic>,
  ) {}

  async createComic(createComicDto: CreateComicDto, options?: SaveOptions) {
    const providedSession = options?.session;
    const session = providedSession || (await this.comicModel.startSession());
    session.startTransaction();
    try {
      const author = Types.ObjectId.createFromHexString(createComicDto.author);
      if (!(await this.usersService.doesUserExist(author)))
        throw new UserNotFoundError();
      const categories = createComicDto.categories
        ? createComicDto.categories.map((category) =>
            Types.ObjectId.createFromHexString(category),
          )
        : [];
      const newComic = new this.comicModel({
        title: createComicDto.title,
        author: Types.ObjectId.createFromHexString(createComicDto.author),
        categories: categories,
      });
      await newComic.save({ session });

      for (const category of categories) {
        await this.categoriesService.increaseComicCount(category, { session });
      }

      await session.commitTransaction();

      this.logger.log(`Comic created: ${newComic.id}`);

      return newComic.toJSON();
    } catch (err) {
      this.logger.error(err.message);

      await session.abortTransaction();
      throw new CreateComicError();
    } finally {
      if (!providedSession) await session.endSession();
    }
  }
}
