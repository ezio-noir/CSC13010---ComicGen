import { IsOptional, IsString } from 'class-validator';

export class EditUserDetailsDto {
  @IsOptional()
  @IsString()
  displayName?: string;
}
