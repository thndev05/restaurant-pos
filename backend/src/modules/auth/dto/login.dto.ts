import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6)
  @MaxLength(32)
  @IsNotEmpty()
  password: string;
}
