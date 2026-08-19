// DTO là class mô tả shape của request body và còn tồn tại ở runtime để pipe có metadata kiểm tra.
export class CreateTaskDto {
  title!: string;
}
