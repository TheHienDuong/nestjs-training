import { Test, type TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

// [NES-8 · lesson 07] Reference — controller delegates HTTP concerns to service.
describe('TasksController', () => {
  let controller: TasksController;
  const serviceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [TasksService],
    })
      .overrideProvider(TasksService)
      .useValue(serviceMock)
      .compile();
    controller = module.get<TasksController>(TasksController);
  });

  it('delegates every CRUD operation to the injected service', async () => {
    const task = { id: 1, title: 'Learn modules', completed: false };
    serviceMock.create.mockResolvedValue(task);
    serviceMock.findAll.mockResolvedValue([task]);
    serviceMock.findOne.mockResolvedValue(task);
    serviceMock.update.mockResolvedValue({ ...task, completed: true });
    serviceMock.remove.mockResolvedValue(undefined);

    await expect(controller.create({ title: task.title })).resolves.toBe(task);
    await expect(controller.findAll('false')).resolves.toEqual([task]);
    await expect(controller.findOne(1)).resolves.toBe(task);
    await expect(controller.update(1, { completed: true })).resolves.toEqual({
      ...task,
      completed: true,
    });
    await expect(controller.remove(1)).resolves.toBeUndefined();
    expect(serviceMock.create).toHaveBeenCalledWith({ title: task.title });
    expect(serviceMock.findAll).toHaveBeenCalledWith('false');
    expect(serviceMock.findOne).toHaveBeenCalledWith(1);
    expect(serviceMock.update).toHaveBeenCalledWith(1, { completed: true });
    expect(serviceMock.remove).toHaveBeenCalledWith(1);
  });
});
