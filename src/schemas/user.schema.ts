import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { PasswordCredential } from './password-credential.schema';
import { FollowingList } from './following-list.schema';
import { Followed } from './followed.schema';
import { Transform } from 'class-transformer';
const MongooseDelete = require('mongoose-delete'); // Do not change to `import` statement

@Schema({
  timestamps: true,
  toJSON: {
    getters: true,
  },
})
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop()
  displayName?: string;

  @Transform(({ value }) => value?._id)
  @Prop({
    type: Types.ObjectId,
    ref: 'PasswordCredential',
    get: (value) => value._id,
  })
  credential: PasswordCredential;

  @Prop()
  avatar?: string;

  @Transform(({ value }) => value?._id)
  @Prop({
    type: Types.ObjectId,
    ref: 'FollowingList',
    get: (value) => value._id,
  })
  followingList: FollowingList;

  @Prop({
    type: Types.ObjectId,
    ref: 'Followed',
    get: (value) => value._id,
  })
  followed: Followed;

  @Prop({ default: Date.now() })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User).plugin(
  MongooseDelete,
  { deletedAt: true },
);
