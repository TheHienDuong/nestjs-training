// DTO is a class that describes the request body shape and also exists at runtime so the pipe has metadata for validation.
export class CreateTaskDto {
  title!: string;
}
