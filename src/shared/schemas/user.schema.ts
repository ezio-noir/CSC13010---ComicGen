import mongoose, { InferSchemaType, Types } from 'mongoose';
import { Role } from 'src/common/enum/roles.enum';
import { SoftDeleteDocument } from 'mongoose-delete';
const MongooseDelete = require('mongoose-delete'); // Do not change to `import` statement

export interface IUser extends SoftDeleteDocument {
  _id: Types.ObjectId;
  username: string;
  displayName?: string;
  credential: Types.ObjectId;
  avatar: Types.ObjectId;
  followingList: Types.ObjectId;
  followed: Types.ObjectId;
  subscribeList: Types.ObjectId;
  comicCreationList: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  roles: Role[];
  projects: Types.ObjectId[];
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    username: { type: String, unique: true },
    displayName: { type: String },
    credential: { type: 'ObjectId', ref: 'PasswordCredential' },
    avatar: { type: 'ObjectId', ref: 'Resource' },
    followingList: { type: 'ObjectId', ref: 'FollowingList' },
    followed: { type: 'ObjectId', ref: 'Followed' },
    subscribeList: { type: 'ObjectId', ref: 'SubscribeList' },
    comicCreationList: { type: 'ObjectId', ref: 'ComicCreationList' },
    createdAt: { type: Date, default: Date.now() },
    roles: { type: [String], enum: Object.values(Role), default: [Role.USER] },
    projects: { type: [{ type: Types.ObjectId, ref: 'Project' }] },
  },
  { timestamps: true },
);
UserSchema.plugin(MongooseDelete, { deletedAt: true, overrideMethods: true });

export type User = InferSchemaType<typeof UserSchema>;

export { UserSchema };
