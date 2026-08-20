// This DTO describes the PATCH payload; optional properties allow partial updates.
export class UpdateTaskDto {
  title?: string;
  completed?: boolean;
}
