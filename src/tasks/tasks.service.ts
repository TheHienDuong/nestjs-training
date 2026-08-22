import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

// [NES-5 · lesson 04] Reference — singleton provider with constructor DI.
export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

// Providers are singleton-scoped by default. This makes the in-memory collection
// shared by every request handled by this feature module during app lifetime.
@Injectable()
export class TasksService {
  private readonly tasks: Task[] = [];
  private nextId: number;

  constructor(@Inject('TASK_ID_START') taskIdStart: number) {
    // The token is resolved by TasksModule's custom provider and injected here.
    this.nextId = taskIdStart;
  }

  create(createTaskDto: CreateTaskDto): Task {
    const task: Task = {
      id: this.nextId++,
      title: createTaskDto.title,
      completed: false,
    };
    this.tasks.push(task);
    return task;
  }

  // Filtering is business logic, so it belongs in the provider, not the controller.
  findAll(completed?: string): Task[] {
    if (completed === undefined) {
      return this.tasks;
    }
    const isCompleted = completed === 'true';
    return this.tasks.filter((task) => task.completed === isCompleted);
  }

  findOne(id: number): Task {
    const task = this.tasks.find((item) => item.id === id);
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  update(id: number, updateTaskDto: UpdateTaskDto): Task {
    const task = this.findOne(id);
    if (updateTaskDto.title !== undefined) {
      task.title = updateTaskDto.title;
    }
    if (updateTaskDto.completed !== undefined) {
      task.completed = updateTaskDto.completed;
    }
    return task;
  }

  remove(id: number): void {
    const taskIndex = this.tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    this.tasks.splice(taskIndex, 1);
  }
}
