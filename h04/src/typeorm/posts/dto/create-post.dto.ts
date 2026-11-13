import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePostDto {
  // TODO: Implement post DTO with validation decorators
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
  title: string;

  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content is required' })
  @MaxLength(1000, { message: 'Content must not exceed 1000 characters' })
  content: string;

  @IsNumber({}, { message: 'Author ID must be a number' })
  @IsNotEmpty({ message: 'Author ID is required' })
  @IsPositive({ message: 'Author ID must be a positive number' })
  authorId: number;
}
