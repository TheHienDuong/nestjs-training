import { Test, type TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from './tasks.service';

// [NES-8 · lesson 07] Reference — service behavior with Prisma mocked at the boundary.
describe('TasksService', () => {
  let service: TasksService;
  let prisma: {
    task: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      task: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<TasksService>(TasksService);
  });

  it('creates a task through Prisma', async () => {
    const task = { id: 1, title: 'First task', completed: false };
    prisma.task.create.mockResolvedValue(task);

    await expect(service.create({ title: task.title })).resolves.toEqual(task);
    expect(prisma.task.create).toHaveBeenCalledWith({
      data: { title: task.title },
    });
  });

  it('filters tasks through Prisma', async () => {
    const tasks = [{ id: 1, title: 'Done', completed: true }];
    prisma.task.findMany.mockResolvedValue(tasks);

    await expect(service.findAll('true')).resolves.toEqual(tasks);
    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where: { completed: true },
      orderBy: { id: 'asc' },
    });
  });

  it('throws NotFoundException when Prisma cannot find a task', async () => {
    prisma.task.findUnique.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow('Task 999 not found');
  });

  it('updates and deletes an existing task', async () => {
    const task = { id: 1, title: 'Task', completed: false };
    prisma.task.findUnique.mockResolvedValue(task);
    prisma.task.update.mockResolvedValue({ ...task, completed: true });

    await expect(service.update(1, { completed: true })).resolves.toEqual({
      ...task,
      completed: true,
    });
    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
