import { Module } from '@nestjs/common';
import { TasksConfigModule } from './tasks-config.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

// [NES-5 · lesson 04] Reference — feature module boundary.
@Module({
  // Imports make the dynamic feature configuration available in this module scope.
  imports: [TasksConfigModule.forFeature('crud')],
  controllers: [TasksController],
  providers: [
    TasksService,
    {
      // Custom providers can use a token instead of a class as their lookup key.
      provide: 'TASK_ID_START',
      useFactory: (): number => 1,
    },
  ],
  // Export only what another module intentionally needs; controllers stay private.
  exports: [TasksService],
})
export class TasksModule {}
