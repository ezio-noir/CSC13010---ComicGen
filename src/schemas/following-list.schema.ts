import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from './user.schema';

@Schema()
export class FollowingList {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  user: User;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  followingUsers;
}

export const FollowingListSchema = SchemaFactory.createForClass(FollowingList);
