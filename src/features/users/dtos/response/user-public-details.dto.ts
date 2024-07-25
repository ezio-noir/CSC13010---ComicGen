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

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsDate()
  createdAt: Date;

  roles: string[];

  constructor(dto: Partial<UserPublicDetailsDto>) {
    Object.assign(this, dto);
  }
}
