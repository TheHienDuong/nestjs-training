import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { bootstrap } from './main';

jest.mock('./app.module', () => ({
  AppModule: class AppModule {},
}));

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockResolvedValue({
      enableShutdownHooks: jest.fn(),
      get: jest.fn().mockReturnValue({
        get: jest.fn().mockReturnValue(3000),
      }),
      listen: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

describe('bootstrap configuration wiring', () => {
  it('enables shutdown hooks and listens on configured PORT', async () => {
    const appGet = jest.fn().mockReturnValue(4321);
    const appEnableShutdownHooks = jest.fn();
    const appGetConfig = jest.fn().mockReturnValue({ get: appGet });
    const appListen = jest.fn().mockResolvedValue(undefined);
    const app = {
      enableShutdownHooks: appEnableShutdownHooks,
      get: appGetConfig,
      listen: appListen,
    } as unknown as INestApplication;
    const create = jest.spyOn(NestFactory, 'create').mockResolvedValue(app);

    await bootstrap();

    expect(create).toHaveBeenCalledWith(AppModule);
    expect(appGetConfig).toHaveBeenCalledWith(ConfigService);
    expect(appGet).toHaveBeenCalledWith('PORT');
    expect(appEnableShutdownHooks).toHaveBeenCalled();
    expect(appListen).toHaveBeenCalledWith(4321);
  });
});
