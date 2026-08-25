import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ParseCompletedQueryPipe } from './pipes/parse-completed-query.pipe';
import { TasksService } from './tasks.service';
import type { Task } from './tasks.service';

// [NES-5 · lesson 04] Reference — thin HTTP controller using constructor DI.
@Controller('tasks')
export class TasksController {
  // Nest supplies the provider; the controller never constructs a service itself.
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  findAll(
    @Query('completed', ParseCompletedQueryPipe) completed?: string,
  ): Task[] {
    return this.tasksService.findAll(completed);
  }

  @Post()
  create(@Body() createTaskDto: CreateTaskDto): Task {
    return this.tasksService.create(createTaskDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Task {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Task {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): void {
    this.tasksService.remove(id);
  }
}
