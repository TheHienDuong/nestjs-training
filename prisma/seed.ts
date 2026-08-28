// [NES-9 · lesson 08] Reference — idempotent sample data for the relational
// schema (User/Project/ProjectMember/Task/Comment). Safe to run repeatedly:
// every write is either an `upsert` keyed on a real unique field (User.email)
// or a `findFirst` existence check before `create`, so a second run never
// duplicates rows.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function upsertUser(email: string, name: string, password: string) {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, password },
  });
}

async function findOrCreateProject(
  name: string,
  ownerId: number,
  memberId: number,
) {
  const existing = await prisma.project.findFirst({ where: { name } });
  if (existing) {
    return existing;
  }
  return prisma.project.create({
    data: {
      name,
      description: 'Seed data for local development and manual API testing.',
      ownerId,
      members: {
        create: [
          { userId: ownerId, role: 'OWNER' },
          { userId: memberId, role: 'MEMBER' },
        ],
      },
    },
  });
}

async function findOrCreateTask(
  title: string,
  projectId: number,
  assigneeId: number,
  overrides: { completed?: boolean; status?: 'TODO' | 'IN_PROGRESS' | 'DONE' },
) {
  const existing = await prisma.task.findFirst({ where: { title, projectId } });
  if (existing) {
    return existing;
  }
  return prisma.task.create({
    data: {
      title,
      projectId,
      assigneeId,
      completed: overrides.completed ?? false,
      status: overrides.status ?? 'TODO',
      description: `Seed task: ${title}`,
    },
  });
}

async function findOrCreateComment(
  content: string,
  taskId: number,
  authorId: number,
) {
  const existing = await prisma.comment.findFirst({
    where: { content, taskId },
  });
  if (existing) {
    return existing;
  }
  return prisma.comment.create({ data: { content, taskId, authorId } });
}

async function main() {
  const owner = await upsertUser(
    'owner@example.com',
    'Project Owner',
    'seed-only-not-a-real-hash',
  );
  const member = await upsertUser(
    'member@example.com',
    'Project Member',
    'seed-only-not-a-real-hash',
  );

  const project = await findOrCreateProject(
    'Demo Project',
    owner.id,
    member.id,
  );

  const openTask = await findOrCreateTask(
    'Set up CI pipeline',
    project.id,
    owner.id,
    {
      status: 'IN_PROGRESS',
    },
  );
  const doneTask = await findOrCreateTask(
    'Write onboarding docs',
    project.id,
    member.id,
    { completed: true, status: 'DONE' },
  );

  await findOrCreateComment(
    'Kicking this off, will update the ticket.',
    openTask.id,
    member.id,
  );
  await findOrCreateComment(
    'Docs are ready for review.',
    doneTask.id,
    owner.id,
  );

  console.log({
    users: [owner.email, member.email],
    project: project.name,
    tasks: [openTask.title, doneTask.title],
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
