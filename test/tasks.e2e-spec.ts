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
      .send({})
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

  it('rejects a task without a title', async () => {
    const response = await request(app.getHttpServer())
      .post('/tasks')
      .send({})
      .expect(400);

    const responseBody = response.body as { message: unknown };
    expect(responseBody.message).toEqual(
      expect.arrayContaining([expect.stringContaining('title')]),
    );
  });

  it.each(['', '   '])('rejects a blank title: %j', async (title) => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title })
      .expect(400);
  });

  it('rejects a non-string title', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 123 })
      .expect(400);
  });

  it('rejects a title over the maximum length', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'x'.repeat(201) })
      .expect(400);
  });

  it('rejects unknown task fields', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Learn validation', hacker: true })
      .expect(400);
  });

  it('rejects a non-boolean completed value in a patch', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Learn validation' })
      .expect(201);
    const task = createResponse.body as TaskResponse;

    await request(app.getHttpServer())
      .patch(`/tasks/${task.id}`)
      .send({ completed: 'yes' })
      .expect(400);
  });

  it('rejects a blank title in a patch', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Learn validation' })
      .expect(201);
    const task = createResponse.body as TaskResponse;

    await request(app.getHttpServer())
      .patch(`/tasks/${task.id}`)
      .send({ title: '   ' })
      .expect(400);
  });

  it('rejects an unsupported completed query value', async () => {
    await request(app.getHttpServer())
      .get('/tasks?completed=maybe')
      .expect(400);
  });

  it('rejects a non-numeric task id', async () => {
    await request(app.getHttpServer()).get('/tasks/abc').expect(400);
  });
});
