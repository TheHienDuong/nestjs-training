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
      .send({
        name: 'Hien',
        email: 'hien@example.com',
        password: 'should-not-leak',
      })
      .expect(201)
      .expect((response) => {
        expect(response.body).toEqual({
          id: 1,
          name: 'Hien',
          email: 'hien@example.com',
        });
        expect(response.body).not.toHaveProperty('password');
      });
    await request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect([{ id: 1, name: 'Hien', email: 'hien@example.com' }]);
  });
});
