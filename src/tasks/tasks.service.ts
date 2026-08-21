import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

// Injectable cho phép Nest quản lý service và cung cấp nó qua constructor injection.
@Injectable()
export class TasksService {
  private readonly tasks: Task[] = [];
  // Counter tăng đều và không quay lại phía sau khi một task bị xóa.
  // Vì vậy id mới luôn duy nhất trong suốt vòng đời của service.
  private nextId = 1;

  create(createTaskDto: CreateTaskDto): Task {
    const task: Task = {
      id: this.nextId++,
      title: createTaskDto.title,
      completed: false,
    };
    this.tasks.push(task);
    return task;
  }

  // Filter là business logic, vì vậy controller chỉ nhận input rồi ủy quyền cho service.
  findAll(completed?: string): Task[] {
    if (completed === undefined) {
      return this.tasks;
    }

    const isCompleted = completed === 'true';
    return this.tasks.filter((task) => task.completed === isCompleted);
  }

  findOne(id: number): Task {
    const task = this.tasks.find((item) => item.id === id);
    // Exception này được Nest chuyển thành HTTP 404 khi không tìm thấy task.
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  update(id: number, updateTaskDto: UpdateTaskDto): Task {
    const task = this.findOne(id);

    // Chỉ copy các field thuộc contract cập nhật; id là identity nên không được đổi.
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
