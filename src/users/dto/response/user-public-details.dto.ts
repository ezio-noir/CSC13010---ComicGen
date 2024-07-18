import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UserPublicDetailsDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsInt()
  followerCount: number;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsDate()
  createdAt: Date;

  constructor(dto: Partial<UserPublicDetailsDto>) {
    Object.assign(this, dto);
  }
}
