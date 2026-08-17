import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

@Injectable()
export class TasksService {
  private readonly tasks: Task[] = [];

  create(createTaskDto: CreateTaskDto): Task {
    const task: Task = {
      id: this.tasks.length + 1,
      title: createTaskDto.title,
      completed: false,
    };
    this.tasks.push(task);
    return task;
  }

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
    Object.assign(task, updateTaskDto);
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
