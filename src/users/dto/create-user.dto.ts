import { IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsString()
  displayName: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsString()
  avatar: string;
}