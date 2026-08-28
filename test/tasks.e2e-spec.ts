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
    // Task -> Project -> User in FK order so repeated e2e runs against a
    // persistent DB stay idempotent (Project.ownerId is onDelete: Restrict).
    await app.get(PrismaService).task.deleteMany();
    await app.get(PrismaService).project.deleteMany();
    await app.get(PrismaService).user.deleteMany();
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

  it('rejects boolean projectId/assigneeId instead of coercing them to 0/1', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Valid', projectId: true })
      .expect(400);
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Valid', assigneeId: false })
      .expect(400);

    const created = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Valid' })
      .expect(201);
    const task = created.body as TaskResponse;
    await request(app.getHttpServer())
      .patch(`/tasks/${task.id}`)
      .send({ projectId: true })
      .expect(400);
    await request(app.getHttpServer())
      .patch(`/tasks/${task.id}`)
      .send({ assigneeId: false })
      .expect(400);
  });

  it('rejects array projectId/assigneeId instead of coercing them to a scalar id', async () => {
    // Real, existing ids (not a made-up '5') so a regression that lets
    // `rejectBooleanId` coerce `['5']` -> `Number(['5'])` -> `5` would hit a
    // row that actually exists and succeed with 201 — not a false-positive
    // 400 from the unrelated P2003-foreign-key-not-found fallback path.
    const prisma = app.get(PrismaService);
    const owner = await prisma.user.create({
      data: {
        email: 'nes-123-owner@example.com',
        name: 'NES-123 Owner',
        password: 'irrelevant',
      },
    });
    const project = await prisma.project.create({
      data: { name: 'NES-123 Project', ownerId: owner.id },
    });

    const assertRejectedAsValidation = (response: {
      body: { message: unknown };
    }) => {
      expect(Array.isArray(response.body.message)).toBe(true);
    };

    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Valid', projectId: [String(project.id)] })
      .expect(400)
      .expect(assertRejectedAsValidation);
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Valid', assigneeId: [String(owner.id)] })
      .expect(400)
      .expect(assertRejectedAsValidation);

    const created = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Valid' })
      .expect(201);
    const task = created.body as TaskResponse;
    await request(app.getHttpServer())
      .patch(`/tasks/${task.id}`)
      .send({ projectId: [String(project.id)] })
      .expect(400)
      .expect(assertRejectedAsValidation);
    await request(app.getHttpServer())
      .patch(`/tasks/${task.id}`)
      .send({ assigneeId: [String(owner.id)] })
      .expect(400)
      .expect(assertRejectedAsValidation);
  });

  it('derives completed from status, and keeps completed as-is when status is omitted', async () => {
    const created = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Ship the feature', status: 'DONE' })
      .expect(201);
    const doneTask = created.body as TaskResponse;
    expect(doneTask.completed).toBe(true);

    const reopened = await request(app.getHttpServer())
      .patch(`/tasks/${doneTask.id}`)
      .send({ status: 'TODO' })
      .expect(200);
    expect((reopened.body as TaskResponse).completed).toBe(false);

    const untouched = await request(app.getHttpServer())
      .patch(`/tasks/${doneTask.id}`)
      .send({ completed: true })
      .expect(200);
    expect((untouched.body as TaskResponse).completed).toBe(true);
  });

  it('only exposes { id, title, completed } on the Task response', async () => {
    const created = await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Narrow response',
        description: 'internal detail',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
      })
      .expect(201);

    expect(Object.keys(created.body as object).sort()).toEqual([
      'completed',
      'id',
      'title',
    ]);
  });
});
