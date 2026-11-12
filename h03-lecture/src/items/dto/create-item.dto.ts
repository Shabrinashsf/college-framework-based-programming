import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required and must be a non-empty string' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required and must be a non-empty string' })
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description: string;
}
