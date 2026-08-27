import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

// [NES-8 · lesson 07] Reference — database-backed task provider.
export interface Task {
  id: number;
  title: string;
  completed: boolean;
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

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    return this.prisma.task.create({ data: { title: createTaskDto.title } });
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
