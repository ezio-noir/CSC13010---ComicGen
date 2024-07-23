import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { PasswordCredential } from './password-credential.schema';
import { FollowingList } from './following-list.schema';
import { Followed } from './followed.schema';
import { Role } from 'src/enum/roles.enum';
import { ComicCreationList } from './comic-creation-list.schema';
const MongooseDelete = require('mongoose-delete'); // Do not change to `import` statement

@Schema({
  timestamps: true,
  toJSON: {
    getters: true,
    transform: (doc, ret) => {
      return ret;
    },
  },
})
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop()
  displayName?: string;

  @Prop({
    type: Types.ObjectId,
    ref: PasswordCredential.name,
  })
  credential: Types.ObjectId;

  @Prop()
  avatar?: string;

  @Prop({
    type: Types.ObjectId,
    ref: FollowingList.name,
  })
  followingList: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Followed.name,
  })
  followed: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: ComicCreationList.name,
  })
  comicCreationList: Types.ObjectId;

  @Prop({ default: Date.now() })
  createdAt: Date;

  @Prop({ type: [String], enum: Object.values(Role), default: [Role.USER] })
  roles: Role[];
}

const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(MongooseDelete, { deletedAt: true });

export { UserSchema };
