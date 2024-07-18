import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { ObjectId, SaveOptions, Types } from 'mongoose';
import { FollowingList } from 'src/schemas/following-list.schema';
import { User } from 'src/schemas/user.schema';
import { FollowingListNotExistError } from './error/following-list-not-exist.error';
import { AlreadyFollowedError } from './error/already-followed.error';
import { Followed } from 'src/schemas/followed.schema';
import { UserNotFoundError } from 'src/shared/error/user-not-found.error';
import { FollowedNotExistError } from './error/followed-not-exist.error';
import { NotFollowedError } from './error/not-followed.error';
import { ConfigService } from '@nestjs/config';
import { PaginationQueryDto } from 'src/shared/dto/pagination-query.dto';
import { CreateFollowingListError } from './error/create-following-list.error';
import { CreateFollowedError } from './error/create-followed-error';

@Injectable()
export class FollowsService {
  private readonly logger = new Logger(FollowsService.name);
  private readonly PAGE_LIMIT: number;

  constructor(
    @InjectModel(User.name) private userModel: mongoose.Model<User>,
    @InjectModel(FollowingList.name)
    private followingListModel: mongoose.Model<FollowingList>,
    @InjectModel(Followed.name) private followedModel: mongoose.Model<Followed>,
    private configService: ConfigService,
  ) {
    this.PAGE_LIMIT = this.configService.get(
      'resource.following-list.page-limit',
    );
  }

  async createFollowingList(options?: mongoose.SaveOptions) {
    try {
      const followingList = new this.followingListModel({
        followingUsers: [],
      });
      return await followingList.save(options);
    } catch (err) {
      this.logger.error(err.message);
      throw new CreateFollowingListError();
    }
  }

  async createFollowed(options?: mongoose.SaveOptions) {
    try {
      const followed = new this.followedModel({
        followerCount: 0,
      });
      return await followed.save(options);
    } catch (err) {
      this.logger.error(err.message);
      throw new CreateFollowedError();
    }
  }

  async getFollowings(
    userId: Types.ObjectId,
    paginationQuery: PaginationQueryDto,
  ) {
    try {
      const page = paginationQuery.page ? paginationQuery.page : 1;
      const limit = paginationQuery.limit
        ? Math.min(paginationQuery.limit, this.PAGE_LIMIT)
        : this.PAGE_LIMIT;
      const offset = (page - 1) * limit;
      console.log(userId);
      console.log(offset, limit);
      const followingList = await this.followingListModel
        .find({
          user: userId,
        })
        .skip(offset)
        .limit(limit);
      console.log(followingList);
    } catch (err) {}
  }

  async setFollow(sourceUserId: Types.ObjectId, targetUserId: Types.ObjectId) {
    const session = await this.followingListModel.db.startSession();
    session.startTransaction();
    try {
      const sourceUser = await this.userModel
        .findById(sourceUserId)
        .session(session);
      if (!sourceUser) throw new UserNotFoundError();

      const targetUser = await this.userModel
        .findById(targetUserId)
        .session(session);
      if (!targetUser) throw new UserNotFoundError();

      const followingList = await this.followingListModel
        .findById(sourceUser.followingList)
        .session(session);
      if (!followingList) throw new FollowingListNotExistError();
      if (followingList.followingUsers.includes(targetUserId))
        throw new AlreadyFollowedError();

      const followed = await this.followedModel
        .findById(targetUser.followed)
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

      await session.commitTransaction();

      this.logger.log(
        `Follow set: ${sourceUserId.toString()} -> ${targetUserId.toString()}`,
      );
    } catch (err) {
      await session.abortTransaction();
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
    session.startTransaction();
    try {
      const sourceUser = await this.userModel
        .findById(sourceUserId)
        .session(session);
      if (!sourceUser) throw new UserNotFoundError();

      const targetUser = await this.userModel
        .findById(targetUserId)
        .session(session);
      if (!targetUser) throw new UserNotFoundError();

      const followingList = await this.followingListModel
        .findById(sourceUser.followingList)
        .session(session);
      if (!followingList) throw new FollowingListNotExistError();
      if (!followingList.followingUsers.includes(targetUserId))
        throw new NotFollowedError();

      const followed = await this.followedModel
        .findById(targetUser.followed)
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

      await session.commitTransaction();

      this.logger.log(
        `Follow unset: ${sourceUserId.toString()} x->x ${targetUserId.toString()}`,
      );
    } catch (err) {
      await session.abortTransaction();
      this.logger.error(err.message);
      throw err;
    } finally {
      session.endSession();
    }
  }
}
