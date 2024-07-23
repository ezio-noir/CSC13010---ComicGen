import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { SaveOptions, Types } from 'mongoose';
import { Comic } from 'src/schemas/comic.schema';
import { CreateComicDto } from './dto/request/create-comic.dto';
import { CategoriesService } from 'src/categories/categories.service';
import { UsersService } from 'src/users/users.service';
import { UserNotFoundError } from 'src/shared/error/user-not-found.error';
import { CreateComicError } from './error/create-comic.error';
import { ComicCreationList } from 'src/schemas/comic-creation-list.schema';
import { User } from 'src/schemas/user.schema';
import { ComicCreationListNotFoundError } from './error/comic-creation-list-not-found.error';
import { Category } from 'src/schemas/category.schema';

@Injectable()
export class ComicsService {
  private readonly logger = new Logger(ComicsService.name);

  constructor(
    private categoriesService: CategoriesService,
    private usersService: UsersService,
    @InjectModel(User.name) private userModel: mongoose.Model<User>,
    @InjectModel(Category.name) private categoryModel: mongoose.Model<Category>,
    @InjectModel(Comic.name) private comicModel: mongoose.Model<Comic>,
    @InjectModel(ComicCreationList.name)
    private comicCreationListModel: mongoose.Model<ComicCreationList>,
  ) {}

  /**
   * Creates a comic document.
   * @param createComicDto
   * @returns
   */
  async createComic(createComicDto: CreateComicDto) {
    const session = await this.comicModel.db.startSession();
    try {
      const newComic = await session.withTransaction(async () => {
        // Check if user exists
        const authorId = Types.ObjectId.createFromHexString(
          createComicDto.author,
        );
        const author = await this.userModel.findById(authorId).session(session);
        if (!author) throw new UserNotFoundError('Author not found.');

        // Convert categories from string array into ObjectId array
        const categories = createComicDto.categories
          ? createComicDto.categories.map((category) =>
              Types.ObjectId.createFromHexString(category),
            )
          : [];

        // Create new comic document
        const newComic = new this.comicModel({
          title: createComicDto.title,
          author: authorId,
          categories: categories,
        });
        await newComic.save({ session });

        // Add the new comic to the comic creation list (create a new list if required)
        const comicCreationListId = author.comicCreationList;
        const comicCreationList = await (async () => {
          if (!comicCreationList) {
            const newComicCreationList = new this.comicCreationListModel({
              comicList: [newComic._id],
            });
            await newComicCreationList.save({ session });
            return newComicCreationList;
          } else {
            const comicCreationList = await this.comicCreationListModel
              .findById(comicCreationListId)
              .session(session);
            if (!comicCreationList)
              throw new ComicCreationListNotFoundError('Invalid ID.');
            await comicCreationList
              .updateOne({
                $addToSet: { comicList: newComic._id },
              })
              .session(session);
            return comicCreationList;
          }
        })();
        author.comicCreationList = comicCreationList._id;
        await author.save({ session });

        // Increase categories' comic count
        for (const category of categories) {
          await this.categoryModel
            .findByIdAndUpdate(category, {
              $inc: { comicCount: 1 },
            })
            .session(session);
        }

        return newComic;
      });
      if (!newComic) throw new CreateComicError();
      this.logger.log(`Comic created: ${newComic.id}`);
      return newComic.toJSON();
    } catch (err) {
      this.logger.error(err.message);
      throw err;
    } finally {
      await session.endSession();
    }
  }
}
