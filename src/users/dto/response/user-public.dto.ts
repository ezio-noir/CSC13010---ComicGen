import { Expose } from 'class-transformer';
import {
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class UserPublic {
  @IsNotEmpty()
  @IsMongoId()
  @Expose({ name: '_id' })
  id: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  @Expose()
  username: string;

  @IsOptional()
  @IsString()
  @Expose()
  displayName?: string;

  @IsOptional()
  @IsString()
  @Expose()
  avatar?: string;

  @IsDate()
  @Expose()
  createdAt: Date;

  constructor(user) {
    this.id = user._id;
    this.username = user.username;
    this.displayName = user.displayName;
    this.avatar = user.avatar;
    this.createdAt = user.createdAt;
  }
}
