import mongoose, { Types } from 'mongoose';
import { Role } from 'src/common/enum/roles.enum';
import { SoftDeleteDocument } from 'mongoose-delete';
const MongooseDelete = require('mongoose-delete'); // Do not change to `import` statement

export interface User extends SoftDeleteDocument {
  _id: Types.ObjectId;
  username: string;
  displayName?: string;
  credential: Types.ObjectId;
  avatar: string;
  followingList: Types.ObjectId;
  followed: Types.ObjectId;
  comicCreationList: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  roles: Role[];
}

const UserSchema = new mongoose.Schema<User>(
  {
    username: { type: String, unique: true },
    displayName: { type: String, unique: true },
    credential: { type: 'ObjectId', ref: 'PasswordCredential' },
    avatar: { type: String, unique: true },
    followingList: { type: 'ObjectId', ref: 'FollowingList' },
    followed: { type: 'ObjectId', ref: 'Followed' },
    comicCreationList: { type: 'ObjectId', ref: 'ComicCreationList' },
    createdAt: { type: Date, default: Date.now() },
    roles: { type: [String], enum: Object.values(Role), default: [Role.USER] },
  },
  { timestamps: true },
);
UserSchema.plugin(MongooseDelete, { deletedAt: true, overrideMethods: true });

export { UserSchema };
