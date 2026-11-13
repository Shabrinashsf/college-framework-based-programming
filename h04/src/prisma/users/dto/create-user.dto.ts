import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {
  // TODO: Implement user DTO with validation decorators
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @IsString({ message: 'Email must be a string' })
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(50, { message: 'Email must not exceed 50 characters' })
  email: string;
}
