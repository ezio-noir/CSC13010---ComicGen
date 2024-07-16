import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from './user.schema';

@Schema()
export class Followed {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  user: User;

  @Prop({ default: 0 })
  followerCount: number;
}

export const FollowedSchema = SchemaFactory.createForClass(Followed);
