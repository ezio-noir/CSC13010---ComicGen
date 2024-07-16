import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { PasswordCredential } from './password-credential.schema';
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

  @Prop({ type: Types.ObjectId, ref: 'PasswordCredential' })
  credential: PasswordCredential;

  @Prop()
  avatar?: string;

  @Prop({ ref: 'FollowingList' })
  followingList: Types.ObjectId;

  @Prop({ ref: 'Followed' })
  followed: Types.ObjectId;

  @Prop({ default: Date.now() })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User).plugin(
  MongooseDelete,
  { deletedAt: true },
);
