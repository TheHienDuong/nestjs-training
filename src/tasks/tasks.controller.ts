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
import type { CreateTaskDto } from './dto/create-task.dto';
import type { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
import type { Task } from './tasks.service';

// This prefix is combined with each method path, so the routes below start with `/tasks`.
@Controller('tasks')
export class TasksController {
  // Nest injects the service through the constructor so the controller does not create the dependency with `new`.
  constructor(private readonly tasksService: TasksService) {}

  // `@Get()` registers GET /tasks; @Query reads the filter from the query string, for example `?completed=true`.
  @Get()
  // @Header adds a response header while still using Nest standard response handling.
  @Header('Cache-Control', 'none')
  findAll(@Query('completed') completed?: string): Task[] {
    return this.tasksService.findAll(completed);
  }

  // `@Post()` registers POST /tasks; @Body passes the payload bound to the DTO to the service for processing.
  @Post()
  create(@Body() createTaskDto: CreateTaskDto): Task {
    return this.tasksService.create(createTaskDto);
  }

  // `:id` is a route parameter; @Param reads it, and ParseIntPipe both transforms it to a number and validates the data.
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Task {
    return this.tasksService.findOne(id);
  }

  // `@Patch(':id')` updates a task by id, while @Body receives the fields that can be updated from the DTO.
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Task {
    return this.tasksService.update(id, updateTaskDto);
  }

  // `@Delete(':id')` deletes by route parameter; NO_CONTENT represents success without a response body.
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): void {
    this.tasksService.remove(id);
  }
}
