import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
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

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect((res) => expect(res.body).toEqual([]));
  });

  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Hien', email: 'hien@example.com' })
      .expect(201)
      .expect((res) =>
        expect(res.body).toEqual(
          expect.objectContaining({
            id: 1,
            name: 'Hien',
            email: 'hien@example.com',
          }),
        ),
      );
  });

  afterEach(async () => {
    await app.close();
  });
});
