import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class FollowingList {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  followingUsers: Types.ObjectId[];
}

export const FollowingListSchema = SchemaFactory.createForClass(FollowingList);
