# L08 — Schema relations, migrations & seed

|                |                                                                                                                                                                                                                         |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase**      | 2 — Working with Data                                                                                                                                                                                                   |
| **Linear**     | NES-90 (theory, child of NES-9) · sibling: NES-91 (hands-on, learner-owned, pending) · NES-93 (review/quiz, pending) · NES-121 (corrective for PR #91, see callout below)                                               |
| **Branch**     | `duongthehien2001/nes-90-theory-note`                                                                                                                                                                                   |
| **Main docs**  | [/recipes/prisma](https://docs.nestjs.com/recipes/prisma) · [Prisma — Relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations) · [Prisma — Migrate](https://www.prisma.io/docs/orm/prisma-migrate) |
| **Study date** | 2026-08-27                                                                                                                                                                                                              |

---

> ⚠️ **Update 2026-08-27 (NES-121, corrective — read before the original content below):** This note was written initially (PR #92) when the theory (NES-90) had just finished and there was **no** execution-substitute for L08 yet. Shortly after, PR #91 (Fixes NES-9, merged `2d59255`) **actually applied** `prisma/schema.prisma` (4 relational models), migration `prisma/migrations/20260827100000_add_user_project_task_comment_relations`, `prisma/seed.ts`, and the related DTO/service in `src/tasks/**` — under an **execution substitute approved by the user for this round (2026-08-27)**. This is **not evidence that Hien Duong did NES-91 by hand** — the Definition of Done for NES-91/NES-93 (real hands-on + self-answered quiz) is still unmet, so `docs/ROADMAP.md` keeps L08 at 🟦, not ✅. PR #91 itself disclosed clearly: verifying with a live PostgreSQL (`migrate dev`/seed/relational e2e) is **SKIPPED/UNVERIFIED** — still true at the time this note was updated (Docker has never run for the relational part). The `🗂 File map`, `💻 Annotated examples`, and `🛠 Hands-on` sections below have been updated to match: they no longer describe these files as "not yet applied" — they already exist on disk; what remains for NES-91 is for the learner to run migrate/seed against their own live Postgres and re-read/re-type the schema to memorize the syntax (not create files from scratch). The `✅ Review & Quiz` section intentionally **has no answers filled in** — no agent answers on behalf of the learner.
>
> **Sources verified 2026-08-27 (unchanged):** some `prisma.io/docs` URLs now return next-generation preview content (e.g. the top-level `relations` page and the `workflows/development-and-production` page mention `db migrate`, "contract spaces", `@@discriminator`/`@@base`, and incorrectly claim implicit many-to-many is "not yet supported"). This repo pins `prisma@6.19.3` / `@prisma/client@6.19.3` — the "classic" stable release. The note below follows stable 6.x behavior, cross-checked via the [CLI reference](https://www.prisma.io/docs/orm/reference/prisma-cli-reference) and the dedicated [many-to-many-relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/many-to-many-relations) page — preview content was not used.
>
> ⚠️ **Update 2026-08-28 (NES-122, follow-up for 6 findings from PR #93 review):** fixed 6 post-merge gaps from PR #93 — (1) `rejectBooleanId` (`src/tasks/dto/reject-boolean-id.transform.ts`) now also leaves array input untouched (`Array.isArray`) instead of letting `Number(['5'])` coerce a single-element array to the scalar `5` and slip past `@IsInt()`, with unit test + DTO test (`create-task.dto.spec.ts`) + new e2e regression; (2) the Postgres readiness command in Hands-on was fixed from `docker compose exec db` → `docker compose exec postgres` to match `docker-compose.yml`; (3)/(4) Hands-on and Example 2 now clarify: `migrate dev` on Prisma 6 does **not** automatically seed when the DB already exists (it only auto-seeds when it just created or reset the database), so the first explicit seed run is **the first explicit call**, and the seed race-condition only occurs when **two processes run simultaneously with the same name** `"Demo Project"` — not when you run them sequentially yourself; (5) Example 1 (`model Task`) now includes the `completed Boolean @default(false)` field to match the applied schema exactly. **Editing these docs/code files did not start Docker/PostgreSQL** — all claims about migrate/seed/readiness behavior remain in read-and-understand form cross-checked against Prisma source/docs, **not tested against a live DB** (SKIPPED/UNVERIFIED, same as previous callouts). (6) **Not yet mirrored to `example/nestjs-training` (EN) / GitLab in this PR** — per NES-122's scope, mirroring L08 (PR #91/#92/#93 + NES-122 fixes) to English/GitLab was **intentionally left as a separate follow-up**, requiring a dedicated mirror task/PR before L08 is considered fully bilingual.

---

## 🗂 File map for this lesson

> **NES-121 update:** `prisma/schema.prisma` **now has** 5 models (`User`/`Project`/`ProjectMember`/`Task`/`Comment` + relations), the corresponding migration, and `prisma/seed.ts` — applied via PR #91 under an execution substitute approved by the user for this round, **not typed by Hien Duong during NES-91**. What is still missing — and is truly NES-91's work: (1) re-reading and re-typing the schema yourself to internalize the syntax (comparing against the existing file), (2) running that migration/seed against your own **live** Postgres for the first time — this has never happened (Docker has never run for the relational part), so it is still **SKIPPED/UNVERIFIED**.

| File                                                                        | Role                                                                     | Created in lesson                             | Status                                        |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------- | --------------------------------------------- |
| `prisma/schema.prisma`                                                      | `User`/`Project`/`ProjectMember`/`Task`/`Comment` models + relations     | L08 (PR #91)                                  | **Applied** — not yet migrated to any live DB |
| `prisma/migrations/20260827100000_add_user_project_task_comment_relations/` | Migration file for the relational schema                                 | L08 (PR #91)                                  | **On disk** — SKIPPED/UNVERIFIED against DB   |
| `prisma/seed.ts`                                                            | Idempotent seed script (`upsert`/`findOrCreate`) for all 5 models        | L08 (PR #91)                                  | **On disk** — never executed (needs Postgres) |
| `src/tasks/tasks.service.ts`, `src/tasks/dto/*`                             | `select` to narrow Task response, DTO validates `projectId`/`assigneeId` | L07 (flat) → L08 (PR #91, patched in NES-121) | Applied                                       |

---

## 🎯 Goals

- [ ] Design a Prisma schema for 4 models `User` / `Project` / `Task` / `Comment` with correct cardinality and correct FK ownership (`@relation(fields, references)`)
- [ ] Distinguish between a **relation field** (virtual, Prisma Client only) and a **relation scalar field** (real FK column in the DB)
- [ ] Explain the difference between `prisma migrate dev` (dev, uses shadow database) and `prisma migrate deploy` (CI/production, no shadow database, non-interactive)
- [ ] Write (in NES-91) a seed script that can be run multiple times without creating duplicate data (idempotent via `upsert`)
- [ ] Understand how adding relations changes DTOs and the service: `connect` vs nested `create`, `include`/`select` to avoid N+1

## 📚 Theory

### Concept 1: Relation field vs relation scalar field

**Problem it solves:** In a Prisma schema, a relation is always represented by **two different kinds of fields**, and newcomers often confuse them.

- **Relation scalar field**: a real column in the table (e.g. `authorId Int`) — this is the actual foreign key (FK) that exists in PostgreSQL.
- **Relation field**: a field typed as a model (e.g. `author User @relation(fields: [authorId], references: [id])`) — **does not exist as a column in the DB**; it is just the "path" Prisma Client uses to know how to `include`/`select` related data at query time. The "many" side (e.g. `Task` pointing to `Project`) has both a relation field and a relation scalar field; the "one" side (e.g. `Project` with `tasks Task[]`) has only the virtual relation field, with no corresponding column.

**How Prisma does it:** The `@relation(fields: [...], references: [...])` attribute sits on **whichever side holds the FK** — that is also the "owner" of the relation in DB terms. The other side only declares a virtual field typed as `Model` or `Model[]`, without `@relation(fields: ...)`.

**When NOT to use:** You don't need to manually add an `xxxId` column if you have already declared the correct `@relation` — Prisma generates the migration that creates that column. Adding it manually risks a name mismatch with what Prisma generates.

> 📖 Source: [Prisma — Relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations)

---

### Concept 2: Cardinality — 1-1, 1-n, n-n (implicit vs explicit)

**Problem it solves:** The Task Management API needs exactly 3 relationship types, and choosing the wrong one (especially for n-n) means rewriting a migration later.

- **1-n (one-to-many)**: the most common in this domain. `Project` 1 — n `Task` (one project has many tasks, one task belongs to one project). The FK (`projectId`) lives on the "many" model (`Task`).
- **1-1 (one-to-one)**: the FK can sit on either side, but **must have `@unique`** on that field — that is the differentiator between 1-1 and 1-n (without `@unique`, Prisma interprets it as 1-n). The current domain doesn't need 1-1, but the classic example is `User` 1-1 `Profile`.
- **n-n (many-to-many)**: `Project` n — n `User` (one project has many members, one user joins many projects). Prisma supports 2 approaches:
  - **Implicit m-n** (Prisma creates a hidden join table): just declare `members User[]` on `Project` and `projects Project[]` on `User`, no intermediate model needed. Simple, but **cannot add extra fields** (e.g. a member's role in the project) to the join table.
  - **Explicit m-n** (write your own join model): required when you need extra fields on the relation, when you need to set `onDelete`/`onUpdate` independently, or when the model has no simple `@id`. This is the choice for `ProjectMember` in the illustrative schema below, because we need to store `role` (OWNER/MEMBER) per member.

**How Prisma does it:** Implicit m-n is **fully supported** in the stable release (re-verified via the dedicated many-to-many-relations page — some Prisma preview pages incorrectly state it is "not yet supported", see the source warning at the top of this note).

**When NOT to use implicit m-n:** As soon as you need to store data _about the relation itself_ (e.g. join date, role) — that is when you must switch to an explicit join model with `@@id([projectId, userId])`.

> 📖 Source: [Prisma — Many-to-many relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/many-to-many-relations)

---

### Concept 3: Referential actions (`onDelete` / `onUpdate`)

**Problem it solves:** When a parent record is deleted/updated, what should happen to child records that reference it? This is a business decision, not a minor technical detail.

- `Cascade`: delete/update the parent and the children follow. Use when children **have no meaning without the parent** — e.g. `Comment` depends on `Task`: deleting a `Task` also deletes all its `Comment`s.
- `Restrict`: prevent deleting the parent if children still reference it. Use when accidentally deleting the parent would silently lose important data — e.g. don't allow deleting a `User` who still owns a `Project`.
- `SetNull`: deleting the parent sets the FK on the child to `NULL` — only valid when that FK is **optional** (`Int?`). Use for "assigned to" relationships rather than "owned by" — e.g. deleting the `User` who is the assignee of a `Task` doesn't lose the `Task`, it just clears the assignee (`assigneeId` becomes `null`).
- `NoAction` / `SetDefault`: less common in this simple domain.
- **Default when not declared:** optional relation → `onDelete: SetNull`; required relation → `onDelete: Restrict`. `onUpdate: Cascade` is the default for both.

**How Prisma does it:** Declare directly in `@relation(..., onDelete: Cascade, onUpdate: Cascade)`.

**When NOT to use `Cascade` carelessly:** `Cascade` on an "owned-by" relation (`User` → `Project`) is dangerous — accidentally deleting a user would silently delete all their projects. That is why this domain chooses `Restrict` for `Project.owner`, not `Cascade`.

> 📖 Source: [Prisma — Referential actions](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/referential-actions)

---

### Concept 4: Prisma Migrate — `dev` vs `deploy` vs `reset` vs `status`

**Problem it solves:** "I edited `schema.prisma` — now what?" Prisma Migrate is the bridge between the schema (declaration) and the real DB (state), and **dev / production use different commands intentionally**, not arbitrarily.

- **`prisma migrate dev`** (local/dev only):
  1. Compares the current schema against migration history using a **shadow database** (a temporary DB Prisma creates and destroys) to detect _schema drift_ (the real DB was edited by hand and no longer matches migration history).
  2. Generates a new migration SQL file under `prisma/migrations/<timestamp>_<name>/migration.sql`.
  3. Applies that migration to the dev DB.
  4. Re-runs `prisma generate` (new Prisma Client matching the schema).
  5. **Automatically runs the seed script** if configured (see Concept 5) — **but only when this particular run just created or reset the database**; if the DB already existed and this step only applied a pending migration, `migrate dev` does **not** auto-seed.
  6. If it detects a potentially destructive change (e.g. column type change) or drift, it **prompts for confirmation** before resetting the DB — cannot run unattended in CI.
- **`prisma migrate deploy`** (CI/production): only **applies existing migration files on disk**, in order, **without** a shadow database, **without** generating new files, **without** prompting — safe to run non-interactively in pipelines.
- **`prisma migrate reset`** (dev only): wipes the DB, recreates it from scratch, applies the full migration history + seed. Use when you want to "start over" on your dev machine — **never** run in production.
- **`prisma migrate status`**: compares migration history on disk with the `_prisma_migrations` table in the DB, reports which migrations are pending.

**How Nest does it:** NestJS has no migration command of its own — `PrismaService` (already set up in L07) only handles the connection/lifecycle; migrations are a Prisma CLI concern, run independently from `pnpm start:dev`.

**When NOT to use `migrate dev` in production:** Never — it needs a shadow database (usually no permission to create a temporary DB in production) and may prompt interactively, hanging a CI pipeline.

> 📖 Source: [Prisma — Migrate overview](https://www.prisma.io/docs/orm/prisma-migrate) · [CLI reference](https://www.prisma.io/docs/orm/reference/prisma-cli-reference)

---

### Concept 5: Seed script & idempotency

**Problem it solves:** After `migrate dev`/`migrate reset`, the DB is empty — you need sample data to test manually (Postman) without creating every record by hand, and **running it multiple times must not duplicate data**.

- **Configuration:** declare `"prisma": { "seed": "ts-node prisma/seed.ts" }` in `package.json` (the repo already has `ts-node` in devDependencies) or in `prisma.config.ts` in newer versions. With this config, `prisma db seed` runs the seed manually at any time; **auto-seed rules differ between the two migrate commands:** `migrate reset` **always** auto-seeds after migrating (consistent with its "start over" nature), while `migrate dev` **only** auto-seeds when that particular run just **created or reset** the database — if the DB already existed and the command only applied pending migrations, it does **not** auto-seed (see Concept 4, step 5, and Hands-on steps 4/5).
- **Note for Prisma 6 (repo pins `6.19.3`):** the `package.json#prisma` key is **deprecated** — every `prisma migrate`/`validate`/`generate` call prints `warn The configuration property package.json#prisma is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file`. The repo keeps this approach because it still works correctly in 6.19.3 (self-verified during NES-121 by running `prisma validate`); it is a warning, not an error — no need to switch to `prisma.config.ts` in this lesson.
- **Idempotent via `upsert`:** for models with a natural `@unique` field (e.g. `User.email`), use `prisma.user.upsert({ where: { email }, update: {}, create: {...} })` — running it any number of times results in exactly 1 record per email.
- **Models without a natural unique field** (e.g. `Task`, `Comment` — duplicate titles are valid domain-wise): two options, each with a trade-off:
  1. Assign a fixed `id` in the seed and `upsert` by `id` — truly idempotent, but "fake" ids mixed with real app-generated ids can be confusing.
  2. `deleteMany()` the entire table then `createMany()` again — simple, safe for dev-only seeds, but **not strictly idempotent** (it's "reset and recreate", not "skip if already present") and must never run in production.

**How Nest does it:** Not related to NestJS — seeding is a Prisma CLI feature, independent of the Nest application.

**When NOT to seed with `deleteMany` + `createMany`:** When the seed script could accidentally run against a DB with real data (production/staging) — then you must use `upsert` by unique field, deleting nothing.

> 📖 Source: [Prisma — Seeding](https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding)

---

### Concept 6: How relations change DTOs and the service

**Problem it solves:** When `Task` gains `projectId`/`assigneeId`, the existing `TasksService` (flat, L07) is no longer sufficient — you need to know 2 new Prisma Client techniques for working with relations.

- **Writing related data — `connect` vs nested `create`:**
  - `connect`: attach to an **already existing** record, e.g. create a new `Task` for an existing `Project`: `prisma.task.create({ data: { title, project: { connect: { id: projectId } } } })`.
  - Nested `create`: create parent and child **at the same time**, e.g. create a `Project` together with its first `ProjectMember` (owner): `data: { name, owner: { connect: { id: ownerId } }, members: { create: [{ userId: ownerId, role: 'OWNER' }] } }`.
- **Reading related data — `include` / `select`:** `prisma.project.findUnique({ where: { id }, include: { tasks: true, members: { include: { user: true } } } })` — Prisma translates this into a JOIN (or multiple grouped queries, depending on the engine), **avoiding N+1** as long as you use `include`/`select` instead of manually looping and calling `findUnique` per task.
- **Impact on DTOs:** if the API allows creating a `Project` along with its member list in one request, `CreateProjectDto` needs a nested DTO (`@ValidateNested()` + `@Type(() => AddMemberDto)` from `class-validator`/`class-transformer`) to validate each array element.

**When NOT to use nested writes/nested DTOs:** For beginners, nested writes easily make DTOs bloated with unnecessary complexity. The MVP should split into separate endpoints per resource (`POST /projects` then `POST /projects/:id/members`) — one responsibility per endpoint, easier to test and validate — only consolidate into nested writes when there is a clear UX reason (e.g. a single-step project creation form).

> 📖 Source: [Prisma Client — Relation queries](https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries) · [NestJS — Prisma recipe](https://docs.nestjs.com/recipes/prisma)

---

## 🔗 Prior knowledge connections

| Prior knowledge                                                                                                | Equivalent in NestJS + Prisma                                                                                                                                 | Key difference                                                                                                                                                                                                            |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Express + Prisma: declare relations in `schema.prisma`, call `prisma.model.include` directly in route handlers | Same `schema.prisma`, same `include`/`connect` API — Prisma doesn't change based on the framework                                                             | The difference is **where** relation queries live: route handler (Express) → `*.service.ts` (Nest). A Nest controller only calls the service; it doesn't query Prisma directly — business logic stays out of controllers. |
| Sequelize/TypeORM: declare relations via decorators (`@ManyToMany`, `@HasMany`) on entity classes              | Prisma declares relations in a separate `schema.prisma` file, not decorators on TS classes                                                                    | Prisma completely separates the schema from TypeScript code — the schema is the source of truth, `PrismaClient` is code **generated from** the schema, not hand-written entity classes.                                   |
| Raw SQL: write `JOIN` yourself to get a Task with its Project/Comments                                         | `include`/`select` in Prisma Client                                                                                                                           | Prisma generates optimized JOINs/multiple queries for you — but you still have to choose the right fields (`select`) to avoid over-fetching, exactly like the `SELECT *` anti-pattern in raw SQL.                         |
| Hexagonal: repository returns a domain entity, doesn't leak ORM details outside the domain layer               | Prisma Client's `include`/`select` shape **is infrastructure detail** — shouldn't be returned directly to the controller/response DTO without a mapping layer | At Phase 5+ (OpenAPI/serialization), you'll need a response DTO separate from the Prisma model — L08 stops at the schema layer, not yet at that step.                                                                     |

**Things I used to misunderstand:** _(leave blank — this is Hien Duong's section to fill after completing NES-91 hands-on, not something an agent fills in)._

---

## 💻 Annotated examples

> ⚠️ **NES-121 update:** the code in this section **has already been applied to the repo via PR #91** (execution substitute, not typed by Hien Duong) — `prisma/schema.prisma`, the migration, and `prisma/seed.ts` match these two examples almost exactly (one intentional difference is noted right under Example 1: `Task.project`/`projectId` is kept **optional**, not required as in the original example). The real work for NES-91 is not "create files from scratch" but re-reading/re-typing to internalize the syntax, then running migrate/seed against your own live Postgres — that step is still **SKIPPED/UNVERIFIED**.

### Example 1: Full relational schema for the Task Management API

```prisma
// prisma/schema.prisma — applied via PR #91, with 1 intentional difference:
// Task.project/projectId is optional (Project?/Int?, onDelete: SetNull), not
// required (Project, onDelete: Cascade) as shown below — see "Explanation" underneath.

enum ProjectRole {
  OWNER
  MEMBER
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
}

model User {
  id          Int            @id @default(autoincrement())
  email       String         @unique
  name        String
  password    String
  ownedProjects   Project[]      @relation("ProjectOwner")
  memberships     ProjectMember[]
  assignedTasks   Task[]         @relation("TaskAssignee")
  comments        Comment[]
  createdAt   DateTime       @default(now())
}

model Project {
  id          Int             @id @default(autoincrement())
  name        String
  description String?
  owner       User            @relation("ProjectOwner", fields: [ownerId], references: [id], onDelete: Restrict)
  ownerId     Int
  members     ProjectMember[]
  tasks       Task[]
  createdAt   DateTime        @default(now())
}

// Explicit m-n: needs the extra "role" field, so implicit m-n is not used
model ProjectMember {
  project   Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId Int
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    Int
  role      ProjectRole @default(MEMBER)
  joinedAt  DateTime    @default(now())

  @@id([projectId, userId])
}

model Task {
  id          Int          @id @default(autoincrement())
  title       String
  completed   Boolean      @default(false)
  description String?
  status      TaskStatus   @default(TODO)
  priority    TaskPriority @default(MEDIUM)
  dueDate     DateTime?
  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId   Int
  assignee    User?        @relation("TaskAssignee", fields: [assigneeId], references: [id], onDelete: SetNull)
  assigneeId  Int?
  comments    Comment[]
  createdAt   DateTime     @default(now())
}

model Comment {
  id        Int      @id @default(autoincrement())
  content   String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  taskId    Int
  author    User     @relation(fields: [authorId], references: [id], onDelete: Restrict)
  authorId  Int
  createdAt DateTime @default(now())
}
```

**Explanation:**

- `Project.owner` uses `onDelete: Restrict` (Concept 3): prevents deleting a `User` who still owns a `Project` — ownership must be transferred or the project deleted first.
- `ProjectMember` is an explicit m-n (Concept 2) because we need to store `role`; `@@id([projectId, userId])` is a composite primary key ensuring a user can't join the same project twice.
- `ProjectMember.project`/`.user` use `Cascade`: deleting a `Project` or a `User` also removes the corresponding membership row — sensible because a `ProjectMember` has no meaning without both sides.
- `Task.assignee` is optional (`User?`) with `SetNull`: deleting the assignee doesn't delete the `Task`, it just clears the assignee field (Concept 3).
- `Task.project` **in theory** should be required (`Project`, not `Project?`) with `Cascade` — a `Task` has no meaning without a `Project`. But **the schema applied in the repo intentionally diverges from this theory**: `projectId`/`assigneeId` are kept optional (`Project?`/`Int?`, `onDelete: SetNull`) so that `CreateTaskDto` sending only `title` (the CRUD contract from L07) remains valid — see the comment above `model Task` in `prisma/schema.prisma`. This is an intentionally relaxed relation scalar field, not a bug.
- `Comment.author` uses `Restrict` instead of `Cascade` — a deliberate decision: retaining comment history even when an author's account is deactivated is common behavior in real task-management apps; this is a question worth raising in NES-93 (see Quiz question 4).
- Two relations pointing to the same model `User` from `Project` and `Task` (`owner` and `assignee`) require **explicit relation names** (`@relation("ProjectOwner", ...)`, `@relation("TaskAssignee", ...)`) because Prisma cannot infer which `User` field corresponds to which — without the names Prisma reports an ambiguous relation error.

> 📖 Based on: [Prisma — Relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations), domain taken from the Task Management API description at the top of `docs/ROADMAP.md`

### Example 2: Idempotent seed script

```ts
// Condensed example for readability. The real `prisma/seed.ts` (applied via PR #91)
// covers all 5 models and uses findFirst-then-create for Project/Task/Comment
// instead of upsert by fixed id — see "Explanation" below.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      email: 'owner@example.com',
      name: 'Project Owner',
      password: 'seed-only-not-real-hash',
    },
  });

  const project = await prisma.project.upsert({
    where: { id: 1 }, // Project has no natural unique field other than id in this illustration
    update: {},
    create: {
      id: 1,
      name: 'Demo Project',
      ownerId: owner.id,
      members: { create: [{ userId: owner.id, role: 'OWNER' }] },
    },
  });

  console.log({ owner: owner.email, project: project.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Explanation:**

- `user.upsert` by `email` (a real unique field) — truly idempotent.
- `project.upsert` by a fixed `id` is the trade-off discussed in Concept 5 (Project has no natural unique field in this illustrative design) — running it multiple times doesn't create duplicate projects, but id `1` is a fixed assumption; be careful if the real app also auto-increments project ids from 1.
- The nested `create` for `members` only runs in the `create` branch, not in `update: {}` — meaning a second seed run will **not** re-add `ProjectMember`, which is the intended idempotent behavior.
- **The real `prisma/seed.ts` (PR #91) uses a different approach for `Project`/`Task`/`Comment`:** `findFirst` by a near-unique field combination (`name` for Project, `{title, projectId}` for Task, `{content, taskId}` for Comment) and only `create` if not found, instead of `upsert` by fixed id — avoids assuming an id, but the flip side: `Project.name` has **no `@unique`** in the schema, so **two seed processes running concurrently and both looking for/creating the same project name** (e.g. both seeding `"Demo Project"` at the same time) could create duplicates — running sequentially (one run, then another, not simultaneously) or using distinct project names avoids this race. This is the known seed-collision bug, **intentionally not fixed in NES-121** (see ROADMAP callout), left as a separate follow-up.

> 📖 Based on: [Prisma — Seeding](https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding)

---

## 🛠 Hands-on

<!-- YOU do this part (NES-91). The agent does not do it for you — the schema/migration/seed below already exist on disk via PR #91 (execution substitute, read the callout at the top); the real NES-91 work is re-reading/re-typing to understand + running against your own live Postgres, not creating the files from scratch. -->

**Requirements (per NES-9 / NES-91) — updated for NES-121, since the files already exist in the repo:**

> ⚠️ **NES-122 (follow-up from PR #93 review):** step 1 below corrects the Compose service name (`docker-compose.yml` declares `postgres`, not `db`) — the old wording caused `docker compose exec db ...` to exit with `no such service: db`. Editing this doc does **not** start Docker/PostgreSQL — the readiness command and the full migrate/seed flow below remain **SKIPPED/UNVERIFIED** in the environment where the doc was edited (NES-122 worktree), same as disclosed in the callouts at the top. Only the command syntax was fixed to match `docker-compose.yml`; runtime behavior awaits the learner's own hands-on run.

1. Start Postgres **first** and wait until it accepts connections — every Prisma command below needs a live DB:
   ```bash
   docker compose up -d
   docker compose exec postgres pg_isready -U postgres   # repeat until you see "accepting connections"
   ```
2. Read `prisma/schema.prisma` (already has 5 models from PR #91) — **re-type it on a scratch file**, no copy-paste, to internalize the `@relation` syntax; then compare against the real file. Pay special attention to the comment above `model Task`: why are `projectId`/`assigneeId` optional instead of required as in Example 1 (see "Explanation" above).
3. Run `pnpm exec prisma migrate status` to confirm: migration `20260827100000_add_user_project_task_comment_relations` is on disk (from PR #91) but has **never been applied to your local DB** (Docker has never run for this part).
4. Run `pnpm exec prisma migrate dev` — since the schema already matches the existing migration, Prisma will only **apply the pending migration to your DB** (no new file is generated). **Prisma 6 note:** `migrate dev` only auto-seeds when that particular run just created or reset the database — your DB already existed from L07, so this step applies the migration and **may or may not** auto-seed; read the output carefully to determine whether seeding ran, don't assume it did.
5. Because step 4 doesn't guarantee seeding, explicitly run `pnpm exec prisma db seed` — this is **the first explicit run**, regardless of whether step 4 auto-seeded. Read through `prisma/seed.ts` — note it uses `findFirst`-then-`create` for `Project`/`Task`/`Comment` (not `upsert` by fixed id as in Example 2). Then run `pnpm exec prisma db seed` **a second time** (use `prisma studio` or `psql` to count `Project`/`Task`/`Comment` rows before/after) to self-verify idempotency: running sequentially (not concurrently) means the second run must **not** create any additional rows, because `findFirst` on the second run already sees the data created by the first.

**How to verify:**

```bash
pnpm exec prisma migrate status
pnpm exec prisma studio            # visually inspect the migrated/seeded data
```

**Troubleshooting:**

- If `prisma migrate dev` reports drift or asks to reset the DB: read the message carefully before agreeing — reset will **wipe all current dev data**.
- If seed doesn't auto-run after `migrate dev`: **first determine whether that `migrate dev` run just created or reset the DB** — if the DB already existed and the command only applied pending migrations, **not auto-seeding is correct behavior** (see Concepts 4/5), not a config bug. Only if that run **actually** just created or reset the DB and seeding still didn't happen should you check whether `package.json` has the `"prisma": { "seed": "ts-node prisma/seed.ts" }` key (it does, but it's deprecated in Prisma 6 — see Concept 5, it's a warning not an error).
- If you get an ambiguous relation error (Prisma asks for a `@relation("...")` name) when 2 fields point to the same model: re-read the "Explanation" in Example 1 — this is a very common error when you have 2 relations pointing to the same `User`.
- Running **sequentially** as described in step 5 (finish run one before starting run two) will **not** produce two `"Demo Project"` entries — the second run always finds the project created by the first via `findFirst`. The known seed-collision bug only occurs when **two `prisma db seed` processes run concurrently (race condition)**, both do `findFirst` for `"Demo Project"` before either one's `create` has committed — both see "not found" and both create, producing two rows with the same name because `Project.name` has no `@unique` to prevent it. If you run sequentially by hand and still see duplicates, that is a **real bug to report**, not this known issue; the known bug is **intentionally unfixed** in NES-121 (see ROADMAP L08 callout), reserved as a separate follow-up.

---

## ✅ Review & Quiz

<!-- Fill in after the /lesson-review step (NES-93). No answers here yet — as required: don't claim the quiz is complete. -->

1. **Q:** Why does `Project.tasks` (type `Task[]`) not need `@relation(fields: ...)` while `Task.project` (type `Project`) does?
   **A:** _(not answered yet — to be done in NES-93)_

2. **Q:** If you changed `ProjectMember` from explicit m-n to implicit m-n (`members User[]` / `projects Project[]` directly), what capability would you lose?
   **A:** _(not answered yet — to be done in NES-93)_

3. **Q:** Why does `pnpm exec prisma migrate deploy` not prompt for any confirmation while `migrate dev` does?
   **A:** _(not answered yet — to be done in NES-93)_

4. **Q:** Example 1 chooses `Restrict` for `Comment.author` instead of `Cascade`. If you switched to `Cascade`, what would be the business consequence? Which choice do you think is right for a real task-management app?
   **A:** _(not answered yet — to be done in NES-93)_

5. **Q:** The seed script in Example 2 uses `upsert` by a fixed `id` for `Project`. Name one alternative approach to achieve idempotency without assuming an id in advance.
   **A:** _(not answered yet — to be done in NES-93)_

**Review from previous lesson:** L07 wrapped `PrismaClient` into `PrismaService` (a provider that manages its lifecycle via `OnModuleInit`); L08 reuses that same `PrismaService`, just adding relations to the schema — no need to change how Prisma is initialized.

---

## 🧠 Key takeaways

1. Relation field (virtual) and relation scalar field (real FK column) are two different things — `@relation(fields, references)` always sits on the side that holds the real FK.
2. 1-1 needs `@unique` on the FK to distinguish it from 1-n; implicit m-n can only be used when the relation doesn't need extra fields.
3. `onDelete` defaults: `SetNull` for optional relations, `Restrict` for required ones — changing the default is a business decision, not a minor technical detail.
4. `migrate dev` (dev, shadow DB, may prompt) differs from `migrate deploy` (CI/prod, applies existing files only, non-interactive) — never run `migrate dev` in production.
5. Idempotent seed = `upsert` by a natural `@unique` field; without one, consciously choose between fixed id or `deleteMany` + recreate.
6. `include`/`select` instead of loop-and-query — this is how Prisma avoids N+1 when reading relational data.

---

## 📎 Sources

- [docs.nestjs.com/recipes/prisma](https://docs.nestjs.com/recipes/prisma)
- [Prisma — Relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations)
- [Prisma — Many-to-many relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/many-to-many-relations)
- [Prisma — Referential actions](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/referential-actions)
- [Prisma — Migrate overview](https://www.prisma.io/docs/orm/prisma-migrate)
- [Prisma — CLI reference](https://www.prisma.io/docs/orm/reference/prisma-cli-reference)
- [Prisma — Seeding](https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding)
- [Prisma — Relation queries](https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries)
