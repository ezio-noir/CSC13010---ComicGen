import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class FollowingList {
  @Prop({ required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  followingUsers: Types.ObjectId[];
}

export const FollowingListSchema = SchemaFactory.createForClass(FollowingList);
