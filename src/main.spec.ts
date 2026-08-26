// [NES-7 · lesson 06] Test — ConfigService wiring in bootstrap.
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import { bootstrap } from './main';

jest.mock('./app.module', () => ({
  AppModule: class AppModule {},
}));

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockResolvedValue({
      get: jest.fn().mockReturnValue({ get: jest.fn().mockReturnValue(3000) }),
      listen: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

describe('bootstrap configuration wiring', () => {
  it('gets PORT from ConfigService after creating the Nest application', async () => {
    const configGet = jest.fn().mockReturnValue(4321);
    const configService = { get: configGet };
    const appGet = jest.fn().mockReturnValue(configService);
    const appListen = jest.fn().mockResolvedValue(undefined);
    const app = {
      get: appGet,
      listen: appListen,
    } as unknown as INestApplication;
    const create = jest.spyOn(NestFactory, 'create');
    create.mockResolvedValue(app);

    await bootstrap();

    expect(create).toHaveBeenCalledWith(AppModule);
    expect(appGet).toHaveBeenCalledWith(ConfigService);
    expect(configGet).toHaveBeenCalledWith('PORT');
    expect(appListen).toHaveBeenCalledWith(4321);
  });
});
