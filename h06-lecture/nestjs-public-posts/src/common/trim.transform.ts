import { Transform } from 'class-transformer';

/**
 * Trims surrounding whitespace from string input before validation runs,
 * so "   " fails @IsNotEmpty() instead of being saved as a blank value.
 */
export function Trim() {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );
}
