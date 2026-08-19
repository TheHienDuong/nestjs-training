import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('TasksController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('supports CRUD routes and decorator metadata', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Learn controllers' })
      .expect(201);

    const taskId = 1;
    expect(createResponse.body).toEqual({
      id: taskId,
      title: 'Learn controllers',
      completed: false,
    });

    await request(app.getHttpServer())
      .get('/tasks')
      .query({ completed: 'false' })
      .expect(200)
      .expect('Cache-Control', 'none')
      .expect((res) => expect(res.body).toHaveLength(1));

    await request(app.getHttpServer())
      .patch(`/tasks/${taskId}`)
      .send({ completed: true })
      .expect(200)
      .expect((res) =>
        expect(res.body).toEqual(expect.objectContaining({ completed: true })),
      );

    await request(app.getHttpServer())
      .get(`/tasks/${taskId}`)
      .expect(200)
      .expect((res) =>
        expect(res.body).toEqual(
          expect.objectContaining({ title: 'Learn controllers' }),
        ),
      );

    await request(app.getHttpServer()).delete(`/tasks/${taskId}`).expect(204);
    await request(app.getHttpServer()).get(`/tasks/${taskId}`).expect(404);
  });

  afterEach(async () => {
    await app.close();
  });
});
