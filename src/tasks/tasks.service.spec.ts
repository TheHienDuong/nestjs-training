// [NES-4 · lesson 03] Reference — service behavior and regression coverage.
import { Test, type TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: 'TASK_ID_START',
          useFactory: (): number => 100,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('receives the custom provider value through constructor DI', () => {
    expect(service.create({ title: 'First task' }).id).toBe(100);
  });

  it('creates and lists tasks', () => {
    const task = service.create({ title: 'Learn providers' });

    expect(service.findAll()).toEqual([task]);
    expect(task).toEqual({
      id: 100,
      title: 'Learn providers',
      completed: false,
    });
  });

  it('finds, updates, and removes a task', () => {
    const task = service.create({ title: 'Learn DI' });

    expect(service.findOne(task.id)).toBe(task);
    expect(
      service.update(task.id, { completed: true, title: 'Practice DI' }),
    ).toEqual({
      id: 100,
      title: 'Practice DI',
      completed: true,
    });
    service.remove(task.id);
    expect(service.findAll()).toEqual([]);
  });

  it('keeps task IDs increasing after deletion', () => {
    const firstTask = service.create({ title: 'First task' });
    const secondTask = service.create({ title: 'Second task' });

    service.remove(firstTask.id);

    const replacementTask = service.create({ title: 'Replacement task' });

    expect(replacementTask.id).toBeGreaterThan(secondTask.id);
  });

  it('filters by completion status', () => {
    service.create({ title: 'Open' });
    const completed = service.create({ title: 'Done' });
    service.update(completed.id, { completed: true });

    expect(service.findAll('true')).toEqual([completed]);
    expect(service.findAll('false')).toEqual([
      { id: 100, title: 'Open', completed: false },
    ]);
  });

  it('throws NotFoundException for missing tasks', () => {
    expect(() => service.findOne(999)).toThrow('Task 999 not found');
    expect(() => service.update(999, { completed: true })).toThrow(
      'Task 999 not found',
    );
    expect(() => service.remove(999)).toThrow('Task 999 not found');
  });
});
