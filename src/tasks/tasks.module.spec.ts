import { Test, type TestingModule } from '@nestjs/testing';
import { TasksConfigModule } from './tasks-config.module';
import { TasksController } from './tasks.controller';
import { TasksModule } from './tasks.module';
import { TasksService } from './tasks.service';

describe('TasksModule', () => {
  it('registers the feature controller and service in one module scope', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TasksModule],
    }).compile();

    expect(module.get(TasksController)).toBeInstanceOf(TasksController);
    expect(module.get(TasksService)).toBeInstanceOf(TasksService);
  });

  it('exposes dynamic forRoot and forFeature provider contracts', () => {
    const root = TasksConfigModule.forRoot({ appName: 'test' });
    const feature = TasksConfigModule.forFeature('crud');

    expect(root.module).toBe(TasksConfigModule);
    expect(root.exports).toEqual(['TASKS_CONFIG']);
    expect(feature.exports).toEqual(['TASKS_FEATURE']);
  });
});
