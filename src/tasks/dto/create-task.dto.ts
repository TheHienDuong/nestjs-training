// [NES-5 · lesson 04] Reference — create DTO at the HTTP boundary.
// [NES-9 · lesson 08] project/assignee/description/status/priority/dueDate
// added — all optional, so the L07 title-only contract keeps working.
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { TaskPriority, TaskStatus } from '@prisma/client';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, {
    message: 'title must contain a non-whitespace character',
  })
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  projectId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  assigneeId?: number;
}
