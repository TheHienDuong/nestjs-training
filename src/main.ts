import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

export async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = app.get(ConfigService).get<number>('PORT');

  // Validation runs before this point, so a missing PORT is a configuration error.
  if (port === undefined) {
    throw new Error('PORT must be configured before the application can start');
  }

  await app.listen(port);
}

void bootstrap();
