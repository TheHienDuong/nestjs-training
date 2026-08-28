// [NES-5 · lesson 04] Reference — partial update DTO.
// [NES-9 · lesson 08] project/assignee/description/status/priority/dueDate
// added — all optional, matching the existing partial-update contract.
// [NES-121 · lesson 08 corrective] projectId/assigneeId reject boolean input
// instead of silently coercing it to 0/1 — see reject-boolean-id.transform.ts.
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
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
import { rejectBooleanId } from './reject-boolean-id.transform';

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
  @Transform(rejectBooleanId)
  @IsInt()
  @IsPositive()
  projectId?: number;

  @IsOptional()
  @Transform(rejectBooleanId)
  @IsInt()
  @IsPositive()
  assigneeId?: number;
}
