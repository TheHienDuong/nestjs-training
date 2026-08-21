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

  it('delegates create to the injected service', () => {
    const task = { id: 1, title: 'Learn DI', completed: false };
    serviceMock.create.mockReturnValue(task);

    expect(controller.create({ title: 'Learn DI' })).toBe(task);
    expect(serviceMock.create).toHaveBeenCalledWith({ title: 'Learn DI' });
  });

  it('delegates filtered reads to the injected service', () => {
    serviceMock.findAll.mockReturnValue([]);

    expect(controller.findAll('true')).toEqual([]);
    expect(serviceMock.findAll).toHaveBeenCalledWith('true');
  });

  it('delegates update and remove without owning business logic', () => {
    const task = { id: 1, title: 'Learn DI', completed: true };
    serviceMock.update.mockReturnValue(task);

    expect(controller.update(1, { completed: true })).toBe(task);
    controller.remove(1);
    expect(serviceMock.update).toHaveBeenCalledWith(1, { completed: true });
    expect(serviceMock.remove).toHaveBeenCalledWith(1);
  });
});
