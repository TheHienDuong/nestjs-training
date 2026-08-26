import { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

interface TaskResponse {
  id: number;
  title: string;
  completed: boolean;
}

// [NES-8 · lesson 07] Reference — CRUD contract against PostgreSQL.
describe('TasksController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    await app.get(PrismaService).task.deleteMany();
  });

  afterEach(async () => {
    await app.close();
  });

  it('supports complete CRUD flow backed by PostgreSQL', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Learn Prisma' })
      .expect(201);
    const task = createResponse.body as TaskResponse;
    expect(task.title).toBe('Learn Prisma');
    expect(task.completed).toBe(false);

    await request(app.getHttpServer())
      .get('/tasks')
      .expect(200)
      .expect('Cache-Control', 'no-store')
      .expect([task]);
    await request(app.getHttpServer()).get(`/tasks/${task.id}`).expect(task);
    await request(app.getHttpServer())
      .patch(`/tasks/${task.id}`)
      .send({ title: 'Practice Prisma', completed: true })
      .expect({ ...task, title: 'Practice Prisma', completed: true });
    await request(app.getHttpServer()).delete(`/tasks/${task.id}`).expect(204);
    await request(app.getHttpServer()).get(`/tasks/${task.id}`).expect(404);
  });

  it('supports completed filtering', async () => {
    await request(app.getHttpServer()).post('/tasks').send({ title: 'Open' });
    const done = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Done' });
    await request(app.getHttpServer())
      .patch(`/tasks/${(done.body as TaskResponse).id}`)
      .send({ completed: true });

    await request(app.getHttpServer())
      .get('/tasks?completed=true')
      .expect(200)
      .expect((response) => {
        const tasks = response.body as TaskResponse[];
        expect(tasks).toHaveLength(1);
        expect(tasks[0]?.title).toBe('Done');
      });
  });

  it('rejects invalid task input', async () => {
    await request(app.getHttpServer()).post('/tasks').send({}).expect(400);
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: ' ' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Valid', hacker: true })
      .expect(400);
    await request(app.getHttpServer())
      .get('/tasks?completed=maybe')
      .expect(400);
    await request(app.getHttpServer()).get('/tasks/not-a-number').expect(400);
  });
});
