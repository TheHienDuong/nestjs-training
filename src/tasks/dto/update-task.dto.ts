// DTO này mô tả payload PATCH; các thuộc tính optional cho phép cập nhật từng phần.
export class UpdateTaskDto {
  title?: string;
  completed?: boolean;
}
