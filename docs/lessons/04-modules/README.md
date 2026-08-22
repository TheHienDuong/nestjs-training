<!--
TEMPLATE LESSON NOTE — copy this entire file when opening a new lesson.
The /lesson-start skill will automatically handle copying and filling in the initial section.
Do not delete any section: each section has its own pedagogical purpose, noted in the comments.
-->

# L04 — Modules + Hands-on: CRUD Tasks (in-memory)

|                |                                                            |
| -------------- | ---------------------------------------------------------- |
| **Phase**      | 1 — NestJS Fundamentals                                    |
| **Linear**     | NES-5                                                      |
| **Branch**     | `duongthehien2001/nes-5-l04-modules-crud-tasks`            |
| **Main Docs**  | [docs.nestjs.com/modules](https://docs.nestjs.com/modules) |
| **Study Date** | 2026-08-22                                                 |

---

## 🗂 Lesson file map

> The most accurate map + reading each code file (with line numbers): run `pnpm lesson <NN>`.
> This table is a quick-reading summary; update it when the lesson is complete.

| File | Role (theory / ref / hands-on) | Created in lesson | Status       |
| ---- | ------------------------------ | ----------------- | ------------ |
| ...  | ...                            | L00               | New / Edited |

---

## 🎯 Objectives

<!-- 3-5 measurable bullet points. "Understand controllers" is not measurable.
     "Be able to write a controller with 5 CRUD routes, and explain @Param vs @Query" is measurable. -->

- [ ] Be able to explain the role of `imports` / `exports` / `providers` / `controllers` in `@Module` and when each field is needed.
- [ ] Split `TasksModule` out of `AppModule`, so `AppModule` only has `imports: [TasksModule]`.
- [ ] Complete all 5 CRUD routes for Tasks (in-memory) end-to-end, runnable via `pnpm start:dev`.
- [ ] Test the whole CRUD flow with the Tasks Postman collection, all 5 routes returning the correct status/body.
- [ ] Read and summarize dynamic modules (roadmap link) — no need to implement yet, just be able to explain when they're needed.

## 📚 Theory

<!-- Explain in English, in order: PROBLEM first, SOLUTION after.
     Each concept must have a link to the correct section of the original docs for reference.
     Avoid machine-translating docs — write as if you are teaching the person sitting next to you. -->

### Concept 1: `@Module()` — the role of `imports` / `exports` / `providers` / `controllers`

**Problem it solves:** A real backend app has dozens of controllers and services. If you declare them all in one place (Express-style: every route registered straight onto `app`), the code balloons, domain boundaries disappear, and there's no way to control which provider can be injected where — everything sees everything.

**How Nest implements it:** `@Module()` bundles a group of related classes into one unit, declared through 4 fields:

- `controllers`: the Nest controllers to instantiate, scoped to this module.
- `providers`: the providers (services, factories, values...) the Nest injector instantiates, usable within this module.
- `imports`: other modules this module needs, to obtain the providers they export.
- `exports`: a subset of `providers` (or just the `provide` token) that this module makes public for other modules that import it.

By default, a module **encapsulates** its providers — you can only inject a provider that belongs to the current module or was exported from an imported module. `exports` is a module's public API.

**When NOT to use it:** There is no "don't use a module" option — every Nest app always has at least a root module. What to avoid is cramming every domain's `controllers`/`providers` into a single module (usually AppModule) — you lose all the benefits of encapsulation and organization.

> 📖 Source: https://docs.nestjs.com/modules

### Concept 2: Feature modules — splitting by domain (`TasksModule` out of `AppModule`)

**Problem it solves:** If `AppModule` declares `TasksController` + `TasksService` + `UsersController` + `UsersService` directly, it keeps growing every time a new domain is added (Project, Comment in later lessons), and no one can look at `AppModule` and tell which domain depends on which.

**How Nest implements it:** Group the controller + service of the same domain into its own module (`TasksModule`, `UsersModule`), then the root module only has `imports: [...]` for those feature modules — it does not declare the sub-domain's controllers/providers itself. This is exactly the structure already in the repo (see Examples 1 and 2 below).

**When NOT to use it:** For a very small app (a single resource, no plan to grow), splitting into modules only adds an almost-empty file with no clear benefit. But the Task Management API has 4 domains (User/Project/Task/Comment), so splitting by domain is mandatory — matching the repo's "one feature = one `src/<feature>/` folder" convention.

> 📖 Source: https://docs.nestjs.com/modules#feature-modules

### Concept 3: Shared modules — using `exports` to share a provider between modules

**Problem it solves:** Suppose `CommentsModule` (a later lesson) needs to call `TasksService.findOne()` to check that a task exists before creating a comment. If `TasksService` were declared again in `CommentsModule`'s `providers`, Nest would create **a different instance** — losing the singleton property. Since `TasksService` currently holds internal state (`tasks: Task[]` in-memory), two instances would see two different task lists — a very hard bug to track down.

**How Nest implements it:** The module that owns the provider (`TasksModule` owns `TasksService`) adds that provider to `exports`. Another module just needs `imports: [TasksModule]` to receive the exact same singleton instance, without redeclaring `providers`.

**When NOT to use it:** Exporting every provider "just in case" is wrong — it breaks encapsulation, turning an internal provider (an implementation detail) into an uncontrolled public API. Only export a provider that another module **genuinely** needs. `TasksModule` currently exports nothing because no other module needs `TasksService` yet — that's the correct choice, not an oversight.

> 📖 Source: https://docs.nestjs.com/modules#shared-modules

### Concept 4: `@Global()` — when to use it, when not to

**Problem it solves:** Some providers are needed by almost every module (logger, database connection, config). Having to import the module containing it over and over in every feature module is very tedious.

**How Nest implements it:** Mark that module with `@Global()` — every provider it exports becomes available in **every other module**, without declaring `imports`. A global module should only be registered **once**, usually in the root/core module.

**When NOT to use it:** The official docs warn directly: "making everything global is not recommended". A global module hides the real dependency relationships — reading `AppModule` no longer tells you what `TasksModule` needs or who needs `TasksModule`, creating hidden coupling that's hard to track as the app grows. In this app, `TasksService` is only needed by `TasksModule` (and possibly `CommentsModule` in the future) — plain `imports`/`exports` is enough, **no** need for `@Global()`.

> 📖 Source: https://docs.nestjs.com/modules#global-modules

### Concept 5: Dynamic modules — the `forRoot()` / `register()` / `forFeature()` pattern (concept)

**Problem it solves:** A static module (like `TasksModule` currently) is fixed at write time and cannot receive parameters to configure itself at import time. But a general-purpose module like "database connection" or "reads the `.env` file" needs to behave differently each time it's used (a different dev DB vs staging DB, a different config directory between projects) — that module needs to receive "configuration parameters" right at the point of import.

**How Nest implements it:** A module defines a static method (naming convention: `forRoot()`, `register()`, or `forFeature()`) that returns a `DynamicModule` — an object with the same shape as `@Module()`'s metadata (`providers`, `exports`, `imports`, `controllers`), plus a required `module` field. Another module imports it by **calling** that method instead of just naming the class:

```ts
// static — cannot be configured
imports: [TasksModule];

// dynamic — pass parameters at import time
imports: [TasksModule.forRoot({ seedTasks: initialTasks })];
```

Community convention (not a hard framework rule):

- `register()`: each calling module can pass different config, used only for that calling module.
- `forRoot()`: configured once, reused across the whole app (e.g. `TypeOrmModule.forRoot()`).
- `forFeature()`: reuses `forRoot()`'s config but fine-tunes it per calling module.

**When NOT to use it:** If a module doesn't need different config between imports — like `TasksModule` currently, which only has one configuration, always the same — a dynamic module is redundant and harder to read than the existing static module. Only switch to a dynamic module when there's actually a parameter that needs to be passed in at import time.

> 📖 Source: https://docs.nestjs.com/modules#dynamic-modules and the full version https://docs.nestjs.com/fundamentals/dynamic-modules (read further when you need `forRootAsync`/`ConfigurableModuleBuilder` — not needed for this lesson)

---

## 🔗 Connect to prior knowledge

<!-- This is the most important section of the entire note. Fast learning = anchoring new knowledge to what you already know.
     Always cross-reference with: Express, Prisma, hexagonal architecture. -->

| Knowledge you already have                                                                                                        | Equivalent in NestJS                                                                                                   | Differences                                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Express: `app.use('/tasks', tasksRouter)` — one router file, registered straight onto `app`, no concept of a "module"             | `TasksModule` with `@Module({ controllers, providers, imports, exports })`                                             | A Nest module isn't just a route grouping — it's also a scope for the DI container. Express routers have no concept of "a provider only visible within this module's scope".       |
| Express: `require('./services/taskService')` — imported directly, callable by anyone, no control layer at all                     | `exports` in `@Module()` — only the listed providers are "exposed" outward                                             | Nest forces you to explicitly declare a module's "public API" via `exports`; Node/Express's `require()` has no equivalent encapsulation boundary.                                  |
| Hexagonal: ports/adapters separate the domain from infrastructure, wiring is usually hand-written (a factory, a manual container) | `@Module()` IS the wiring declaration — importing a module means "plugging" a domain/adapter into the dependency graph | Nest automatically resolves the dependency graph from `@Module()` metadata at bootstrap; plain hexagonal doesn't dictate how to wire things — you write your own composition root. |

**What I used to misunderstand:** <write this down as soon as you notice — this is the section you will revisit the most>

---

## 💻 Explained Examples

<!-- Each example: RUNNABLE code + line-by-line explanation of important parts + source link.
     Do not copy docs verbatim: adapt them to the Task Management domain of your project. -->

### Example 1: `TasksModule` — `controllers` + `providers` of a feature module

```ts
// file: src/tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  controllers: [TasksController],
  providers: [
    TasksService,
    {
      provide: 'TASK_ID_START',
      useFactory: (): number => 1,
    },
  ],
})
export class TasksModule {}
```

**Explanation:**

- `controllers: [TasksController]`: Nest will instantiate `TasksController` and register its `/tasks` route — this controller only "lives" within `TasksModule`'s scope.
- `providers: [TasksService, { provide: 'TASK_ID_START', ... }]`: both a class provider (`TasksService`) and a token-based custom provider (`'TASK_ID_START'`, covered in L03) are declared under the `providers` field — the Nest injector instantiates them when this module loads.
- No `imports` and no `exports`: this module doesn't need another module's providers yet, and no other module needs its `TasksService` yet — this matches the current Tasks domain, fully independent.

> 📖 Based on: https://docs.nestjs.com/modules#feature-modules — a real file from the repo, not the docs' `cats` example.

### Example 2: `AppModule` — only `imports`, not declaring a sub-domain's own controllers/providers

```ts
// file: src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule, TasksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**Explanation:**

- `imports: [UsersModule, TasksModule]`: `AppModule` doesn't know and doesn't need to know what `TasksController`/`TasksService` are — it just imports `TasksModule`, letting `TasksModule` handle its own declarations. This is exactly the goal of "splitting `TasksModule` out of `AppModule`".
- `controllers: [AppController]` / `providers: [AppService]`: `AppModule` still keeps its role as the root module with its own routes (`/`, health check...) — a root module isn't forbidden from having a controller/provider, it just shouldn't hold onto its sub-domains' controllers/providers.
- The order in `imports` doesn't matter to Nest (it resolves the dependency graph itself), but grouping by domain makes it easier to read.

> 📖 Based on: https://docs.nestjs.com/modules#feature-modules — the "import this module into the root module" section.

### Example 3: `exports` — sharing `TasksService` with a future module (illustration, not yet in the repo)

```ts
// file: src/tasks/tasks.module.ts (illustration if a later-lesson CommentsModule needs TasksService)
@Module({
  controllers: [TasksController],
  providers: [TasksService /* 'TASK_ID_START' provider ... */],
  exports: [TasksService], // <-- add this line WHEN another module actually needs it
})
export class TasksModule {}

// file: src/comments/comments.module.ts (does not exist yet — illustration only)
@Module({
  imports: [TasksModule], // receives the exact same TasksService instance as TasksModule
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
```

**Explanation:**

- Without adding `exports: [TasksService]`, `CommentsModule` — even with `imports: [TasksModule]` — still **cannot** inject `TasksService` — encapsulation blocks it, because `TasksService` hasn't been made public.
- `CommentsService` could then have `constructor(private tasksService: TasksService) {}` and call `this.tasksService.findOne(taskId)` to check whether the task exists — reusing the exact same singleton instance, the same current in-memory task list.
- This is an illustration of the concept, **not** a requirement to change `TasksModule` in this lesson — `CommentsModule` doesn't exist yet on the roadmap up to this lesson.

> 📖 Based on: https://docs.nestjs.com/modules#shared-modules

### Example 4: Dynamic module — `TasksModule.forRoot()` to seed data (concept, not implemented)

```ts
// illustrates the concept — NOT code you need to write in this lesson's hands-on
import { DynamicModule, Module } from '@nestjs/common';

@Module({
  controllers: [TasksController],
})
export class TasksModule {
  static forRoot(seedTasks: Task[] = []): DynamicModule {
    return {
      module: TasksModule,
      providers: [
        TasksService,
        { provide: 'TASK_ID_START', useFactory: (): number => 1 },
        { provide: 'SEED_TASKS', useValue: seedTasks },
      ],
      exports: [TasksService],
    };
  }
}

// app.module.ts would call it like this to pass sample data at startup:
// imports: [TasksModule.forRoot([{ id: 1, title: 'Demo', completed: false }])]
```

**Explanation:**

- `forRoot()` is a static method returning a `DynamicModule` — an object with `module: TasksModule` plus `providers`/`exports` like `@Module()`'s metadata, but **computed at call time** based on the `seedTasks` passed in.
- The difference from Example 1: `imports: [TasksModule]` (static) has no way to pass in `seedTasks`; `imports: [TasksModule.forRoot([...])]` (dynamic) does.
- The `TasksModule` currently in the repo **doesn't need** this pattern yet since there's no need for different configuration between imports — this example is only to understand the concept before encountering real `forRoot()`/`forFeature()` in packages like `TypeOrmModule`, `ConfigModule` later (roadmap `/fundamentals/dynamic-modules`).

> 📖 Based on: https://docs.nestjs.com/fundamentals/dynamic-modules#config-module-example

---

## 🛠 Hands-on

<!-- YOU code this section yourself. The Agent will not do it for you. -->

**Requirements:**

1. ...

**How to verify:**

```bash
pnpm start:dev
curl ...
```

**Where you might get stuck, and how to troubleshoot:**

- ...

---

## ✅ Review & Quiz

<!-- Fill this in after the /lesson-review step. Answer in your own words, DO NOT copy the answers.
     If you can't answer on your own, the lesson is not complete — go back to the Theory section. -->

1. **Question:** If you add `exports: [TasksService]` to `TasksModule` but **don't** add `TasksModule` to `CommentsModule`'s `imports`, can `CommentsModule` inject `TasksService`? Why?
   **Answer:** ...

2. **Question:** `TasksModule` currently does not use `@Global()`. What would change (for better and worse) if you added `@Global()` to `TasksModule` right now?
   **Answer:** ...

3. **Question:** If `TasksModule` became a dynamic module with `TasksModule.forRoot(seedTasks)`, how would the `imports` line in `AppModule` differ from the current `imports: [TasksModule]`? What in `TasksModule` would have to change to support that?
   **Answer:** ...

4. **Question:** The `'TASK_ID_START'` provider in `TasksModule` currently sits only in `providers`, not in `exports`. If `UsersModule` also wanted to use this token, what would you change — and is that good design?
   **Answer:** ...

5. **Question:** With Express, a route can see every service it can `require()`, with no boundary at all. With Nest, which providers can `TasksController` see? How does this affect how you debug a `Nest can't resolve dependencies of ...` error?
   **Answer:** ...

**Review the previous lesson:** L03 taught how to turn a class into a provider (`@Injectable()`) and inject it through a constructor; L04 teaches which module a provider "belongs to", which modules are allowed to see it, and how modules communicate through `imports`/`exports`.

---

## 🧠 Key Takeaways

<!-- Maximum 5 lines. This is the section you will review quickly before interviews. -->

1. `@Module()` has 4 main fields — `controllers`, `providers`, `imports`, `exports` — and encapsulates providers by default.
2. A feature module = a controller + service grouped by domain; the root module (`AppModule`) should only `imports`, not declare a sub-domain's own controllers/providers.
3. `exports` is a module's "public API" — only export a provider that another module **genuinely** needs; exporting too much breaks encapsulation.
4. `@Global()` is convenient but hides real dependencies — only use it for a provider nearly every module needs (logger, config...), not for a single domain's provider like `TasksService`.
5. A dynamic module (`forRoot`/`register`/`forFeature`) is only needed when a module must receive different configuration at import time — the current static `TasksModule` doesn't need this pattern yet.

---

## 📎 Sources

<!-- All links used. Official sources go first. -->

- [docs.nestjs.com/modules](https://docs.nestjs.com/modules)
- [docs.nestjs.com/modules#feature-modules](https://docs.nestjs.com/modules#feature-modules)
- [docs.nestjs.com/modules#shared-modules](https://docs.nestjs.com/modules#shared-modules)
- [docs.nestjs.com/modules#global-modules](https://docs.nestjs.com/modules#global-modules)
- [docs.nestjs.com/modules#dynamic-modules](https://docs.nestjs.com/modules#dynamic-modules)
- [docs.nestjs.com/fundamentals/dynamic-modules](https://docs.nestjs.com/fundamentals/dynamic-modules)
- [nestjs/nest — sample/25-dynamic-modules](https://github.com/nestjs/nest/tree/master/sample/25-dynamic-modules)
