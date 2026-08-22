import { Test, type TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

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

  it('delegates every CRUD operation to the injected service', () => {
    const task = { id: 1, title: 'Learn modules', completed: false };
    serviceMock.create.mockReturnValue(task);
    serviceMock.findAll.mockReturnValue([task]);
    serviceMock.findOne.mockReturnValue(task);
    serviceMock.update.mockReturnValue({ ...task, completed: true });

    expect(controller.create({ title: task.title })).toBe(task);
    expect(controller.findAll('false')).toEqual([task]);
    expect(controller.findOne(1)).toBe(task);
    expect(controller.update(1, { completed: true })).toEqual({
      ...task,
      completed: true,
    });
    expect(controller.remove(1)).toBeUndefined();
    expect(serviceMock.create).toHaveBeenCalledWith({ title: task.title });
    expect(serviceMock.findAll).toHaveBeenCalledWith('false');
    expect(serviceMock.findOne).toHaveBeenCalledWith(1);
    expect(serviceMock.update).toHaveBeenCalledWith(1, { completed: true });
    expect(serviceMock.remove).toHaveBeenCalledWith(1);
  });
});
