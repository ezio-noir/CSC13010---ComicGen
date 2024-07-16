import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { FollowingList } from 'src/schemas/following-list.schema';
import { User } from 'src/schemas/user.schema';
import { FollowingListNotExistError } from './error/following-list-not-exist.error';
import { AlreadyFollowedError } from './error/already-followed.error';
import { Followed } from 'src/schemas/followed.schema';
import { UserNotFoundError } from 'src/shared/error/user-not-found.error';
import { FollowedNotExistError } from './error/followed-not-exist.error';
import { NotFollowedError } from './error/not-followed.error';

@Injectable()
export class FollowsService {
  private readonly logger = new Logger(FollowsService.name);

  constructor(
    @InjectModel(User.name) private userModel: mongoose.Model<User>,
    @InjectModel(FollowingList.name)
    private followingListModel: mongoose.Model<FollowingList>,
    @InjectModel(Followed.name) private followedModel: mongoose.Model<Followed>,
  ) {}

  async setFollow(sourceUserId: Types.ObjectId, targetUserId: Types.ObjectId) {
    const session = await this.followingListModel.db.startSession();
    session.startTransaction();
    try {
      const targetUser = await this.userModel
        .findById(targetUserId)
        .session(session);
      if (!targetUser) throw new UserNotFoundError();

      const followingList = await this.followingListModel
        .findOne({
          user: sourceUserId,
        })
        .session(session);
      if (!followingList) throw new FollowingListNotExistError();
      if (followingList.followingUsers.includes(targetUserId))
        throw new AlreadyFollowedError();

      const followed = await this.followedModel
        .findOne({
          user: targetUserId,
        })
        .session(session);
      if (!followed) throw new FollowedNotExistError();

      await this.followingListModel.findOneAndUpdate(
        { user: sourceUserId },
        { $addToSet: { followingUsers: targetUserId } },
        { session },
      );

      await this.followedModel.findOneAndUpdate(
        { user: targetUserId },
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
      const targetUser = await this.userModel
        .findById(targetUserId)
        .session(session);
      if (!targetUser) throw new UserNotFoundError();

      const followingList = await this.followingListModel
        .findOne({
          user: sourceUserId,
        })
        .session(session);
      if (!followingList) throw new FollowingListNotExistError();
      if (!followingList.followingUsers.includes(targetUserId))
        throw new NotFollowedError();

      const followed = await this.followedModel
        .findOne({
          user: targetUserId,
        })
        .session(session);
      if (!followed) throw new FollowedNotExistError();

      await this.followingListModel.findOneAndUpdate(
        { user: sourceUserId },
        { $pull: { followingUsers: targetUserId } },
        { session },
      );

      await this.followedModel.findOneAndUpdate(
        { user: targetUserId },
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
