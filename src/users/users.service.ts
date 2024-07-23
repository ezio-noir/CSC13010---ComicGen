import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { SaveOptions, Types } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { PasswordCredential } from 'src/schemas/password-credential.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDetailsDto } from './dto/request/update-user-details.dto';
import { FollowingList } from 'src/schemas/following-list.schema';
import { Followed } from 'src/schemas/followed.schema';
import { UserAlreadyExistsError } from './error/user-already-exists.error';
import { UserPublicDetailsDto } from './dto/response/user-public-details.dto';
import { FollowsService } from 'src/follows/follows.service';
import { UserNotFoundError } from 'src/shared/error/user-not-found.error';
import { UpdateUserError } from './error/update-user.error';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly saltRounds = 10;

  constructor(
    @InjectModel(User.name) private userModel: mongoose.Model<User>,
    @InjectModel(PasswordCredential.name)
    private passwordCredentialModel: mongoose.Model<PasswordCredential>,
    @InjectModel(FollowingList.name)
    private followingListModel: mongoose.Model<FollowingList>,
    @InjectModel(Followed.name) private followedModel: mongoose.Model<Followed>,
    private followsService: FollowsService,
  ) {}

  async doesUserExist(userId: Types.ObjectId, options?: mongoose.SaveOptions) {
    return await this.userModel
      .exists({ _id: userId })
      .session(options?.session);
  }

  async getUserById(userId: mongoose.Types.ObjectId) {
    const user = await this.userModel
      .findById(new mongoose.Types.ObjectId(userId))
      .populate<{ followed: Followed }>('followed');

    if (!user) throw new UserNotFoundError();

    return new UserPublicDetailsDto({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      createdAt: user.createdAt,
      avatar: user.avatar,
      followerCount: user.followed.followerCount,
    });
  }

  getUserByUsername(username: string) {
    return this.userModel.findOne({ username });
  }

  async getUserRoles(userId: Types.ObjectId) {
    const user = await this.userModel.findById(userId);
    return user?.roles || [];
  }

  async createUser(
    createUserDto: CreateUserDto,
    options?: mongoose.SaveOptions,
  ) {
    const providedSession = options?.session;
    const session = providedSession || (await this.userModel.db.startSession());
    session.startTransaction();
    try {
      if (
        await this.userModel.exists({
          username: createUserDto.username,
        })
      ) {
        throw new UserAlreadyExistsError();
      }

      const user = new this.userModel({
        username: createUserDto.username,
        displayName: createUserDto.displayName,
        avatar: createUserDto.avatar,
      });
      // const savedNewUser = await user.save({ session });

      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        this.saltRounds,
      );
      const newPasswordCredential = new this.passwordCredentialModel({
        username: createUserDto.username,
        hashedPassword: hashedPassword,
      });
      await newPasswordCredential.save({ session });
      user.credential = newPasswordCredential._id;

      // const newFollowingList = new this.followingListModel({
      //   followingUsers: [],
      // });
      // await newFollowingList.save({ session });
      const newFollowingList = await this.followsService.createFollowingList({
        session,
      });
      user.followingList = newFollowingList._id;

      // const newFollowed = new this.followedModel({
      //   followerCount: 0,
      // });
      // await newFollowed.save({ session });
      const newFollowed = await this.followsService.createFollowed({
        session,
      });
      user.followed = newFollowed._id;

      await user.save({ session });
      await session.commitTransaction();

      this.logger.log(`User created: ${user._id}.`);
      return { id: user._id.toHexString() };
    } catch (err) {
      await session.abortTransaction();

      this.logger.error('Failed to create user.', err.trace);
      throw err;
    } finally {
      if (!providedSession) session.endSession();
    }
  }

  async updateUser(
    userId: Types.ObjectId,
    updateUserDto: UpdateUserDetailsDto,
    options?: SaveOptions,
  ) {
    const providedSession = options?.session;
    const session = providedSession
      ? providedSession
      : await this.userModel.db.startSession();

    try {
      const updatedUser = await session.withTransaction(async () => {
        const updatedUser = await this.userModel.findByIdAndUpdate(
          userId,
          {
            ...updateUserDto,
          },
          { session, new: true },
        );
        await session.commitTransaction();
        return updatedUser;
      });
      this.logger.log(`User details updated: ${updatedUser.id}.`);
      return updatedUser.toJSON();
    } catch (error) {
      this.logger.error(error.message);
      throw new UpdateUserError();
    }
  }
}
