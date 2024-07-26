import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { ResourceNotFoundError } from 'src/common/errors/resource-not-found.error';
import { ComicStatistics } from 'src/shared/schemas/comic-statistics.schema';
import { Comic } from 'src/shared/schemas/comic.schema';
import { SubscribeList } from 'src/shared/schemas/subscribe-list.schema';
import { User } from 'src/shared/schemas/user.schema';

@Injectable()
export class SubscribesService {
  private readonly logger = new Logger(SubscribesService.name);

  constructor(
    @InjectModel('User') private userModel: mongoose.Model<User>,
    @InjectModel('SubscribeList')
    private subscribeListModel: mongoose.Model<SubscribeList>,
    @InjectModel('Comic') private comicModel: mongoose.Model<Comic>,
    @InjectModel('ComicStatistics')
    private comicStatisticsModel: mongoose.Model<ComicStatistics>,
  ) {}

  async subscribeComic(userId: Types.ObjectId, comicId: Types.ObjectId) {
    const session = await this.subscribeListModel.db.startSession();
    try {
      await session.withTransaction(async () => {
        const user = await this.userModel
          .findOne({ _id: userId })
          .session(session);
        if (!user) throw new ResourceNotFoundError('User not found.');

        const comic = await this.comicModel
          .findOne({ _id: comicId })
          .session(session);
        if (!comic) throw new ResourceNotFoundError('Comic not found.');

        const subscribeList = await this.subscribeListModel
          .findOne({
            _id: user.subscribeList,
          })
          .session(session);

        const isComicSubscribed = subscribeList.subscribeComics?.some((item) =>
          item._id.equals(comic._id),
        );

        if (!isComicSubscribed) {
          await this.subscribeListModel.findOneAndUpdate(
            { _id: user.subscribeList },
            { $addToSet: { subscribeComics: comic._id } },
            { session },
          );
          console.log(comic);
          console.log(comic.statistics);
          await this.comicStatisticsModel.findOneAndUpdate(
            { _id: comic.statistics },
            { $inc: { subscribeCount: 1 } },
            { session },
          );
        }
      });
      this.logger.log(
        `Subscribe set: ${userId.toHexString()} -> ${comicId.toHexString()}.`,
      );
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async unsubscribeComic(userId: Types.ObjectId, comicId: Types.ObjectId) {
    const session = await this.subscribeListModel.db.startSession();
    try {
      await session.withTransaction(async () => {
        const user = await this.userModel
          .findOne({ _id: userId })
          .session(session);
        if (!user) throw new ResourceNotFoundError('User not found.');

        const comic = await this.comicModel
          .findOne({ _id: comicId })
          .session(session);
        if (!comic) throw new ResourceNotFoundError('Comic not found.');

        const subscribeList = await this.subscribeListModel
          .findOne({
            _id: user.subscribeList,
          })
          .session(session);

        const isComicSubscribed = subscribeList.subscribeComics?.some((item) =>
          item._id.equals(comic._id),
        );

        console.log(isComicSubscribed);

        if (isComicSubscribed) {
          await this.subscribeListModel.findOneAndUpdate(
            { _id: user.subscribeList },
            { $pull: { subscribeComics: comic._id } },
            { session },
          );
          await this.comicStatisticsModel.findOneAndUpdate(
            { _id: comic.statistics },
            { $inc: { subscribeCount: -1 } },
            { session },
          );
        }
      });
      this.logger.log(
        `Subscribe unset: ${userId.toHexString()} -x- ${comicId.toHexString()}.`,
      );
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
