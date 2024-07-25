import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDetailsDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
