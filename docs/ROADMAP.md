# 🗺️ ROADMAP — NestJS Mastery

> **Source of truth for tasks:** Linear (project `NestJS Mastery`).
> This file is the overall map for offline reading + tracking progress in the repo.
> Updated by the `/sync-progress` skill after each lesson.

## Final Course Project

A production-grade **Task Management API** built with NestJS 11:

- `User` — registration, login, JWT + refresh token, role-based access control
- `Project` — user-owned projects, member invitations (many-to-many relationship via junction table)
- `Task` — belongs to a project, has assignee, status, priority, due date
- `Comment` — comments on tasks

Including: input validation, centralized error handling, logging, Swagger docs, API versioning, Redis cache, health check, unit + e2e tests with coverage threshold, automated CI, runnable via `docker compose`.

## Table Reading Conventions

| Column     | Meaning                                                                                                     |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| **L**      | Lesson code (L00–L25)                                                                                       |
| **Status** | ⬜ Not started · 🟦 In progress · ✅ Completed                                                              |
| **Docs**   | Official documentation link — **always read the latest version on the web, do not learn from cached files** |

All `docs.nestjs.com/...` links below have been verified against the actual routing of the `nestjs/docs.nestjs.com` repo.

---

## Phase 0 — Setup & Professional Workflow

> **Objective:** Set up a working environment like a real project before writing the first line of business logic. The setup process itself is the lesson.

| L   | Lesson                                                             | Status | Docs / Sources                                                               |
| --- | ------------------------------------------------------------------ | ------ | ---------------------------------------------------------------------------- |
| L00 | Project setup, Linear/GitHub/Slack/CI/Docker, development workflow | ✅     | [Lesson note](lessons/00-setup/README.md) · [WORKFLOW](workflow/WORKFLOW.md) |

---

## Phase 1 — Foundations

> **Objective:** Understand Nest's 3 core building blocks (Module / Controller / Provider) and the Dependency Injection mechanism — the biggest difference from Express.

| L   | Lesson                                                               | Status | Docs                                                                                                                                                                                                                                |
| --- | -------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L01 | Project structure & bootstrap (`main.ts`, platform adapter)          | ✅     | [/first-steps](https://docs.nestjs.com/first-steps) · [/fundamentals/platform-agnosticism](https://docs.nestjs.com/fundamentals/platform-agnosticism)                                                                               |
| L02 | Controllers & Routing (`@Get`, `@Post`, `@Param`, `@Body`, `@Query`) | ✅     | [/controllers](https://docs.nestjs.com/controllers)                                                                                                                                                                                 |
| L03 | Providers & Dependency Injection                                     | ✅     | [/providers](https://docs.nestjs.com/providers) · [/fundamentals/custom-providers](https://docs.nestjs.com/fundamentals/custom-providers) · [/fundamentals/injection-scopes](https://docs.nestjs.com/fundamentals/injection-scopes) |
| L04 | Modules + **Hands-on: CRUD Tasks (in-memory)**                       | ✅     | [/modules](https://docs.nestjs.com/modules) · [/fundamentals/dynamic-modules](https://docs.nestjs.com/fundamentals/dynamic-modules)                                                                                                 |

**Review prior knowledge:** Express's `app.get('/path', handler)` ↔ `@Controller` + `@Get`; `require()`/manual initialization ↔ IoC container; Express's modular router ↔ `@Module`.

> WARNING L00/L01/L02 updated on 2026-08-24. L00 was a stale VN/EN parity mismatch (VN already showed done) fixed by this update. L01/L02 flipped to done to match the pre-existing Done status on Linear (NES-2, NES-3). Missing hands-on/quiz evidence in the lesson notes was executed as a substitute by Hermes/Claude Code under a one-time user-approved exception (2026-08-24) - see the disclaimer in `docs/lessons/01-first-steps/README.md` and `docs/lessons/02-controllers/README.md`.

---

## Phase 2 — Working with Data

> **Objective:** Incoming data must be validated, configuration must come from the environment, and data must reside in a real PostgreSQL database via Prisma.

| L   | Lesson                                                            | Status | Docs                                                                                                                                                |
| --- | ----------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| L05 | DTO + Pipes + ValidationPipe (class-validator, class-transformer) | ✅     | [/techniques/validation](https://docs.nestjs.com/techniques/validation) · [/pipes](https://docs.nestjs.com/pipes)                                   |
| L06 | Configuration & environment variables                             | ✅     | [/techniques/configuration](https://docs.nestjs.com/techniques/configuration)                                                                       |
| L07 | Prisma + PostgreSQL: `PrismaService`, lifecycle hooks             | 🟦     | [/recipes/prisma](https://docs.nestjs.com/recipes/prisma) · [prisma.io/docs](https://www.prisma.io/docs)                                            |
| L08 | Schema, relations, migrations, seed                               | 🟦     | [/recipes/prisma](https://docs.nestjs.com/recipes/prisma) · [Prisma — Relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations) |

**Review prior knowledge:** You have used Prisma with Express — now compare how wrapping `PrismaClient` into a **provider** lets Nest manage its lifecycle, instead of importing a global singleton.

> WARNING L05 flipped to ✅ on 2026-08-25 after the NES-6 reference implementation merged (PR #78, `b3086f4`, CI green: `pnpm test` 7 suites/20 tests, `pnpm test:e2e` 3 suites/13 tests, `pnpm verify` PASS). The Hands-on (NES-60) was **executed as a substitute by Hermes/Codex** and the quiz (NES-65) was **executed as a substitute by Claude Code**, both under a one-time user-approved exception (2026-08-25) because the user was busy — not evidence Hien Duong did it personally. See the disclaimer in `docs/lessons/05-dto-pipes-validation/README.md`.
>
> WARNING L06 flipped to ✅ on 2026-08-26 after the NES-7 reference implementation merged (PR #82, `f496a77`, CI green: `pnpm test` 9 suites/28 tests, `pnpm test:e2e` 3 suites/13 tests, `pnpm verify` PASS). The Hands-on (NES-72) was **executed as a substitute by Hermes/Codex** and the quiz (NES-77) was **executed as a substitute by Claude Code**, both under a one-time user-approved exception (execution-substitute authorization, 2026-08-26) because the user was busy — not evidence Hien Duong did it personally. See the disclaimer in `docs/lessons/06-configuration/README.md`.
>
> WARNING L07 **INTENTIONALLY stays at "In Progress", does NOT flip to ✅ like L05/L06**, even though the NES-8 reference implementation has merged (PR #87, `5791085`, CI green: `pnpm test` 9 suites/34 tests PASS — lint/prettier/build all PASS) and the lesson note has been closed out under the execution-substitute exception (hands-on NES-84 + quiz NES-88 both **executed as a substitute by Hermes/Codex/Claude Code**, not done by Hien Duong personally — see the disclaimer in `docs/lessons/07-prisma-postgresql/README.md`). **The reason is qualitatively different from L05/L06:** those two lessons do not depend on a runtime DB, so their `pnpm test:e2e` actually ran and PASSED in their CI; L07's core goal for all of Phase 2 is precisely "data living in a real Postgres via Prisma" (see the Objective line above) — and that exact part has **never been verified**: the migration `prisma/migrations/20260826162300_init` has never been applied against a real Postgres, `pnpm test:e2e` (which requires a live Postgres) has never successfully run (Docker was waived when PR #87 was executed, and `.github/workflows/ci.yml` still has the `postgres` service + E2E step commented out — a gap that predates this PR). "Waiving Docker + waiving the learner gate" at the same time is a **larger** exception than the L05/L06 precedent (which only waived the learner gate) — it does not automatically get the same closeout treatment just because the code/CI is green. L07 flips to ✅ once one of two things happens: (a) `pnpm test:e2e` actually runs against a live Postgres (locally or with CI's `services.postgres` enabled) and the evidence is updated, or (b) the user explicitly approves a separate exception specifically for waiving runtime DB verification (distinct from the existing learner-gate exception).
>
> 🟦 L08 **stays at "In Progress", does NOT flip to ✅.** Theory (NES-90) has merged (PR #92, `3186b24`). Unlike the previous callout: `prisma/schema.prisma`, the migration (`prisma/migrations/20260827100000_add_user_project_task_comment_relations`), `prisma/seed.ts`, and the DTO/service (`src/tasks/dto/*`, `src/tasks/tasks.service.ts`) **have been applied** via PR #91 (Fixes NES-9, merged `2d59255`, CI green: `pnpm verify` PASS) — this is an **execution substitute approved by the user for this round (2026-08-27)**, not evidence that Hien Duong did NES-91 by hand. PR #91 itself disclosed clearly: `prisma migrate dev`/seed/relational e2e with a live PostgreSQL are **SKIPPED/UNVERIFIED** (Docker was waived). The post-merge review (NES-121, follow-up PR) cross-checked and fixed 3 gaps missed in the PR #91 review (status/completed desync, boolean slipping through projectId/assigneeId validation, Task response leaking fields outside the `{id,title,completed}` spec) — this does not change the "execution substitute" decision, it only improves the code quality of what was substituted. A second post-merge review of PR #93 (NES-122, 2026-08-28) fixed 6 remaining gaps: the relation-ID DTO transform now also rejects array input, the Postgres readiness command in the docs now matches `docker-compose.yml` service name `postgres`, the seed guide clarifies that the first explicit seed is the first explicit call + fixes the seed race-condition description, and the schema illustration now includes `completed`. **The EN mirror/GitLab for L08 (PR #91/#92/#93 + NES-122 fixes) is now complete — this NES-9 EN mirror PR is that follow-up.** L08 flips to ✅ only after: (a) NES-91 hands-on actually runs against a live PostgreSQL (migrate/seed/verify via `prisma studio` or equivalent) **or** the user explicitly approves a separate runtime-DB waiver (same pending gate as L07), (b) NES-93 review/quiz is answered by Hien Duong personally, and (c) EN mirror/GitLab is complete per Bilingual Policy.

---

## Phase 3 — Request Lifecycle & Error Handling

> **Objective:** Master the full request lifecycle in Nest. This is the part Express developers often misunderstand the most, as Nest has up to 5 types of intermediate components instead of just middleware.

| L   | Lesson                                         | Status | Docs                                                                                                                                                                                                                        |
| --- | ---------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L09 | Middleware                                     | ⬜     | [/middleware](https://docs.nestjs.com/middleware)                                                                                                                                                                           |
| L10 | Exception Filters & centralized error handling | ⬜     | [/exception-filters](https://docs.nestjs.com/exception-filters)                                                                                                                                                             |
| L11 | Interceptors + full Request Lifecycle overview | ⬜     | [/interceptors](https://docs.nestjs.com/interceptors) · [/faq/request-lifecycle](https://docs.nestjs.com/faq/request-lifecycle) · [/fundamentals/execution-context](https://docs.nestjs.com/fundamentals/execution-context) |

**Execution order to memorize:**
`Middleware → Guard → Interceptor (before) → Pipe → Handler → Interceptor (after) → Exception Filter`

---

## Phase 4 — Authentication & Authorization

| L   | Lesson                                                          | Status | Docs                                                                                                                                                                                              |
| --- | --------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L12 | Registration / login, password hashing                          | ⬜     | [/security/authentication](https://docs.nestjs.com/security/authentication) · [/security/encryption-and-hashing](https://docs.nestjs.com/security/encryption-and-hashing)                         |
| L13 | JWT + Passport strategy                                         | ⬜     | [/security/authentication](https://docs.nestjs.com/security/authentication) · [/recipes/passport](https://docs.nestjs.com/recipes/passport)                                                       |
| L14 | Guards + RBAC (`@Roles`, `Reflector`, owner/member permissions) | ⬜     | [/guards](https://docs.nestjs.com/guards) · [/security/authorization](https://docs.nestjs.com/security/authorization) · [/custom-decorators](https://docs.nestjs.com/custom-decorators)           |
| L15 | Refresh token + hardening (helmet, CORS, rate limit)            | ⬜     | [/security/helmet](https://docs.nestjs.com/security/helmet) · [/security/cors](https://docs.nestjs.com/security/cors) · [/security/rate-limiting](https://docs.nestjs.com/security/rate-limiting) |

---

## Phase 5 — Testing & Documentation

| L   | Lesson                                                   | Status | Docs                                                                                                                                      |
| --- | -------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| L16 | Unit testing (`Test.createTestingModule`, mock provider) | ⬜     | [/fundamentals/unit-testing](https://docs.nestjs.com/fundamentals/unit-testing)                                                           |
| L17 | E2E testing with supertest + separate test database      | ⬜     | [/fundamentals/e2e-testing](https://docs.nestjs.com/fundamentals/e2e-testing)                                                             |
| L18 | Swagger / OpenAPI                                        | ⬜     | [/openapi/introduction](https://docs.nestjs.com/openapi/introduction) · [/openapi/cli-plugin](https://docs.nestjs.com/openapi/cli-plugin) |
| L19 | API Versioning                                           | ⬜     | [/techniques/versioning](https://docs.nestjs.com/techniques/versioning)                                                                   |

**Quality gate opens from this phase:** enable `coverageThreshold` in Jest — CI fails if coverage drops.

---

## Phase 6 — Caching & Observability

| L   | Lesson                                                    | Status | Docs                                                                                                                            |
| --- | --------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------- |
| L20 | Caching with Redis: TTL, `CacheInterceptor`, invalidation | ⬜     | [/techniques/caching](https://docs.nestjs.com/techniques/caching)                                                               |
| L21 | Production-standard logging + Health checks               | ⬜     | [/techniques/logger](https://docs.nestjs.com/techniques/logger) · [/recipes/terminus](https://docs.nestjs.com/recipes/terminus) |

---

## Phase 7 — Extensions (after completing core)

| L   | Lesson                                              | Status | Docs                                                                                                                                                      |
| --- | --------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L22 | Queues (BullMQ) & Task Scheduling                   | ⬜     | [/techniques/queues](https://docs.nestjs.com/techniques/queues) · [/techniques/task-scheduling](https://docs.nestjs.com/techniques/task-scheduling)       |
| L23 | Events (`EventEmitter`)                             | ⬜     | [/techniques/events](https://docs.nestjs.com/techniques/events)                                                                                           |
| L24 | File upload & Serialization                         | ⬜     | [/techniques/file-upload](https://docs.nestjs.com/techniques/file-upload) · [/techniques/serialization](https://docs.nestjs.com/techniques/serialization) |
| L25 | **Hexagonal architecture in NestJS** + final review | ⬜     | [/fundamentals/custom-providers](https://docs.nestjs.com/fundamentals/custom-providers) · [/recipes/cqrs](https://docs.nestjs.com/recipes/cqrs)           |

> L25 is the capstone lesson: refactor a module following ports & adapters, then place it next to your old Express + hexagonal project to see that Nest already _has built-in_ everything you previously had to build manually.

---

## Reference Repos (reading other people's code is the fastest way to learn)

| Repo                                                                                            | Used for                                                                                               |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [nestjs/nest — `sample/`](https://github.com/nestjs/nest/tree/master/sample)                    | ~35 official examples, each folder covers one technique. The most reliable source after official docs. |
| [nestjs/awesome-nestjs](https://github.com/nestjs/awesome-nestjs)                               | Community-curated list of libraries and articles                                                       |
| [lujakob/nestjs-realworld-example-app](https://github.com/lujakob/nestjs-realworld-example-app) | A complete real-world app following the RealWorld spec                                                 |
| [brocoders/nestjs-boilerplate](https://github.com/brocoders/nestjs-boilerplate)                 | Production boilerplate: auth, i18n, mailer, tests, docker                                              |
| [CatsMiaow/nestjs-project-structure](https://github.com/CatsMiaow/nestjs-project-structure)     | How to structure directories for large projects                                                        |

## Retrospective after each phase

At the end of each phase, write a retrospective following the [`docs/templates/retro.md`](templates/retro.md) template into `docs/lessons/_retros/phase-X.md`. This is a real Agile team practice: reviewing progress to move faster next time.
