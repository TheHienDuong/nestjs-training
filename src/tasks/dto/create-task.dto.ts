// [NES-5 · lesson 04] Reference — create DTO at the HTTP boundary.
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, {
    message: 'title must contain a non-whitespace character',
  })
  @MaxLength(200)
  title!: string;
}
