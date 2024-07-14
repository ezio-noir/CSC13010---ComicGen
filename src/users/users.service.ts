import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { PasswordCredential } from 'src/schemas/password-credential.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDetailsDto } from './dto/update-user-details.dto';
import { FollowingList } from 'src/schemas/following-list.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: mongoose.Model<User>,
    @InjectModel(PasswordCredential.name)
    private passwordCredentialModel: mongoose.Model<PasswordCredential>,
    @InjectModel(FollowingList.name)
    private followingListModel: mongoose.Model<FollowingList>,
  ) {}

  getUserById(userId: string | mongoose.Types.ObjectId) {
    return this.userModel.findById(new mongoose.Types.ObjectId(userId));
  }

  getUserByUsername(username: string) {
    return this.userModel.findOne({ username });
  }

  async createUser(createUserDto: CreateUserDto) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );
    const newPasswordCredential = new this.passwordCredentialModel({
      username: createUserDto.username,
      hashedPassword: hashedPassword,
    });
    const passwordCredential = await newPasswordCredential.save();

    const newUser = new this.userModel({
      username: createUserDto.username,
      displayName: createUserDto.displayName,
      credential: passwordCredential._id,
      avatar: createUserDto.avatar,
    });
    const savedNewUser = await newUser.save();

    const newFollowingList = await new this.followingListModel({
      userId: savedNewUser._id,
      followingUsers: [],
    });
    const savedNewFollowingList = await newFollowingList.save();
    savedNewUser.followingList = savedNewFollowingList._id;

    return await savedNewUser.save();
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
