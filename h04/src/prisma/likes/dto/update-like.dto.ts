import { PartialType } from '@nestjs/mapped-types';
import { CreateLikeDto } from './create-like.dto';

export class UpdateLikeDto extends PartialType(CreateLikeDto) {
  // TODO: Implement update DTO extending PartialType(CreateLikeDto)
}
