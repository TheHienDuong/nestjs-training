import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TaskPriority, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

// [NES-8 · lesson 07] Reference — database-backed task provider.
// [NES-9 · lesson 08] Expanded with the relational columns added to the
// Task model (project/assignee stay optional — see prisma/schema.prisma).
export interface Task {
  id: number;
  title: string;
  completed: boolean;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  projectId: number | null;
  assigneeId: number | null;
  createdAt: Date;
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
      return await this.prisma.task.create({ data: createTaskDto });
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
    });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    try {
      return await this.prisma.task.update({
        where: { id },
        data: updateTaskDto,
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
