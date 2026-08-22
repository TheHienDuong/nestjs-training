import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
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

  afterEach(async () => {
    await app.close();
  });

  it('supports CRUD routes', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Learn providers' })
      .expect(201);
    const task = createResponse.body as unknown as TaskResponse;

    expect(typeof task.id).toBe('number');
    expect(task.title).toBe('Learn providers');
    expect(task.completed).toBe(false);
    await request(app.getHttpServer())
      .get('/tasks')
      .query({ completed: 'false' })
      .expect(200)
      .expect('Cache-Control', 'no-store')
      .expect([task]);
    await request(app.getHttpServer())
      .get(`/tasks/${task.id}`)
      .expect(200)
      .expect(task);
    await request(app.getHttpServer())
      .patch(`/tasks/${task.id}`)
      .send({ id: task.id + 1000, completed: true })
      .expect(200)
      .expect((response) => {
        const body = response.body as unknown as TaskResponse;
        expect(body.id).toBe(task.id);
        expect(body.completed).toBe(true);
      });
    await request(app.getHttpServer()).delete(`/tasks/${task.id}`).expect(204);
    await request(app.getHttpServer()).get(`/tasks/${task.id}`).expect(404);
  });
});
