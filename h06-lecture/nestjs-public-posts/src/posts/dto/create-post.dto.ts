import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Trim } from '../../common/trim.transform';

export class CreatePostDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  content: string;

  // HTML forms send strings: a checkbox arrives as "true" (or ["false", "true"]
  // when paired with a hidden "false" input), so it is converted to a boolean here.
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined || typeof value === 'boolean') return value;
    const values = Array.isArray(value) ? value : [value];
    return values.some((v) => v === 'true' || v === 'on');
  })
  @IsBoolean()
  published?: boolean;

  // Form fields are strings, so convert to a number before @IsInt() runs.
  @Type(() => Number)
  @IsInt()
  authorId: number;
}
