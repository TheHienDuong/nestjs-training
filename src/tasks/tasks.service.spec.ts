import { BadRequestException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from './tasks.service';

function recordNotFoundError(): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError(
    'An operation failed because it depends on one or more records that were required but not found.',
    { code: 'P2025', clientVersion: '6.19.3' },
  );
}

function foreignKeyConstraintError(): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError(
    'Foreign key constraint failed on the field: `projectId`',
    { code: 'P2003', clientVersion: '6.19.3' },
  );
}

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

  it('creates a task with an optional project/assignee through Prisma', async () => {
    const task = {
      id: 2,
      title: 'Relational task',
      completed: false,
      projectId: 10,
      assigneeId: 5,
    };
    prisma.task.create.mockResolvedValue(task);

    const dto = { title: task.title, projectId: 10, assigneeId: 5 };
    await expect(service.create(dto)).resolves.toEqual(task);
    expect(prisma.task.create).toHaveBeenCalledWith({ data: dto });
  });

  it('maps a Prisma P2003 error to BadRequestException on create', async () => {
    prisma.task.create.mockRejectedValue(foreignKeyConstraintError());

    await expect(
      service.create({ title: 'Orphan task', projectId: 999 }),
    ).rejects.toThrow(BadRequestException);
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
    prisma.task.update.mockResolvedValue({ ...task, completed: true });
    prisma.task.delete.mockResolvedValue(task);

    await expect(service.update(1, { completed: true })).resolves.toEqual({
      ...task,
      completed: true,
    });
    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { completed: true },
    });

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('maps a Prisma P2025 error to NotFoundException on update, without a prior existence check', async () => {
    prisma.task.update.mockRejectedValue(recordNotFoundError());

    await expect(service.update(999, { completed: true })).rejects.toThrow(
      'Task 999 not found',
    );
    expect(prisma.task.findUnique).not.toHaveBeenCalled();
  });

  it('maps a Prisma P2003 error to BadRequestException on update', async () => {
    prisma.task.update.mockRejectedValue(foreignKeyConstraintError());

    await expect(service.update(1, { projectId: 999 })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('maps a Prisma P2025 error to NotFoundException on remove, without a prior existence check', async () => {
    prisma.task.delete.mockRejectedValue(recordNotFoundError());

    await expect(service.remove(999)).rejects.toThrow('Task 999 not found');
    expect(prisma.task.findUnique).not.toHaveBeenCalled();
  });

  it('rethrows non-P2025 Prisma errors from update/remove unchanged', async () => {
    const otherError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed.',
      { code: 'P2002', clientVersion: '6.19.3' },
    );
    prisma.task.update.mockRejectedValue(otherError);
    prisma.task.delete.mockRejectedValue(otherError);

    await expect(service.update(1, { completed: true })).rejects.toBe(
      otherError,
    );
    await expect(service.remove(1)).rejects.toBe(otherError);
  });
});
