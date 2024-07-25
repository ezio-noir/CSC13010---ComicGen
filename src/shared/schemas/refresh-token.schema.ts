import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from './user.schema';

@Schema()
export class RefreshToken {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: User;

  @Prop()
  hashedRefreshToken: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
