import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { ObjectId, SaveOptions, Types } from 'mongoose';
import { FollowingList } from 'src/shared/schemas/following-list.schema';
import { User } from 'src/shared/schemas/user.schema';
import { FollowingListNotExistError } from './error/following-list-not-exist.error';
import { AlreadyFollowedError } from './error/already-followed.error';
import { Followed } from 'src/shared/schemas/followed.schema';
import { UserNotFoundError } from 'src/common/errors/user-not-found.error';
import { FollowedNotExistError } from './error/followed-not-exist.error';
import { NotFollowedError } from './error/not-followed.error';
import { ConfigService } from '@nestjs/config';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { CreateFollowingListError } from './error/create-following-list.error';
import { CreateFollowedError } from './error/create-followed-error';

@Injectable()
export class FollowsService {
  private readonly logger = new Logger(FollowsService.name);
  private readonly PAGE_LIMIT: number;

  constructor(
    @InjectModel('User') private userModel: mongoose.Model<User>,
    @InjectModel(FollowingList.name)
    private followingListModel: mongoose.Model<FollowingList>,
    @InjectModel(Followed.name) private followedModel: mongoose.Model<Followed>,
    private configService: ConfigService,
  ) {
    this.PAGE_LIMIT = this.configService.get(
      'resource.following-list.page-limit',
    );
  }

  // async createFollowingList(options?: mongoose.SaveOptions) {
  //   try {
  //     const followingList = new this.followingListModel({
  //       followingUsers: [],
  //     });
  //     return await followingList.save(options);
  //   } catch (err) {
  //     this.logger.error(err.message);
  //     throw new CreateFollowingListError();
  //   }
  // }

  // async createFollowed(options?: mongoose.SaveOptions) {
  //   try {
  //     const followed = new this.followedModel({
  //       followerCount: 0,
  //     });
  //     return await followed.save(options);
  //   } catch (err) {
  //     this.logger.error(err.message);
  //     throw new CreateFollowedError();
  //   }
  // }

  async getFollowings(
    userId: Types.ObjectId,
    paginationQuery: PaginationQueryDto,
  ) {
    try {
      const user = await this.userModel.findOne({ _id: userId });
      if (!user) throw new UserNotFoundError();

      const page = paginationQuery.page ? paginationQuery.page : 1;
      const limit = paginationQuery.limit
        ? Math.min(paginationQuery.limit, this.PAGE_LIMIT)
        : this.PAGE_LIMIT;
      const offset = (page - 1) * limit;

      const followingList = await this.followingListModel
        .findOne({
          _id: user.followingList,
        })
        .skip(offset)
        .limit(limit);
      return followingList;
    } catch (err) {
      this.logger.error(err.message);
      throw new Error();
    }
  }

  async setFollow(sourceUserId: Types.ObjectId, targetUserId: Types.ObjectId) {
    const session = await this.followingListModel.db.startSession();
    try {
      await session.withTransaction(async () => {
        const sourceUser = await this.userModel
          .findOne({ _id: sourceUserId })
          .session(session);
        if (!sourceUser) throw new UserNotFoundError();

        const targetUser = await this.userModel
          .findOne({ _id: targetUserId })
          .session(session);
        if (!targetUser) throw new UserNotFoundError();

        const followingList = await this.followingListModel
          .findOne({ _id: sourceUser.followingList })
          .session(session);
        if (!followingList) throw new FollowingListNotExistError();
        if (followingList.followingUsers.includes(targetUserId))
          throw new AlreadyFollowedError();

        const followed = await this.followedModel
          .findOne({ _id: targetUser.followed })
          .session(session);
        if (!followed) throw new FollowedNotExistError();

        await this.followingListModel.findByIdAndUpdate(
          followingList._id,
          { $addToSet: { followingUsers: targetUserId } },
          { session },
        );

        await this.followedModel.findByIdAndUpdate(
          followed._id,
          { $inc: { followerCount: 1 } },
          { session },
        );
      });

      this.logger.log(
        `Follow set: ${sourceUserId.toString()} -> ${targetUserId.toString()}`,
      );
    } catch (err) {
      this.logger.error(err.message);
      throw err;
    } finally {
      await session.endSession();
    }
  }

  async unsetFollow(
    sourceUserId: Types.ObjectId,
    targetUserId: Types.ObjectId,
  ) {
    const session = await this.userModel.db.startSession();
    try {
      await session.withTransaction(async () => {
        const sourceUser = await this.userModel
          .findOne({ _id: sourceUserId })
          .session(session);
        if (!sourceUser) throw new UserNotFoundError();

        const targetUser = await this.userModel
          .findOne({ _id: targetUserId })
          .session(session);
        if (!targetUser) throw new UserNotFoundError();

        const followingList = await this.followingListModel
          .findOne({ _id: sourceUser.followingList })
          .session(session);
        if (!followingList) throw new FollowingListNotExistError();
        if (!followingList.followingUsers.includes(targetUserId))
          throw new NotFollowedError();

        const followed = await this.followedModel
          .findOne({ _id: targetUser.followed })
          .session(session);
        if (!followed) throw new FollowedNotExistError();

        await this.followingListModel.findByIdAndUpdate(
          followingList._id,
          { $pull: { followingUsers: targetUserId } },
          { session },
        );

        await this.followedModel.findByIdAndUpdate(
          followed._id,
          { $inc: { followerCount: -1 } },
          { session },
        );
      });
      this.logger.log(
        `Follow unset: ${sourceUserId.toString()} x->x ${targetUserId.toString()}`,
      );
    } catch (err) {
      console.log(err);
      this.logger.error(err.message);
      throw err;
    } finally {
      await session.endSession();
    }
  }
}
