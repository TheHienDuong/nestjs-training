import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

// [NES-8 · lesson 07] Reference — database-backed task provider.
export interface Task {
  id: number;
  title: string;
  completed: boolean;
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
    await this.findOne(id);
    return this.prisma.task.update({ where: { id }, data: updateTaskDto });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.task.delete({ where: { id } });
  }
}
