import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Trim } from '../../common/trim.transform';

export class CreateUserDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Trim()
  @IsEmail()
  email: string;

  @Trim()
  @IsOptional()
  @IsString()
  bio?: string;
}
