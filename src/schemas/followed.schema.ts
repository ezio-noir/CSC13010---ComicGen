import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Followed {
  @Prop({ default: 0 })
  followerCount: number;
}

export const FollowedSchema = SchemaFactory.createForClass(Followed);
