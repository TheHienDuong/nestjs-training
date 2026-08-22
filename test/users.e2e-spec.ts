import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => app.close());

  it('creates and lists users', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Hien', email: 'hien@example.com' })
      .expect(201)
      .expect({ id: 1, name: 'Hien', email: 'hien@example.com' });
    await request(app.getHttpServer()).get('/users').expect(200);
  });
});
