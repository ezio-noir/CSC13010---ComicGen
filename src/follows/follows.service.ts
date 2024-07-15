import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { FollowingList } from 'src/schemas/following-list.schema';
import { User } from 'src/schemas/user.schema';
import { FollowingListNotFoundError } from './error/following-list-not-exist.error';
import { AlreadyFollowedError } from './error/already-followed.error';

@Injectable()
export class FollowsService {
  private readonly logger = new Logger(FollowsService.name);

  constructor(
    @InjectModel(User.name) private userModel: mongoose.Model<User>,
    @InjectModel(FollowingList.name)
    private followingListModel: mongoose.Model<FollowingList>,
  ) {}

  async setFollow(sourceUserId: Types.ObjectId, targetUserId: Types.ObjectId) {
    try {
      const followingList = await this.followingListModel.findOne({
        userId: sourceUserId,
      });
      if (!followingList) throw new FollowingListNotFoundError();
      if (followingList.followingUsers.includes(targetUserId))
        throw new AlreadyFollowedError();
      followingList.followingUsers.push(targetUserId);
      const updated = followingList.save();
      this.logger.log(
        `Successfully set follow: ${sourceUserId.toString()} -> ${targetUserId.toString()}`,
      );
      return updated;
    } catch (err) {
      this.logger.error(err.message, err.stack);
      if (
        err instanceof FollowingListNotFoundError ||
        err instanceof AlreadyFollowedError
      ) {
        throw err;
      } else {
        throw new Error(err.message);
      }
    }
  }
}
