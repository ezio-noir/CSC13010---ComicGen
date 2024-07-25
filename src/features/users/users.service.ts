import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { User } from 'src/shared/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { PasswordCredential } from 'src/shared/schemas/password-credential.schema';
import { CreateUserDto } from './dtos/request/create-user.dto';
import { UpdateUserDetailsDto } from './dtos/request/update-user-details.dto';
import { FollowingList } from 'src/shared/schemas/following-list.schema';
import { Followed } from 'src/shared/schemas/followed.schema';
import { UserAlreadyExistsError } from './errors/user-already-exists.error';
import { FollowsService } from 'src/features/follows/follows.service';
import { UserNotFoundError } from 'src/common/errors/user-not-found.error';
import { UpdateUserError } from './errors/update-user.error';
import { SoftDeleteModel } from 'mongoose-delete';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly saltRounds = 10;

  constructor(
    @InjectModel('User') private userModel: SoftDeleteModel<User>,
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
    const user = await this.userModel.findOne({ _id: userId });
    if (!user) throw new UserNotFoundError();
    return user;
  }

  getUserByUsername(username: string) {
    return this.userModel.findOne({ username });
  }

  async getUserRoles(userId: Types.ObjectId) {
    const user = await this.userModel.findById(userId);
    return user?.roles || [];
  }

  /**
   * Creates a user document (checks for existing username). Encapsulated within a transaction.
   * @param createUserDto
   * @returns
   */
  async createUser(createUserDto: CreateUserDto) {
    const session = await this.userModel.db.startSession();
    try {
      const newUser = await session.withTransaction(async () => {
        // Check existing username
        if (
          await this.userModel
            .exists({ username: createUserDto.username })
            .session(session)
        )
          throw new UserAlreadyExistsError();

        // Create new user document
        const newUser = new this.userModel({
          username: createUserDto.username,
          displayName: createUserDto.displayName,
        });

        // Create credential (username + password) document
        const hashedPassword = await bcrypt.hash(
          createUserDto.password,
          this.saltRounds,
        );
        const newPasswordCredential = new this.passwordCredentialModel({
          username: createUserDto.username,
          hashedPassword: hashedPassword,
        });
        await newPasswordCredential.save({ session });
        newUser.credential = newPasswordCredential._id;

        // Create new following list document
        const newFollowingList = new this.followingListModel({
          followingUsers: [],
        });
        await newFollowingList.save({ session });
        newUser.followed = newFollowingList._id;

        // Create new followed document
        const newFollowed = new this.followedModel({
          followerCount: 0,
        });
        await newFollowed.save({ session });
        newUser.followed = newFollowed._id;

        await newUser.save({ session });
        return newUser;
      });
      if (!newUser) throw new Error('Failed to create user.');
      this.logger.log(`User created: ${newUser._id}.`);
      return newUser;
    } catch (err) {
      this.logger.error('Failed to create user.', err.trace);
      throw err;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Updates user details. Encapsulated within a transaction.
   * @param userId
   * @param updateUserDto
   * @param options
   * @returns
   */
  async updateUser(
    userId: Types.ObjectId,
    updateUserDto: UpdateUserDetailsDto,
  ) {
    const session = await this.userModel.db.startSession();
    try {
      const updatedUser = await session.withTransaction(async () => {
        const updatedUser = await this.userModel.findByIdAndUpdate(
          userId,
          {
            ...updateUserDto,
          },
          { session, new: true },
        );
        return updatedUser;
      });
      this.logger.log(`User details updated: ${updatedUser.id}.`);
      return updatedUser.toJSON();
    } catch (error) {
      this.logger.error(error.message);
      throw new UpdateUserError();
    } finally {
      await session.endSession();
    }
  }

  /**
   * (Soft) Deletes a user. !!! Transaction not supported by library.
   * @param userId
   * @returns
   */
  async deleteUser(userId: Types.ObjectId) {
    const session = await this.userModel.db.startSession();
    try {
      const user = await session.withTransaction(async () => {
        const user = await this.userModel.findById(userId).session(session);
        if (!user) throw new UserNotFoundError();
        await user.delete();
        // await user.save({ session });
        return user;
      });
      if (!user) throw new Error('Failed to delete user.');
      this.logger.log(`User deleted: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(error.message);
    } finally {
      await session.endSession();
    }
  }
}
