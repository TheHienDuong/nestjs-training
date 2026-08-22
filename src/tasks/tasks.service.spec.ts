// [NES-5 · lesson 04] Reference — service behavior and custom-provider coverage.
import { Test, type TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService, { provide: 'TASK_ID_START', useValue: 100 }],
    }).compile();
    service = module.get<TasksService>(TasksService);
  });

  it('receives the custom provider value through constructor DI', () => {
    expect(service.create({ title: 'First task' }).id).toBe(100);
  });

  it('performs create, list, get-one, patch, and remove', () => {
    const task = service.create({ title: 'Learn modules' });
    expect(service.findAll()).toEqual([task]);
    expect(service.findOne(task.id)).toBe(task);
    expect(service.update(task.id, { completed: true })).toEqual({
      id: 100,
      title: 'Learn modules',
      completed: true,
    });
    service.remove(task.id);
    expect(service.findAll()).toEqual([]);
  });

  it('throws for a missing task', () => {
    expect(() => service.findOne(999)).toThrow('Task 999 not found');
    expect(() => service.update(999, { completed: true })).toThrow(
      'Task 999 not found',
    );
    expect(() => service.remove(999)).toThrow('Task 999 not found');
  });
});
