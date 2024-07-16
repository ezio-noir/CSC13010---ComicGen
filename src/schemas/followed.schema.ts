import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class Followed {
  @Prop({ required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ default: 0 })
  followerCount: number;
}

export const FollowedSchema = SchemaFactory.createForClass(Followed);
