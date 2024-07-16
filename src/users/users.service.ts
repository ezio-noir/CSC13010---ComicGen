import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { PasswordCredential } from 'src/schemas/password-credential.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDetailsDto } from './dto/request/update-user-details.dto';
import { FollowingList } from 'src/schemas/following-list.schema';
import { Followed } from 'src/schemas/followed.schema';
import { UserAlreadyExistsError } from './error/user-already-exists.error';

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
  ) {}

  getUserById(userId: string | mongoose.Types.ObjectId) {
    return this.userModel.findById(new mongoose.Types.ObjectId(userId));
  }

  getUserByUsername(username: string) {
    return this.userModel.findOne({ username });
  }

  async createUser(createUserDto: CreateUserDto) {
    const session = await this.userModel.db.startSession();
    session.startTransaction();
    try {
      if (
        await this.userModel.exists({
          username: createUserDto.username,
        })
      ) {
        throw new UserAlreadyExistsError();
      }

      const newUser = new this.userModel({
        username: createUserDto.username,
        displayName: createUserDto.displayName,
        avatar: createUserDto.avatar,
      });
      // const savedNewUser = await newUser.save({ session });

      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        this.saltRounds,
      );
      const newPasswordCredential = new this.passwordCredentialModel({
        username: createUserDto.username,
        hashedPassword: hashedPassword,
      });
      await newPasswordCredential.save({ session });
      newUser.credential = newPasswordCredential;

      const newFollowingList = new this.followingListModel({
        user: newUser,
        followingUsers: [],
      });
      await newFollowingList.save({ session });
      newUser.followingList = newFollowingList;

      const newFollowed = new this.followedModel({
        user: newUser,
        followerCount: 0,
      });
      await newFollowed.save({ session });
      newUser.followed = newFollowed;

      await newUser.save({ session });
      await session.commitTransaction();
      session.endSession();

      this.logger.log(`User created: ${newUser._id}.`);
      return newUser.toJSON({ getters: true });
    } catch (err) {
      console.log(err);
      await session.abortTransaction();
      session.endSession();

      this.logger.error('Failed to create user.', err.trace);
      throw err;
    }
  }

  async updateUser(
    userId: mongoose.Types.ObjectId,
    updateUserDto: UpdateUserDetailsDto,
  ) {
    console.log(updateUserDto);
    return await this.userModel.findByIdAndUpdate(userId, {
      ...updateUserDto,
    });
  }
}
