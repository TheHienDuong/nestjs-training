import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TasksConfigModule } from './tasks-config.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

// [NES-8 · lesson 07] Reference — feature module with database dependency.
@Module({
  imports: [PrismaModule, TasksConfigModule.forFeature('crud')],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
