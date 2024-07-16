import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class FollowUserDto {
  @IsNotEmpty()
  @IsMongoId()
  targetUserId: Types.ObjectId;
}
