import { DynamicModule, Module } from '@nestjs/common';

// [NES-5 · lesson 04] Reference — deliberately small dynamic-module demonstration.
export const TASKS_CONFIG = 'TASKS_CONFIG';
export const TASKS_FEATURE = 'TASKS_FEATURE';

export interface TasksConfig {
  readonly appName: string;
}

@Module({})
export class TasksConfigModule {
  // forRoot configures one module-wide provider at the application boundary.
  static forRoot(config: TasksConfig): DynamicModule {
    return {
      module: TasksConfigModule,
      providers: [{ provide: TASKS_CONFIG, useValue: config }],
      exports: [TASKS_CONFIG],
    };
  }

  // forFeature adds a smaller feature-scoped value without making it global.
  static forFeature(featureName: string): DynamicModule {
    return {
      module: TasksConfigModule,
      providers: [{ provide: TASKS_FEATURE, useValue: featureName }],
      exports: [TASKS_FEATURE],
    };
  }
}
