import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

describe('TasksController', () => {
  let controller: TasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [TasksService],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('creates, reads, updates, and removes a task', () => {
    const created = controller.create({ title: 'Learn routing' });

    expect(controller.findAll()).toEqual([created]);
    expect(controller.findOne(created.id)).toEqual(created);
    expect(controller.update(created.id, { completed: true })).toEqual({
      ...created,
      completed: true,
    });

    controller.remove(created.id);
    expect(controller.findAll()).toEqual([]);
  });

  it('filters tasks using the completed query', () => {
    controller.create({ title: 'Open task' });
    const completedTask = controller.create({ title: 'Done task' });
    controller.update(completedTask.id, { completed: true });

    expect(controller.findAll('true')).toEqual([
      expect.objectContaining({ title: 'Done task', completed: true }),
    ]);
    expect(controller.findAll('false')).toEqual([
      expect.objectContaining({ title: 'Open task', completed: false }),
    ]);
  });
});
