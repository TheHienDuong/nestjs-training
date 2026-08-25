// [NES-5 · lesson 04] Reference — partial update DTO.
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, {
    message: 'title must contain a non-whitespace character',
  })
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
