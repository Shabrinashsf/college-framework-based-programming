import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateLikeDto {
  // TODO: Implement like DTO with validation decorators

  @IsNumber({}, { message: 'User ID must be a number' })
  @IsNotEmpty({ message: 'User ID is required' })
  @IsPositive({ message: 'User ID must be a positive number' })
  userId: number;

  @IsNumber({}, { message: 'Post ID must be a number' })
  @IsNotEmpty({ message: 'Post ID is required' })
  @IsPositive({ message: 'Post ID must be a positive number' })
  postId: number;
}
