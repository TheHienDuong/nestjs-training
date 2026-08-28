import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';

// [NES-122 · lesson 08 follow-up] DTO-level regression for the
// reject-boolean-id transform: exercises the same plainToInstance-then-validate
// pipeline `ValidationPipe({ transform: true })` runs, so array-valued
// projectId/assigneeId (e.g. from `?projectId[]=5`-style bodies) are proven to
// fail validation instead of silently coercing to a scalar id.
describe('CreateTaskDto (relation-ID array rejection)', () => {
  it('rejects an array projectId', async () => {
    const dto = plainToInstance(CreateTaskDto, {
      title: 'Valid',
      projectId: ['5'],
    });

    const errors = await validate(dto);

    const projectIdError = errors.find((e) => e.property === 'projectId');
    expect(projectIdError).toBeDefined();
    expect(projectIdError?.constraints).toHaveProperty('isInt');
  });

  it('rejects an array assigneeId', async () => {
    const dto = plainToInstance(CreateTaskDto, {
      title: 'Valid',
      assigneeId: ['5'],
    });

    const errors = await validate(dto);

    const assigneeIdError = errors.find((e) => e.property === 'assigneeId');
    expect(assigneeIdError).toBeDefined();
    expect(assigneeIdError?.constraints).toHaveProperty('isInt');
  });

  it('still accepts a numeric-string projectId', async () => {
    const dto = plainToInstance(CreateTaskDto, {
      title: 'Valid',
      projectId: '5',
    });

    const errors = await validate(dto);

    expect(errors.find((e) => e.property === 'projectId')).toBeUndefined();
    expect(dto.projectId).toBe(5);
  });
});
