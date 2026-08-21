import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

// [NES-4 · lesson 03] Reference — provider registration and custom provider.
@Module({
  controllers: [TasksController],
  providers: [
    TasksService,
    {
      // A non-class token demonstrates a custom provider. Nest resolves this
      // factory once for the module and injects the resulting value by token.
      provide: 'TASK_ID_START',
      useFactory: (): number => 1,
    },
  ],
})
export class TasksModule {}
