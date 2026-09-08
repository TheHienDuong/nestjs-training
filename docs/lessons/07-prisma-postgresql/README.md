# L07 — Prisma + PostgreSQL: PrismaService

|               |                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------- |
| **Phase**     | 2 — Working with Data                                                                       |
| **Linear**    | NES-8 (sub-issue: NES-81 Theory & note)                                                     |
| **Branch**    | `codex/nes-8-l07-prisma-postgresql-prismaservice` (PR #87, reference implementation merged) |
| **Main docs** | [/recipes/prisma](https://docs.nestjs.com/recipes/prisma)                                   |
| **Date**      | 2026-08-26                                                                                  |

> 📝 **The entire Hands-on + Quiz section of this lesson was executed as a substitute** — not done personally by the learner as in the original scaffold. Read the disclaimer below before continuing — this declaration is in effect.

> ⚠️ **Disclaimer — execution substitute (2026-08-27):** The **🛠 Hands-on** section (NES-84: writing
> `PrismaService`/`PrismaModule`, `prisma/schema.prisma`, migrating `TasksService` to Prisma) was
> **executed as a substitute by Hermes/Codex** via PR #87 (`Fixes NES-8`, branch
> `codex/nes-8-l07-prisma-postgresql-prismaservice`, merge commit `5791085`). During local review,
> Claude Code found 1 P1 bug (race condition — calling `findOne()` then `update`/`delete` separately
> let Prisma `P2025` surface as a 500 instead of a 404) and **fixed it directly on PR #87**
> (commit `522bab5`, `fix(tasks): map Prisma P2025 to NotFoundException on update/remove`) before
> the PR was merged — meaning the final merged version went through one round of Claude edits,
> not just Codex. The **✅ Review & Quiz** section (NES-88) was **executed as a substitute by
> Claude Code** at closeout, based on re-reading the PR #87 diff and the original docs. Both fall
> under the **one-time user-approved exception (execution-substitute authorization, 2026-08-26/27)**
> — **NOT confirmation that Hien Duong personally coded the hands-on or answered the quiz**.
> To learn for real, redo the hands-on yourself and answer the quiz before reading below.
>
> ⚠️ **Live PostgreSQL: NOT verified, even though the code/CI evidence below is real.** PR #87
> reported "Docker was unavailable" — the migration `prisma/migrations/20260826162300_init` and
> e2e CRUD via a real Postgres **have never run**, neither locally nor on CI
> (`.github/workflows/ci.yml` still has the `postgres` service and E2E step commented out).
> All "evidence" below is **static/unit-level**: Prisma schema validation, ESLint, Prettier,
> `pnpm test` (Prisma mocked at the boundary), Nest build, and green CI — not an app that
> has actually performed CRUD against a live Postgres. Do not read the sections below as proof
> that the runtime has been verified; see "Definition of Done" for exactly which gates are still open.
>
> ⚠️ **Linear:** Linear MCP was unreachable during the closeout session — the issue numbers
> NES-84/NES-88 above follow the sub-issue convention for NES-8 as supplied by the user,
> and have **not been live-verified on Linear**. Updating Linear status (if needed) is a
> separate task outside the scope of this docs-only closeout.

---

> ⚠️ **English mirror note (2026-08-27):** This English file was started by `agy` (counter-view
> agent) on branch `agy/nes-8-l07-en-mirror` as the bilingual mirror required by `AGENTS.md`, then
> **completed by Claude Code** after `agy` exhausted its quota mid-mirror. The Vietnamese original
> is `docs/lessons/07-prisma-postgresql/README.md` on `main` (merged via PR #87, PR #88, and the
> closeout PR #89). All code files are byte-for-byte identical between both branches (verified
> against `origin/main`); only user-facing doc text differs (translated). This mirror was created
> after the VN closeout had already merged to `main`, not alongside it.

---

## 🗂 File map for this lesson

> The most accurate map + reading each file by line number: run `pnpm lesson 07` (after the
> `lesson/07` tag is cut — see "Definition of Done"). The table below reflects the real state
> on `main` after both PR #87 and PR #88 have merged — this is no longer a prospective list.

| File                                                                | Role (theory / ref / hands-on)                                                                   | Created in | Status                                                                                                                 |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| `docs/lessons/07-prisma-postgresql/README.md`                       | Theory + hands-on reference + quiz (this file)                                                   | L07        | ✅ Merged (PR #88, theory) + closed out in this step                                                                   |
| `prisma/schema.prisma`                                              | Minimal schema — `Task` model (no relations, no advanced migrations — that scope belongs to L08) | L07        | ✅ Merged (PR #87, execution substitute)                                                                               |
| `prisma/migrations/20260826162300_init/migration.sql`               | Migration `CREATE TABLE "Task"` generated from the schema above                                  | L07        | ✅ Merged file — **never applied against a real Postgres** (Docker waived)                                             |
| `src/prisma/prisma.service.ts`                                      | Provider wrapping `PrismaClient`, lifecycle hooks `onModuleInit`/`onModuleDestroy`               | L07        | ✅ Merged (PR #87, execution substitute)                                                                               |
| `src/prisma/prisma.module.ts`                                       | `@Global()` module exporting `PrismaService` for other feature modules to share                  | L07        | ✅ Merged (PR #87, execution substitute)                                                                               |
| `src/app.module.ts`                                                 | Updated — adds `PrismaModule` to `imports`                                                       | L01/L04    | ✅ Merged (PR #87, execution substitute)                                                                               |
| `src/main.ts`                                                       | Updated — adds `app.enableShutdownHooks()` so `onModuleDestroy` actually runs on shutdown        | L01        | ✅ Merged (PR #87, execution substitute)                                                                               |
| `src/config/env.validation.ts`                                      | Updated — adds `DATABASE_URL` (`@IsDefined @IsString @IsUrl`) to `EnvironmentVariables`          | L06        | ✅ Merged (PR #87, execution substitute)                                                                               |
| `src/tasks/tasks.service.ts`                                        | Updated — replaces in-memory array with `PrismaService` calls, CRUD async                        | L04        | ✅ Merged (PR #87, execution substitute; P1 fix `522bab5` after Claude review)                                         |
| `src/tasks/tasks.controller.ts`, `tasks.module.ts`                  | Updated — `async`/`Promise<Task>` throughout; `TasksModule` imports `PrismaModule`               | L04        | ✅ Merged (PR #87, execution substitute)                                                                               |
| `*.spec.ts` (env.validation, main, tasks.service, tasks.controller) | Tests — updated for `DATABASE_URL`, Prisma mock at boundary, P2025 error path                    | L04-L07    | ✅ Merged (PR #87, execution substitute)                                                                               |
| `test/tasks.e2e-spec.ts`, `test/setup-env.ts`                       | e2e — CRUD contract via real `PrismaService`; **requires live Postgres, never run**              | L02/L07    | ✅ Merged file — **never run against a real Postgres**                                                                 |
| `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`             | Added `@prisma/client@6.19.3`/`prisma@6.19.3`; `allowBuilds` enables Prisma postinstall on CI    | —          | ✅ Merged (PR #87; `pnpm-workspace.yaml` fix `3f75e42` added by Claude after CI failed with `ERR_PNPM_IGNORED_BUILDS`) |

---

## 🎯 Objectives

<!-- Copied verbatim from NES-8. Checked at closeout — see execution-substitute note below. -->

- [x] Wrap `PrismaClient` as an `@Injectable()` provider (`PrismaService`)
- [x] Use lifecycle hooks `onModuleInit`/`onModuleDestroy` to connect/disconnect at the right time
- [x] Inject `PrismaService` into `TasksService`, replacing in-memory storage with real queries

> Checked based on **execution-substitute evidence** (real code + green CI in PR #87) — **not**
> evidence that Hien Duong personally coded the hands-on, and **not** evidence of a successful
> connection to a live Postgres (see disclaimer at top of file + "Definition of Done").

## 📚 Theory

### Concept 1: `PrismaService` — wrapping `PrismaClient` as a provider

**Problem it solves:** With Express + Prisma (as you have done before), the most common approach is
to create a `db.ts`/`prisma.ts` file, instantiate `const prisma = new PrismaClient()` once, then
`export default prisma` so every route/controller can `import prisma from './db'`. This is a
**global singleton** — functionally correct, but it creates 3 problems as the app grows:

- Nobody manages its **lifecycle**: `prisma.$connect()` (usually automatic, implicit on the first
  query) and `prisma.$disconnect()` are not tied to any app event — you have to manually remember
  to call `$disconnect()` in the right place when shutting down.
- It **cannot be easily mocked** in unit tests — to test a service without touching the real DB you
  have to `jest.mock('./db')` at the module level, not via constructor injection.
- It violates the DI principle `AGENTS.md` explicitly states: _"do not import global singletons"_.

**How Nest does it:** Wrap `PrismaClient` into a class that implements `@Injectable()`, extending
(`extends`) `PrismaClient` so all query methods (`this.task.findMany()`, `this.user.create()`, ...)
are available on `this`, then let **Nest's DI container** manage the lifecycle and instance sharing
— exactly the same as wrapping any other provider from L03/L04, except this provider wraps an
external library rather than self-written domain logic.

```ts
// illustration — based on docs.nestjs.com/recipes/prisma, NOT yet applied to repo
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {}
```

**When NOT to use this wrapping pattern:** If you have a one-off script (seed, manual migration)
that does not live inside the Nest app lifecycle, using `PrismaClient` directly (without DI) is
perfectly valid — there is no "app" to inject into. Inside a real Nest app's request/response
cycle you should always go through the provider.

> 📖 Source: [docs.nestjs.com/recipes/prisma — Use Prisma Client in your NestJS services](https://docs.nestjs.com/recipes/prisma)

---

### Concept 2: Lifecycle hooks `onModuleInit` / `onModuleDestroy` — connecting/disconnecting at the right time

**Problem it solves:** `PrismaClient` needs an open TCP connection to Postgres. That connection
should be opened **after** Nest has finished building the DI container (don't open connections in
the constructor blindly before knowing whether the class will actually be used) and closed
**cleanly** when the app shuts down — abandoning a connection when the process is killed can leave
a "dangling" connection on the Postgres side.

**How Nest does it:** This is exactly why NestJS has [lifecycle
hooks](https://docs.nestjs.com/fundamentals/lifecycle-events) — interfaces a provider can implement
so Nest calls them at the right moment in the app lifecycle:

```ts
// illustration — based on docs.nestjs.com/recipes/prisma, NOT yet applied to repo
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
```

`onModuleInit()` is called by Nest right after all dependencies of the module containing
`PrismaService` have been resolved — exactly the right moment to open the DB connection.

**Common misconception — `onModuleDestroy` does NOT run automatically on Ctrl+C:** According to
[docs.nestjs.com/fundamentals/lifecycle-events#application-shutdown](https://docs.nestjs.com/fundamentals/lifecycle-events),
`onModuleDestroy()`, `beforeApplicationShutdown()` and `onApplicationShutdown()` are **only**
called by Nest when `app.close()` is explicitly called, **or** when the process receives a system
signal (like `SIGTERM`) — **and you have called `app.enableShutdownHooks()`** in `main.ts`
beforehand. By default, these shutdown hooks are **disabled** (reason: they add extra listeners
to `process`). This means if you only write:

```ts
// illustration — based on docs.nestjs.com/recipes/prisma, NOT yet applied to repo
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
```

...without adding `app.enableShutdownHooks()` to `src/main.ts`, `onModuleDestroy()` will **never
be called** when you stop `pnpm start:dev` with Ctrl+C (i.e., `SIGINT`) or when
Docker/Kubernetes sends `SIGTERM` on container restart — the Postgres connection is abandoned
abruptly instead of being closed cleanly. This is what **NES-8 wants you to observe yourself**
at the hands-on step (see 🛠 Hands-on below), not a conclusion stated here.

**When NOT to use `enableShutdownHooks()`:** Nest itself warns in the docs — if you run multiple
Nest apps inside the same Node process (e.g., running Jest tests in parallel), enabling
`enableShutdownHooks()` on every app may cause Node to warn about "too many listeners". For a
single-process learning app like this repo, it is not a concern.

> 📖 Source: [docs.nestjs.com/fundamentals/lifecycle-events](https://docs.nestjs.com/fundamentals/lifecycle-events), [docs.nestjs.com/recipes/prisma](https://docs.nestjs.com/recipes/prisma)

---

### Concept 3: Driver adapters in Prisma 7 — why today's setup differs from older tutorials

**Problem it solves:** This is not a "NestJS concept" but a major architectural change in Prisma
itself — important because it changes how `PrismaService` is written compared to older Prisma
tutorials (including many videos/blogs that are still widely referenced).

When reading the latest `docs.nestjs.com/recipes/prisma` directly (fetched today via `gh api`,
not from memory), the default generator in `schema.prisma` is no longer the old `prisma-client-js`
but rather:

```groovy
generator client {
  provider      = "prisma-client"
  output        = "../src/generated/prisma"
  moduleFormat  = "cjs"
}
```

And the recommended `PrismaService` now uses a **driver adapter** pattern (e.g.,
`@prisma/adapter-pg` for Postgres) passed to `super({ adapter })`:

```ts
// illustration of Prisma 7 approach — NOT what PR #87 uses (see callout below)
import { PrismaPg } from '@prisma/adapter-pg';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({ adapter: new PrismaPg() });
  }
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
```

This means there are now **two choices** when starting L07:

|                 | **Option A** — classic `prisma-client-js` (pin ≤ 6.x) | **Option B** — Prisma 7 + driver adapter                 |
| --------------- | ----------------------------------------------------- | -------------------------------------------------------- |
| `package.json`  | `@prisma/client@6.x`, `prisma@6.x`                    | `@prisma/client@7.x`, `prisma@7.x`, `@prisma/adapter-pg` |
| `schema.prisma` | `provider = "prisma-client-js"`                       | `provider = "prisma-client"` + `moduleFormat`            |
| `PrismaService` | `extends PrismaClient`, no `super({...})`             | `super({ adapter: new PrismaPg(...) })`                  |
| Tradeoff        | Simpler, compatible with all existing tutorials       | Future-proof, required from Prisma 7+ for SQL databases  |

> ⚠️ **What was actually installed (PR #87, execution substitute) — differs from both A and B
> described above:** the reference implementation pins `@prisma/client@6.19.3` and
> `prisma@6.19.3` (Option A semantics — classic generator, no driver adapter), pinned at a
> specific patch release rather than using `@latest`. Reason: at the time of execution
> `prisma@latest` resolved to the RC `8.0.0-rc.11`, and `@prisma/client@latest` resolved to
> the stable `7.10.0` — an unexpected version mismatch that would have required the driver
> adapter on top of an RC release. Pinning to `6.19.3` avoids the entire A/B decision while
> still meeting L07's learning objectives. If you redo the hands-on, the choice of version
> is yours.

> 📖 Source: [prisma.io/docs — supported databases](https://www.prisma.io/docs/orm/reference/supported-databases), [prisma.io/blog — Build a REST API with NestJS, Prisma 7, PostgreSQL and Swagger](https://www.prisma.io/blog/nestjs-prisma-rest-api-7D056s1BmOL0)

---

### Concept 4: `PrismaModule` — sharing one `PrismaService` instance across feature modules

**Problem it solves:** The same pattern from L03/L04 — when multiple feature modules
(`TasksModule`, `UsersModule`, `ProjectsModule` in the future) all need `PrismaService`, they
should all share the **same** singleton instance (one connection pool), not each create their own.

**How Nest does it:** Create a `PrismaModule` that declares `PrismaService` as a provider and
exports it:

```ts
// illustration — based on docs.nestjs.com/recipes/prisma, NOT yet applied to repo
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

Each feature module that needs DB access imports `PrismaModule`:

```ts
// illustration — based on docs.nestjs.com/recipes/prisma, NOT yet applied to repo
@Module({
  imports: [PrismaModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
```

Then `TasksService` can inject `PrismaService` via constructor DI:

```ts
// illustration — NOT yet applied to repo
@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}
}
```

> 📖 Source: [docs.nestjs.com/recipes/prisma](https://docs.nestjs.com/recipes/prisma)

---

## 🔗 Review of prior knowledge

| Prior knowledge                                                                                                                         | L07 application                                                                                                                                                                                                                   | What changes/why                                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Express + Prisma: `export default new PrismaClient()` in `db.ts`, `import prisma from './db'` scattered across routes/services          | `PrismaService extends PrismaClient`, registered via `PrismaModule`, injected via constructor like any other provider                                                                                                             | Nest manages the **lifecycle** (connect in `onModuleInit`, disconnect in `onModuleDestroy` if shutdown hooks are enabled) and allows **mocking** via `Test.createTestingModule()` — the Express+dotenv-style singleton has neither                  |
| Hexagonal architecture: domain/business logic does not depend directly on infrastructure (real DB, network...)                          | `PrismaService` acts as the **adapter** between domain code (`TasksService`) and the real infrastructure (Postgres) — the domain only knows `this.prisma.task.findMany()`, not the connection string or which driver is behind it | Calling the global `PrismaClient` directly = domain code also knows how to connect to the DB (exactly what hexagonal wants to avoid); going through `PrismaService` is an explicit port/adapter, easier to swap out with a mock in tests            |
| L06 (Configuration): `ConfigModule.forRoot({ validate })` only validates `NODE_ENV`/`PORT` (see current `src/config/env.validation.ts`) | `DATABASE_URL` was already in `.env`/`.env.example` from L00 ("Used from Lesson 07"), but was **not** in `EnvironmentVariables` in L06                                                                                            | Without adding `DATABASE_URL` to the L06 validate schema (or validating it separately in `PrismaService`), a missing/invalid `DATABASE_URL` is not caught at bootstrap — the error only surfaces when `PrismaClient` actually tries to `$connect()` |

**What I used to misunderstand:** This section usually records **personal** misconceptions discovered while coding — but the hands-on for this lesson was executed as a substitute (see disclaimer at top of file), so there is no real personal experience to record. Instead, here are 4 discrepancies between the Theory (written before hands-on ran) and the actual implementation discovered by Claude Code while re-reading the PR #87 diff:

1. **Prisma pinned at 6.19.3, not 7.10.0/8.0.0-rc as discussed in Concept 3** — dodges the entire
   Option A/B driver-adapter decision because that requirement only applies from Prisma 7 onwards
   (see the callout after the Option A/B table).
2. **`PrismaModule` adds `@Global()`** — Concept 4 and the illustration example don't mention this
   decorator, but the real implementation uses it so that future feature modules (Users, Projects,
   Comments) don't each need `imports: [PrismaModule]` — the same "convenience vs. explicitness"
   tradeoff discussed in L06 Concept 3, applied to module boundaries instead of config.
3. **`TasksService.update()`/`remove()` had a real race condition in the initial version** — the
   first version of PR #87 called `findOne(id)` (one query) then `update`/`delete` (a second query)
   to produce `NotFoundException`, mirroring the in-memory `remove()` structure from L04. With a real
   DB, another request can delete the record between the two queries — Prisma throws `P2025` uncaught,
   surfacing as a 500 instead of a 404. Claude Code caught this during local review and fixed it
   (`522bab5`): catch `P2025` directly around `update`/`delete`, remove the separate existence-check
   query. **Lesson moving from in-memory to a real DB:** a "check-then-act" pattern that is safe with
   a single-threaded in-memory array can be **unsafe** with a DB under concurrent requests — always
   prefer letting the write operation itself report not-found rather than a separate preceding query.
4. **The e2e tests lost some validation cases when rewritten for Postgres** — the old in-memory e2e
   had separate tests for non-boolean `completed` in PATCH, empty `title` in PATCH, title too long,
   title not a string; the new version consolidates into a single `'rejects invalid task input'` test
   and some of those cases are no longer exercised (DTO validation still works, just not covered by
   e2e). Not restored at closeout — noted here so it is not forgotten when e2e is rewritten for
   L07/L08.

---

## 💻 Illustrated examples

> All code below is **illustrative, based on the docs** — intended to teach concepts in small steps,
> NOT an exact diff of PR #87. The final choice (Option A or B from Concept 3) is yours if you
> redo the hands-on yourself. The **actual merged code** (differing in a few details from the
> illustrations here — see "What I used to misunderstand" above) lives in the "✅ Execution
> substitute evidence" section of the Hands-on below, or read it directly via `pnpm lesson 07`.

### Example 1: `prisma/schema.prisma` — minimal schema for this lesson

```groovy
// illustration — NOT yet in the repo. Minimal model, NO relations added
// (relations are L08 scope, not L07 — see docs/ROADMAP.md).
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js" // or "prisma-client" if choosing Option B from Concept 3
}

model Task {
  id        Int      @id @default(autoincrement())
  title     String
  completed Boolean  @default(false)
}
```

**Explanation:**

- `url = env("DATABASE_URL")`: Prisma reads the connection string from the environment variable —
  the same variable already present in `.env.example` from L00, just not yet validated in L06 (see
  table above).
- The `Task` model has exactly 3 fields matching the current `Task` interface in
  `src/tasks/tasks.service.ts` (`id`, `title`, `completed`) — the goal of L07 is to change the
  storage backend (in-memory → Postgres), not redesign the domain model.

> 📖 Based on: [docs.nestjs.com/recipes/prisma](https://docs.nestjs.com/recipes/prisma)

### Example 2: `src/prisma/prisma.service.ts` — Option A (simple, classic generator)

```ts
// illustration — NOT yet in the repo, corresponding to Option A from Concept 3
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
```

**Explanation:**

- `extends PrismaClient`: all model methods (`this.task.findMany()`...) are available on `this`,
  no need for a nested `prisma` property.
- `implements OnModuleInit, OnModuleDestroy`: explicitly declares the 2 interfaces for type-checking —

### Example 3: `src/tasks/tasks.service.ts` — switching from in-memory to async Prisma

**What changes:** every method that was synchronous (`create()`, `findAll()`, `findOne()`,
`update()`, `remove()`) must become `async` and return a `Promise<T>`, because every Prisma call
is asynchronous (it goes over the network to Postgres).

```ts
// illustration — NOT yet in the repo
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createTaskDto: CreateTaskDto,
  ): Promise<{ id: number; title: string; completed: boolean }> {
    return this.prisma.task.create({ data: { title: createTaskDto.title } });
  }

  async findAll(
    completed?: string,
  ): Promise<{ id: number; title: string; completed: boolean }[]> {
    return this.prisma.task.findMany({
      where:
        completed === undefined
          ? undefined
          : { completed: completed === 'true' },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(
    id: number,
  ): Promise<{ id: number; title: string; completed: boolean }> {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }
}
```

**Ripple effect:** `TasksController` must also add `async` + `Promise<T>` to every handler method.
Tests that previously used `mockReturnValue(...)` (sync) must switch to `mockResolvedValue(...)`
(async). These cascading changes are expected and are the **main learning moment of this lesson**.

---

## 🛠 Hands-on

> The hands-on below is a **guide for when you redo it yourself**, not a log of what actually
> happened (see disclaimer at the top of the file and the "Execution substitute evidence" section
> at the bottom of this hands-on for the real steps).

### Step 1: Install Prisma

```bash
pnpm add @prisma/client       # or @prisma/client@6.x to pin to a pre-7 version
pnpm add -D prisma            # or prisma@6.x to match the client version
# If choosing Option B (Prisma 7 + driver adapter):
# pnpm add @prisma/adapter-pg pg
```

### Step 2: Initialize Prisma schema

```bash
npx prisma init               # creates prisma/schema.prisma + adds DATABASE_URL to .env
# Edit prisma/schema.prisma: add model Task { id, title, completed }
```

### Step 3: Start the database

```bash
docker compose up -d
docker compose ps             # wait until postgres shows "healthy"
```

### Step 4: Run migration

```bash
npx prisma migrate dev --name init
# Check: prisma/migrations/20..._init/migration.sql should be created
```

### Step 5: Create PrismaService and PrismaModule

Create `src/prisma/prisma.service.ts` and `src/prisma/prisma.module.ts`; import `PrismaModule` in
`AppModule`; add `app.enableShutdownHooks()` to `src/main.ts`.

### Step 6: Migrate TasksService to use Prisma

Replace in-memory array logic with `this.prisma.task.*` calls; update all method signatures to
`async`/`Promise<T>`; update `TasksModule` to import `PrismaModule`.

### Step 7: Verify and test

```bash
pnpm start:dev
# Test CRUD via real Postgres, e.g. with curl or Postman:
curl -X POST localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Learn Prisma"}'
curl localhost:3000/tasks
# Confirm data persists after restarting the app (unlike in-memory — this is the L07 goal).
```

```bash
pnpm test      # many old TasksService/TasksController tests will fail — update mocks
pnpm test:e2e  # requires a running Postgres; consider DATABASE_URL_TEST (already in .env.example, used fully from L17)
pnpm verify    # run before opening PR
```

**Troubleshooting:**

- `PrismaClientInitializationError` or complaints about `adapter`/`PrismaClientOptions`: indicates
  you are on Option B (Prisma 7 + driver adapter) but missing `@prisma/adapter-pg` or haven't
  passed `adapter` to `super({...})` — or you are mixing both options A and B.
- `prisma migrate dev` reports it cannot connect to the DB: check `docker compose ps` shows
  `healthy`, and that `DATABASE_URL` in `.env` uses port `5433` (not the default `5432`) as noted
  in `.env.example`.
- Many old tests fail after changing `TasksService` to return `Promise`: expected, as described in
  Example 3 — update `tasks.service.spec.ts` to mock `PrismaService`
  (`Test.createTestingModule()` + `overrideProvider`), not a mistake from a previous step.

### ✅ Execution substitute evidence — PR #87 (real results, not a guide)

> See the disclaimer at the top of the file: the section below describes code that **ran for real**
> in PR #87 (`codex/nes-8-l07-prisma-postgresql-prismaservice` → `main`, merge commit `5791085`),
> not something Hien Duong did personally. Execution sentinels:
> `.hermes/runs/NES-8-claude-review.json` (local review), `NES-8-claude-p1-fix.json` (P1 fix),
> `NES-8-postmerge-audit.json` (post-merge audit) — all three are gitignored and not in git history.

**0. Dependency.** `@prisma/client@6.19.3` added to `dependencies`, `prisma@6.19.3` to
`devDependencies` — the 6.x line, not the 7.10.0/8.0.0-rc discussed in Concept 3 (see the callout

- "What I used to misunderstand"). Classic `prisma-client-js` generator, no driver adapter.

**1. `prisma/schema.prisma`.** `Task` model (`id` autoincrement, `title` String, `completed`
Boolean `@default(false)`) — matches Example 1 exactly, no relations added. Migration
`prisma/migrations/20260826162300_init/migration.sql` generated alongside (`CREATE TABLE "Task"`)
but **never applied against a real Postgres** — PR #87 reported Docker was unavailable at execution
time.

**2. `src/prisma/prisma.service.ts`.** `PrismaService extends PrismaClient implements OnModuleInit,
OnModuleDestroy` — `$connect()`/`$disconnect()` — matches Example 2 (Option A, no adapter).
`src/prisma/prisma.module.ts` adds `@Global()` (unlike the illustration in Concept 4 — see "What
I used to misunderstand" #2), exports `PrismaService`. `src/app.module.ts` imports `PrismaModule`.

**3. `src/main.ts`.** Added `app.enableShutdownHooks()` before reading `PORT` — meeting the
condition for `onModuleDestroy` to actually run stated in Concept 2.

**4. `src/config/env.validation.ts`.** Added `DATABASE_URL` (`@IsDefined @IsString @IsUrl({
protocols: ['postgresql','postgres'], require_tld: false})`) to `EnvironmentVariables` — chose the
"add to the L06 validate schema" branch from the two options in the "Review of prior knowledge"
table (instead of letting `PrismaService` throw during `$connect()`).

**5. `src/tasks/tasks.service.ts`.** Full CRUD via `this.prisma.task.*`, all methods `async`. The
initial version of PR #87 had a real race condition in `update()`/`remove()` (see "What I used to
misunderstand" #3) — Claude Code caught it during local review and fixed it with commit `522bab5`:
catch Prisma `P2025` directly around `update`/`delete`, removing the separate `findOne()` check.

**6. Tests.** Unit tests (`tasks.service.spec.ts`, `tasks.controller.spec.ts`,
`env.validation.spec.ts`, `main.spec.ts`) mock `PrismaService` at the boundary — never touch a
real DB. `test/tasks.e2e-spec.ts` rewritten to run CRUD via real `PrismaService` (including calling
`app.get(PrismaService).task.deleteMany()` in `beforeEach`) but **requires a live Postgres** — this
e2e suite has **never successfully run**, not locally (Docker waived) and not on CI (see below). Note:
some old validation cases were dropped/consolidated when rewriting (see "What I used to
misunderstand" #4).

**7. CI.** `pnpm-workspace.yaml` needed `allowBuilds` extended for `@prisma/client`/
`@prisma/engines`/`prisma` — without this, `pnpm install --frozen-lockfile` fails with
`ERR_PNPM_IGNORED_BUILDS` on GitHub Actions; Claude Code fixed this (commit `3f75e42`) after seeing
the CI failure log. `.github/workflows/ci.yml` **unchanged** — the `postgres` service and E2E step
remain commented out (they were already commented out before PR #87), so `pnpm test:e2e` has
**never been run by CI** for any lesson up to this point, not just L07.

**Verify results (re-run at review/fix time, matching PR #87 CI):** Prisma schema validation —
PASS. `pnpm exec eslint --max-warnings=0` — PASS. `pnpm exec prettier --check` — PASS. `pnpm test`
(`--runInBand --watchman=false`) — 9 suites / 34 tests PASS (Prisma mocked at boundary —
**not** tests running against a real Postgres). `pnpm build` (`nest build`) — PASS. GitHub Actions
CI on PR #87 (`Lint · Test · Build`) — SUCCESS, merge commit `5791085e5d67b8e4babe915cd72d601e4abca94e`.
**`pnpm test:e2e` with a real Postgres — NEVER RUN, at any point in the entire L07 history.**

---

## ✅ Definition of Done

<!-- Copied from NES-8. Checked based on execution-substitute evidence (PR #87) — NOT your own
     completion. The second item is INTENTIONALLY left unchecked; see the explanation below. -->

- [x] Lesson note complete (theory + hands-on reference + quiz execution-substitute — see disclaimer
      at top of file)
- [ ] `docker compose ps` healthy, CRUD Tasks running against a real Postgres — **NOT verified.**
      Docker was waived by user authorization when executing PR #87; migration + e2e CRUD against a
      real Postgres have never run anywhere (not locally, not on CI — see "Execution substitute
      evidence" above). This gap is **qualitatively different** from L05/L06: those two lessons do
      not depend on a runtime DB so "waiving Docker" was never a problem for them; the core goal of
      L07 is precisely "data living in a real Postgres" (see Phase 2 objective in `docs/ROADMAP.md`),
      so this gap **is not automatically treated as closed** just because the code/CI is green.
- [x] Tests pass (static + unit + CI) — `pnpm test` 9 suites/34 tests, ESLint `--max-warnings=0`,
      Prettier, `nest build` all PASS; GitHub Actions CI green on PR #87 (`5791085`). **Does not
      include** `pnpm test:e2e` running against a real Postgres — that case has never run (see above).
- [ ] Quiz pass — the answers in the "Review & Quiz" section below are **an execution substitute
      by Claude Code**, not answers you gave yourself and had a mentor confirm you understood. This
      item only closes for real when you redo the quiz yourself.
- [x] PR merged — PR #87 (`Fixes NES-8`) and PR #88 (`Fixes NES-81`) merged into `main`, CI green
      on both (`5791085`, `8283a3f`).
- [ ] English mirror (`example/nestjs-training`) — **NOT merged yet.** Drafted on branch
      `agy/nes-8-l07-en-mirror` by `agy`, completed by Claude Code after `agy`'s quota ran out;
      pushed to `origin/agy/nes-8-l07-en-mirror` but not opened as a PR or merged into
      `example/nestjs-training`. Per this repo's own L03/L04 lesson ("never mark the VN side 'done'
      while the EN mirror is still unfinished" — `_agent-log.md`), this item stays unchecked until
      the mirror is actually merged, not just drafted.

---

## ✅ Review & Quiz

> The answers below are **execution-substitute evidence** from Claude Code (see disclaimer at the
> top of the file), based directly on real code from PR #87 and the original docs — not Hien
> Duong's own thinking. To learn for real, answer the questions yourself before reading these.

1. **Q:** `onModuleDestroy()` of `PrismaService` does not run automatically when you Ctrl+C
   `pnpm start:dev`, even though the class implements the `OnModuleDestroy` interface. Explain
   exactly why, and describe the exact fix added in PR #87.
   **A:** According to the NestJS docs, the shutdown lifecycle hooks (`onModuleDestroy`,
   `beforeApplicationShutdown`, `onApplicationShutdown`) are disabled by default — adding the
   interface does not enable them. They only fire when: (1) `app.close()` is called explicitly, or
   (2) the process receives a termination signal (`SIGTERM`, `SIGINT`, etc.) **and**
   `app.enableShutdownHooks()` has been called on the app object in `main.ts` beforehand. Without
   that call, the process exits immediately on Ctrl+C/SIGTERM without going through any of Nest's
   shutdown hooks — meaning `$disconnect()` is never called and the Postgres connection is abandoned.
   The fix in PR #87: adding `app.enableShutdownHooks()` right after `NestFactory.create(AppModule)`
   in `src/main.ts`, before the `listen()` call.

2. **Q:** `prisma@latest` during PR #87 execution resolved to `8.0.0-rc.11` (a release candidate)
   while `@prisma/client@latest` resolved to `7.10.0` (stable). That mismatch itself is not the
   real issue — the deeper concern is what Prisma 7+ requires that makes the `PrismaService` from
   the NestJS docs recipe no longer work as written. Explain.
   **A:** Starting with Prisma 7, all SQL database connections require a **driver adapter** — a
   separate package like `@prisma/adapter-pg` for Postgres — passed to the `PrismaClient`
   constructor: `new PrismaClient({ adapter: new PrismaPg() })`. The classic
   `extends PrismaClient` with no constructor arguments (`new PrismaClient()` implicitly) and the
   `prisma-client-js` generator both break under Prisma 7 unless the adapter is provided. The
   NestJS recipe doc has been updated to reflect this, but many tutorials still show the pre-7
   pattern. PR #87 avoided this entirely by pinning to `6.19.3` — the stable 6.x line before
   the driver adapter requirement.

3. **Q:** The initial version of PR #87 (commit `403f03d`) called `findOne(id)` separately
   before calling `update()`/`delete()`. Code review flagged this as a P1 bug. Explain the specific
   failure scenario that is impossible with an in-memory array but possible with a real DB, what
   Prisma error it produces, and what the fix looks like.
   **A:** The failure scenario: between the moment `findOne(id)` returns confirming the task exists
   and the moment `update`/`delete` actually runs, another request (or the same request retried)
   could delete that exact row — this is a TOCTOU race condition (time-of-check-to-time-of-use),
   which cannot happen with the single-threaded in-memory array from L04 but can absolutely happen
   with a DB handling concurrent connections. When it does, `prisma.task.update`/`.delete` throws
   `PrismaClientKnownRequestError` with code `P2025` ("record to update/delete not found") —
   uncaught, this surfaces as an unhandled 500 error instead of the intended `404 NotFoundException`.
   The fix is not "wrap in try/catch for show" — it **removes** `findOne()` from `update()`/
   `remove()` entirely, making `update`/`delete` itself the sole existence check (Postgres
   guarantees atomicity of that operation), then catches specifically the `P2025` error code to
   translate it to `NotFoundException(`Task ${id} not found`)` — other Prisma error codes are
   re-thrown unchanged, not swallowed. Result: only 1 DB query instead of 2, and no time gap
   between "check" and "mutate".

4. **Q:** `PrismaModule` in PR #87 adds `@Global()` — this decorator does not appear in the
   illustration example in Concept 4. What does `@Global()` change compared to a regular `@Module`,
   and what tradeoff does that mirror from something you learned in L06?
   **A:** A regular `@Module` must be explicitly listed in `imports: [PrismaModule]` in **every**
   feature module that wants to use `PrismaService` (`TasksModule`, then `UsersModule`,
   `ProjectsModule` in the future...). `@Global()` makes every provider that module exports (here,
   `PrismaService`) automatically available **everywhere** in the app after `PrismaModule` is
   imported exactly once in `AppModule` — no need to repeat `imports` in each feature module. This
   is exactly the "convenience vs. explicitness" tradeoff discussed in L06 Concept 3 for
   `ConfigModule.forRoot({ isGlobal: true })`: in exchange for not repeating code, you lose the
   ability to read a single module's `imports` and immediately know it has a DB dependency —
   hexagonal boundaries (which module needs which port) become slightly blurred in favor of
   convenience, just like `isGlobal: true` on `ConfigModule`.

5. **Q:** CI on PR #87 ran green (`Lint · Test · Build`: install, eslint, prettier, `pnpm test`,
   `nest build`). What does that prove about whether Tasks CRUD works correctly with a real
   Postgres — and what does it not prove? Identify exactly which layers in the stack were verified
   and which were not.
   **A:** Green CI proves: the code compiles (`nest build`), no lint/format errors, and all
   **unit tests** pass — but `tasks.service.spec.ts` mocks `PrismaService` completely at the
   boundary (`{ task: { create: jest.fn(), ... } }`), so it only proves that `TasksService`
   **calls the right Prisma method with the right arguments** (e.g., `prisma.task.update` is called
   with `{ where: { id }, data: updateTaskDto }`). It does **not** prove that a real Postgres
   returns the right result when those SQL statements actually run. The layer **not** verified:
   `test/tasks.e2e-spec.ts` (which requires `PrismaService` to connect to a real Postgres via
   `app.get(PrismaService).task.deleteMany()`) has never successfully run — not locally (Docker
   waived when PR #87 was executed) and not on CI (`.github/workflows/ci.yml` still has the
   `postgres` service and E2E step commented out, a gap predating this PR, not specific to L07).
   In short: green CI = "code is syntactically correct and calls the Prisma API correctly",
   **not** "the app can actually CRUD against a running Postgres".

**Connecting back to the previous lesson:** L06 taught "fail fast at process boundary" — validate
environment variables at bootstrap rather than letting errors surface late. L07 applies exactly
that principle to `DATABASE_URL`: PR #87 chose to add it to `EnvironmentVariables` (`@IsUrl`)
rather than letting `PrismaService.$connect()` throw — meaning a missing/invalid `DATABASE_URL`
is now caught **before** `NestFactory.create()` returns, at exactly the gate quiz Q2 of L06
predicted would be needed for this lesson.

---

## 🧠 Key takeaways

1. `PrismaService` = `PrismaClient` wrapped in `@Injectable()` — Nest manages the lifecycle and
   allows mocking, replacing the global singleton pattern of Express + `dotenv`.
2. `onModuleInit()` runs automatically at module init; `onModuleDestroy()` **only** runs when
   `app.close()` is called or a system signal is received **and** `app.enableShutdownHooks()` was
   called in `main.ts` — forgetting that line is the most common pitfall of this lesson.
3. Prisma 7 (current stable `7.10.0`) requires a **driver adapter** (`@prisma/adapter-pg` for
   Postgres) for SQL databases — unlike the plain `new PrismaClient()` of older tutorials.
   **PR #87 pins `6.19.3`**, sidestepping the entire A/B decision by staying before the Prisma 7
   boundary (see "What I used to misunderstand" + quiz Q2) — if you redo the hands-on, this is
   still your choice to make.
4. `PrismaModule` exports `PrismaService` so multiple feature modules share **one** instance —
   same singleton-scope provider principle from L03/L04. The merged version also uses `@Global()`
   (the convenience-vs-explicitness tradeoff, identical to `ConfigModule.forRoot({ isGlobal: true })`
   from L06 — see quiz Q4).
5. `DATABASE_URL` was in `.env` since L00, but was **not** validated in L06 — PR #87 chose to add
   it to `EnvironmentVariables` (`env.validation.ts`) rather than letting `PrismaService` report
   the error on connect.
6. **Check-then-act is not safe with a DB under concurrent requests**, even though it is safe with
   the single-threaded in-memory array from L04: calling `findOne()` then `update`/`delete`
   separately is a real race condition (P1, fixed in `522bab5`) — prefer letting the write
   operation itself report not-found (catch `PrismaClientKnownRequestError` code `P2025`) rather
   than a separate preceding existence check.
7. **Green CI (unit tests + build) does not prove CRUD works with a real Postgres** — `pnpm test`
   mocks `PrismaService` at the boundary; `pnpm test:e2e` (requires live Postgres) has never
   successfully run at any point in the entire L07 history (Docker waived locally, `postgres`
   service + E2E step still disabled on CI). Distinguishing "code calls the Prisma API correctly"
   from "the app can actually CRUD against a running DB" is the biggest takeaway from this closeout
   — see "Definition of Done" for exactly which gates remain open.

---

## 📎 Sources

- [docs.nestjs.com/recipes/prisma](https://docs.nestjs.com/recipes/prisma)
- [docs.nestjs.com/fundamentals/lifecycle-events](https://docs.nestjs.com/fundamentals/lifecycle-events)
- [docs.nestjs.com/techniques/configuration](https://docs.nestjs.com/techniques/configuration) — `DATABASE_URL` validation gap, see "Review of prior knowledge" table
- [prisma.io/docs — supported databases](https://www.prisma.io/docs/orm/reference/supported-databases)
- [prisma.io/docs — connection URLs](https://www.prisma.io/docs/orm/reference/connection-urls)
- [prisma.io/blog — Build a REST API with NestJS, Prisma 7, PostgreSQL and Swagger](https://www.prisma.io/blog/nestjs-prisma-rest-api-7D056s1BmOL0)
- `docs/lessons/06-configuration/README.md` — current `ConfigService`/`env.validation.ts`, directly related to `DATABASE_URL`

<!-- CO-OP TRANSLATOR DISCLAIMER START -->

**Disclaimer**:
This document has been translated using AI translation service [Co-op Translator](https://github.com/Azure/co-op-translator). While we strive for accuracy, please be aware that automated translations may contain errors or inaccuracies. The original document in its native language should be considered the authoritative source. For critical information, professional human translation is recommended. We are not liable for any misunderstandings or misinterpretations arising from the use of this translation.
<!-- CO-OP TRANSLATOR DISCLAIMER END -->
