import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

interface TaskResponse {
  id: number;
  title: string;
  completed: boolean;
}

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

    const taskId = (createResponse.body as TaskResponse).id;
    expect(createResponse.body).toEqual({
      id: taskId,
      title: 'Learn controllers',
      completed: false,
    });

    await request(app.getHttpServer())
      .get('/tasks')
      .query({ completed: 'false' })
      .expect(200)
      .expect('Cache-Control', 'no-store')
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

  it('keeps ids unique after deletion and preserves identity on PATCH', async () => {
    const firstResponse = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'First task' })
      .expect(201);
    const secondResponse = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Second task' })
      .expect(201);

    const firstTask = firstResponse.body as TaskResponse;
    await request(app.getHttpServer())
      .delete(`/tasks/${firstTask.id}`)
      .expect(204);

    const replacementResponse = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Replacement task' })
      .expect(201);
    const secondTask = secondResponse.body as TaskResponse;
    const replacementTask = replacementResponse.body as TaskResponse;
    expect(replacementTask.id).toBeGreaterThan(secondTask.id);

    await request(app.getHttpServer())
      .patch(`/tasks/${secondTask.id}`)
      .send({ id: replacementTask.id, completed: true })
      .expect(200)
      .expect((res) => {
        const task = res.body as TaskResponse;
        expect(task.id).toBe(secondTask.id);
        expect(task.completed).toBe(true);
      });

    await request(app.getHttpServer())
      .get(`/tasks/${replacementTask.id}`)
      .expect(200);
  });

  afterEach(async () => {
    await app.close();
  });
});
