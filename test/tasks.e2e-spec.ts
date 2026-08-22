import { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
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

  it('supports the complete in-memory CRUD flow', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Learn modules' })
      .expect(201);
    const task = createResponse.body as TaskResponse;
    expect(task).toEqual({ id: 1, title: 'Learn modules', completed: false });

    await request(app.getHttpServer())
      .get('/tasks')
      .expect(200)
      .expect('Cache-Control', 'no-store')
      .expect([task]);
    await request(app.getHttpServer())
      .get(`/tasks/${task.id}`)
      .expect(200)
      .expect(task);

    await request(app.getHttpServer())
      .patch(`/tasks/${task.id}`)
      .send({ title: 'Practice modules', completed: true })
      .expect(200)
      .expect({ id: 1, title: 'Practice modules', completed: true });
    await request(app.getHttpServer()).delete(`/tasks/${task.id}`).expect(204);
    await request(app.getHttpServer()).get(`/tasks/${task.id}`).expect(404);
  });
});
