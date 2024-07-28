import { IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateUserDetailsDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  avatar?: Types.ObjectId;
}
