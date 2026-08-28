import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

// [NES-8 · lesson 07] Reference — database-backed task provider.
// [NES-9 · lesson 08] The relational/status/priority columns live on the
// Task model (project/assignee stay optional — see prisma/schema.prisma),
// but are written-only for now.
// [NES-121 · lesson 08 corrective] Response shape stays { id, title,
// completed } (docs/lessons/05-dto-pipes-validation/SPEC.md AC9) — the new
// scalar columns are not exposed over HTTP at this lesson.
export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

const TASK_SELECT = {
  id: true,
  title: true,
  completed: true,
} satisfies Prisma.TaskSelect;

// [NES-121 · lesson 08 corrective] `status` and `completed` were two
// independent fields with no reconciliation, so PATCH { status: 'DONE' }
// left `completed` stale (and GET /tasks?completed=false could still return
// a DONE task). Rule: whenever a caller sends `status`, it is the single
// source of truth and `completed` is derived from it (DONE -> true,
// otherwise -> false), overriding any `completed` sent in the same request.
// Callers that omit `status` keep the pre-NES-121 behavior — `completed` is
// written exactly as given, untouched by `status`.
function reconcileCompleted<
  T extends { status?: TaskStatus; completed?: boolean },
>(dto: T): T {
  if (dto.status === undefined) {
    return dto;
  }
  return { ...dto, completed: dto.status === TaskStatus.DONE };
}

// Prisma throws P2025 ("record to update/delete not found") when a where-unique
// target no longer exists. Catching it here keeps update()/remove() race-free —
// no separate findOne() check before the mutation.
function isRecordNotFoundError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  );
}

// P2003 ("foreign key constraint failed") fires when projectId/assigneeId
// point at a row that does not exist — a client input error, not a server
// error, so it maps to 400 rather than bubbling up as a 500.
function isForeignKeyConstraintError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2003'
  );
}

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    try {
      return await this.prisma.task.create({
        data: reconcileCompleted(createTaskDto),
        select: TASK_SELECT,
      });
    } catch (error) {
      if (isForeignKeyConstraintError(error)) {
        throw new BadRequestException(
          'projectId or assigneeId does not reference an existing record',
        );
      }
      throw error;
    }
  }

  // Filtering business logic belongs in the service, not the controller.
  async findAll(completed?: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where:
        completed === undefined
          ? undefined
          : { completed: completed === 'true' },
      orderBy: { id: 'asc' },
      select: TASK_SELECT,
    });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      select: TASK_SELECT,
    });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    try {
      return await this.prisma.task.update({
        where: { id },
        data: reconcileCompleted(updateTaskDto),
        select: TASK_SELECT,
      });
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException(`Task ${id} not found`);
      }
      if (isForeignKeyConstraintError(error)) {
        throw new BadRequestException(
          'projectId or assigneeId does not reference an existing record',
        );
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.prisma.task.delete({ where: { id } });
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException(`Task ${id} not found`);
      }
      throw error;
    }
  }
}
