import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { TasksConfigModule } from './tasks/tasks-config.module';
import { UsersModule } from './users/users.module';

@Module({
  // AppModule composes feature modules; it does not own their controllers/providers.
  // forRoot demonstrates one-time dynamic configuration at the application boundary.
  imports: [
    UsersModule,
    TasksModule,
    TasksConfigModule.forRoot({ appName: 'nestjs-training' }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      // APP_PIPE covers both src/main.ts bootstrap and createNestApplication e2e apps.
      useFactory: (): ValidationPipe =>
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
    },
  ],
})
export class AppModule {}
