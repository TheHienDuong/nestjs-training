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

// Prefix này được ghép với path của từng method, nên các route bên dưới bắt đầu bằng `/tasks`.
@Controller('tasks')
export class TasksController {
  // Nest inject service qua constructor để controller không tự tạo dependency bằng `new`.
  constructor(private readonly tasksService: TasksService) {}

  // `@Get()` đăng ký GET /tasks; @Query lấy filter từ query string, ví dụ `?completed=true`.
  @Get()
  // @Header thêm header phản hồi mà vẫn dùng cơ chế response chuẩn của Nest.
  @Header('Cache-Control', 'no-store')
  findAll(@Query('completed') completed?: string): Task[] {
    return this.tasksService.findAll(completed);
  }

  // `@Post()` đăng ký POST /tasks; @Body đưa payload đã bind vào DTO cho service xử lý.
  @Post()
  create(@Body() createTaskDto: CreateTaskDto): Task {
    return this.tasksService.create(createTaskDto);
  }

  // `:id` là route parameter; @Param lấy nó và ParseIntPipe vừa transform sang number vừa validate dữ liệu.
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Task {
    return this.tasksService.findOne(id);
  }

  // `@Patch(':id')` cập nhật một task theo id, còn @Body nhận các trường có thể cập nhật từ DTO.
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Task {
    return this.tasksService.update(id, updateTaskDto);
  }

  // `@Delete(':id')` xóa theo route parameter; NO_CONTENT biểu diễn thành công nhưng không có response body.
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): void {
    this.tasksService.remove(id);
  }
}
