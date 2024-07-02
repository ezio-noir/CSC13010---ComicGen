import { IsNotEmpty, IsString } from "class-validator";

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsString()
  displayName: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}