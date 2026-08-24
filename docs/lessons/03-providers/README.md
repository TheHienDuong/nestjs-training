<!-- TEMPLATE LESSON NOTE — copy this entire file when opening a new lesson. The /lesson-start skill will copy it and fill in the header. Do not delete any section: each section has its own pedagogical reason, recorded in the comment. -->

# L03 — Providers & Dependency Injection

|                |                                                             |
| -------------- | ----------------------------------------------------------- |
| **Phase**      | 1 — NestJS Fundamentals                                     |
| **Linear**     | NES-4                                                       |
| **Branch**     | `duongthehien2001/nes-4-l03-providers-dependency-injection` |
| **Main docs**  | https://docs.nestjs.com/providers                           |
| **Study date** | 2026-08-21                                                  |

> WARNING Disclaimer - Hermes/Claude execution substitute (2026-08-24): The Hands-on and Review & Quiz sections below were executed by Hermes/Claude Code as a substitute, under a one-time user-approved exception (2026-08-24) to close remaining gaps in L01-L03. This is execution-substitute evidence - real tests/API calls run, real output read, quiz answers reasoned by the agent - it is NOT confirmation that Hien Duong personally performed this hands-on/quiz work. No application behavior changed beyond what already existed in `src/` - all verification only **reads** and **calls** the custom provider/injection scope reference that already existed since lesson 04 (NES-5); no code was edited.

---

## 🗂 Lesson file map

The most accurate map, with each code file and its line numbers: run `pnpm lesson <NN>`.
This table is a quick-reading summary; update it when the lesson is complete.

| File                            | Role (theory / ref / hands-on)                                         | Created in lesson | Status                                      |
| ------------------------------- | ---------------------------------------------------------------------- | ----------------- | ------------------------------------------- |
| `src/tasks/tasks.service.ts`    | Ref — `@Injectable()` provider, default singleton, Task business logic | L02 (NES-3)       | Existing, used as an example for L03 theory |
| `src/tasks/tasks.controller.ts` | Ref — constructor injection of `TasksService`, thin controller         | L02 (NES-3)       | Existing, used as an example for DI         |
| `src/tasks/tasks.module.ts`     | Ref — provider registration                                            | L02 (NES-3)       | Existing, used for the L03 hands-on         |

## 🎯 Objectives

<!-- Objectives: observable outcomes are more useful than a list of topics. The previous lesson used routes and CRUD as evidence of progress; this lesson uses provider and DI behavior. -->

- [x] Explain how the IoC container and dependency injection through a constructor work in Nest
- [x] Write an `@Injectable()` provider (`TasksService`) with singleton scope (the default)
- [x] Inject `TasksService` into `TasksController` through the constructor, without creating an instance with `new`
- [x] Move all task business logic from the controller to `TasksService`, keeping the controller responsible only for HTTP (thin controller)

> Checked based on the execution evidence in the Hands-on section below (real tests + real API calls) - see the disclaimer at the top of this file.

## 📚 Theory

<!-- Explain in English, in this order: PROBLEM first, SOLUTION second. Each concept must link to the exact original docs section for later reference. Avoid translating the docs mechanically — write as if teaching someone sitting beside you. -->

### Concept 1: IoC container & Dependency Injection through a constructor

**The problem it solves:** If `TasksController` directly does `new TasksService()` inside its constructor, the controller must know how `TasksService` is created (whether it needs configuration, what other dependencies it has). When `TasksService` later needs another dependency (for example, a logger), every place that does `new TasksService(...)` must change. That is **tight coupling between the place that uses an object and the place that creates it**.

**How Nest does it:** Nest has an **IoC (Inversion of Control) container** — a registry that runs while the app bootstraps and knows how to create instances for classes marked as providers. A class only declares what it needs through its constructor:

```ts
constructor(private readonly tasksService: TasksService) {}
```

Nest sees that `TasksController` needs a `TasksService`, looks up the `TasksService` token in the registered provider list, resolves the instance, and injects it — the controller never calls `new`.

**When NOT to use it:** When a class has no dependencies (a pure function/helper), it does not need `@Injectable()` — wrapping dependency-free things in DI is unnecessary. Nest also supports property-based injection (`@Inject()` on a field) for a class inherited through several levels where passing dependencies through `super()` becomes cumbersome, but the docs recommend **preferring constructor injection** because it is clearer.

📖 Source: [docs.nestjs.com/providers](https://docs.nestjs.com/providers), [docs.nestjs.com/fundamentals/custom-providers#di-fundamentals](https://docs.nestjs.com/fundamentals/custom-providers)

---

### Concept 2: `@Injectable()` and singleton scope (the default)

**The problem it solves:** If Nest creates a new `TasksService` for every request, the `tasks` list (stored in a class property) disappears after each request because the old instance is garbage-collected. We need an instance that lives for the entire app lifetime to keep state (or a connection pool, cache, and so on).

**How Nest does it:** `@Injectable()` adds metadata to the class so the IoC container knows that the class can be managed. By default, every provider has `Scope.DEFAULT`: one instance for the whole application. Therefore the `tasks` and `nextId` properties in `TasksService` (`src/tasks/tasks.service.ts:14`) survive across requests. The alternative `REQUEST` scope creates a new instance for each request.

📖 Source: [docs.nestjs.com/providers#services](https://docs.nestjs.com/providers), [docs.nestjs.com/fundamentals/injection-scopes](https://docs.nestjs.com/fundamentals/injection-scopes)

---

### Concept 3: Provider registration in a module

**The problem it solves:** The IoC container needs an explicit declaration of which providers a module owns.

**How Nest does it:** `@Module({ providers: [...] })` is that declaration. `src/tasks/tasks.module.ts` declares `providers: [TasksService]` — this short syntax is shorthand for:

```ts
providers: [
  {
    provide: TasksService, // token — the key used for lookup
    useClass: TasksService, // the actual value returned when the token is injected
  },
],
```

When `TasksController` declares `constructor(private readonly tasksService: TasksService)`, Nest uses the `TasksService` class as the **token**, looks in the providers of the module containing the controller, finds a match, and resolves it through `useClass`. The short form `providers: [TasksService]` is valid when the token and class are the same — the most common case.

**When NOT to use the short form:** When the token differs from the real class (for example, for a test mock, or when the token is a string/symbol), use the full form with `useValue`/`useClass`/`useFactory` (Concept 4).

> 📖 Source: [docs.nestjs.com/fundamentals/custom-providers#standard-providers](https://docs.nestjs.com/fundamentals/custom-providers)

---

### Concept 4: Custom providers — `useValue`, `useClass`, `useFactory`, `useExisting`

**The problem it solves:** Not every provider is simply “an instance of itself.” Sometimes we need to (a) replace the real `TasksService` with a mock during a test, (b) choose different class implementations according to `NODE_ENV`, (c) create a value that must be calculated during bootstrap (read configuration, open a connection), or (d) add another name for an existing provider.

**How Nest does it:** The four provider forms are `useValue`, `useClass`, `useFactory`, and `useExisting`. A factory can create a calculated value once at bootstrap:

```ts
// file: src/tasks/tasks.module.ts (illustration, not real repository code)
export const TASK_ID_GENERATOR = 'TASK_ID_GENERATOR';

@Module({
  controllers: [TasksController],
  providers: [
    TasksService,
    // useFactory: calculate the value at bootstrap; here it is a closure with its own counter.
    {
      provide: TASK_ID_GENERATOR,
      useFactory: () => {
        let nextId = 1;
        return () => nextId++;
      },
    },
  ],
})
export class TasksModule {}
```

```ts
// file: src/tasks/tasks.service.ts (constructor illustration, not real repository code)
@Injectable()
export class TasksService {
  constructor(
    // The token is a string ('TASK_ID_GENERATOR'), not a class, so @Inject() is REQUIRED.
    @Inject(TASK_ID_GENERATOR) private readonly generateId: () => number,
  ) {}
}
```

In a unit test, `useValue` replaces the real `TasksService` entirely:

```ts
// illustration of a test mock, not the current spec's real code
const module = await Test.createTestingModule({
  controllers: [TasksController],
  providers: [{ provide: TasksService, useValue: { findAll: () => [] } }],
}).compile();
```

**When NOT to use it:** If you only need “one class, injected as itself,” use the short form `providers: [TasksService]` — the longer syntax only adds noise. A TypeScript interface cannot be used as a token because it is erased at compile time — use a string/`Symbol`, or an `abstract class` when you want one construct to serve as both type and token without `@Inject()`.

📖 Source: [docs.nestjs.com/fundamentals/custom-providers](https://docs.nestjs.com/fundamentals/custom-providers)

---

### Concept 5: Injection scopes `DEFAULT` (singleton) vs `REQUEST` vs `TRANSIENT`

**The problem it solves:** Most providers should be singletons (fast and inexpensive). Some problems need state **isolated per request**, such as multi-tenancy (each request belongs to a different tenant) or request tracking (logging a request ID).

**How Nest does it:** `@Injectable({ scope })` accepts three values from the `Scope` enum:

- `Scope.DEFAULT`: singleton, one instance for the whole application (the default; no declaration needed).
- `Scope.REQUEST`: a new instance for **each request**, garbage-collected after the request ends. Request scope “bubbles up”: if `TasksService` is request-scoped, `TasksController` also becomes request-scoped when it injects it.
- `Scope.TRANSIENT`: each **consumer** that injects this provider receives its own instance (not shared between consumers and not tied to a request).

Example: a request-scoped service that logs with the original request:

```ts
// illustration: a request-scoped provider reading the original request
import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  getRequestId(): string {
    return (this.request.headers['x-request-id'] as string) ?? 'unknown';
  }
}
```

If `TasksService` injects this `RequestContextService`, both `TasksService` and the `TasksController` above automatically become request-scoped, even if nobody declares `scope: Scope.REQUEST` on them.

**When NOT to use it:** `REQUEST` scope slows the app because Nest must create an instance for every request — the docs recommend using it **only when truly necessary**; the default should always be singleton. `TRANSIENT` is not appropriate for a provider that needs shared state (such as a connection pool). Never put a WebSocket Gateway in a non-singleton scope — a gateway represents a real socket and cannot be recreated many times.

📖 Source: [docs.nestjs.com/fundamentals/injection-scopes](https://docs.nestjs.com/fundamentals/injection-scopes)

---

### Concept 6: Compared with manually managing dependencies in Express

**The problem it solves:** Express has no container concept for managing dependencies — everything is wired by hand.

**How Nest does it:** Nest replaces `require()`/manual `new` with a dependency graph built during bootstrap. Nest analyzes the constructors of all providers (transitively — if `TasksService` depends on something else, that dependency is resolved too), then initializes them in the correct bottom-up order. Wiring (who needs whom) is separate from business logic.

**When NOT to use it:** For a one-off script or a very small app (one file, with no chain of dependent classes), manually using `require()`/creating instances can be simpler — a DI container becomes worthwhile as the number of dependencies and the need for testing/mocking increase.

> 📖 Source: [docs.nestjs.com/fundamentals/custom-providers#di-fundamentals](https://docs.nestjs.com/fundamentals/custom-providers)

---

## 🔗 Connect to prior knowledge

<!-- The most important section of the entire note. Fast learning means anchoring new knowledge to what is already known. Always compare with Express, Prisma, and hexagonal architecture. -->

| Existing knowledge                                                                                                                  | NestJS equivalent                                                                                                      | What differs                                                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Express: `const tasksService = require('./tasksService')`, then pass it into the route handler (or manually `new TasksService(db)`) | Nest: declare `constructor(private readonly tasksService: TasksService)`, and the IoC container resolves it            | In Express the developer is responsible for instance creation order and manual passing; at bootstrap the Nest container builds the dependency graph, and the developer only declares “what I need”                                     |
| Prisma: `export const prisma = new PrismaClient()` in one file, imported throughout the app to reuse one connection pool            | Nest: a provider is a singleton by default (`Scope.DEFAULT`); the IoC container caches and returns one instance        | The Prisma singleton is achieved by convention (a module-level export and remembering not to call `new` again); the Nest singleton is **the framework default**, needs no convention, and can become `REQUEST`/`TRANSIENT` when needed |
| Express middleware: attach `req.tenantDb = getDbForTenant(req)` on each request for a tenant-specific connection                    | Nest: a `Scope.REQUEST` provider injects the `REQUEST` token, reads the header, and creates a new instance per request | Express manually attaches a property to `req` without type safety; Nest DI creates the request-scoped instance at the right time with types, but changes the whole provider chain above it to request scope (performance impact)       |

**What I previously misunderstood:** <write this as soon as you discover it — this is the section you will reread most often>

---

## 💻 Explained examples

<!-- Each example: runnable code + explain each important line. -->

### Example 1: Register a provider and inject it into a controller

```ts
// file: src/tasks/tasks.module.ts
@Module({
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
```

```ts
// file: src/tasks/tasks.service.ts
@Injectable()
export class TasksService {
  private readonly tasks: Task[] = [];
  private nextId = 1;
  // ...
}
```

```ts
// file: src/tasks/tasks.controller.ts
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}
  // ...
}
```

**Explanation:**

- `providers: [TasksService]` in `tasks.module.ts`: registers the `TasksService` token with the IoC container, shorthand for `{ provide: TasksService, useClass: TasksService }`.
- `@Injectable()` on `TasksService`: marks the class as container-managed, with `DEFAULT` (singleton) scope by default.
- `constructor(private readonly tasksService: TasksService)` in `TasksController`: declares the dependency by type; Nest looks up the `TasksService` token, resolves it, and injects it. The controller never calls `new TasksService()`.

📖 Based on: `src/tasks/tasks.module.ts`, `src/tasks/tasks.service.ts`, `src/tasks/tasks.controller.ts`; pattern from [docs.nestjs.com/providers#provider-registration](https://docs.nestjs.com/providers)

---

### Example 2: Business logic belongs in the service; the controller only delegates (thin controller)

```ts
// file: src/tasks/tasks.controller.ts
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number): Task {
  return this.tasksService.findOne(id);
}
```

```ts
// file: src/tasks/tasks.service.ts
findOne(id: number): Task {
  const task = this.tasks.find((item) => item.id === id);
  if (!task) throw new NotFoundException(`Task ${id} not found`);
  return task;
}
```

**Explanation:**

- `findOne` in the controller does **not** know how the task is searched for or stored — it receives an `id` transformed by `ParseIntPipe`, then calls `this.tasksService.findOne(id)`. This is the “controller handles HTTP only” boundary in this lesson.
- All business decisions — searching the array and deciding when the result is a 404 — live in `TasksService`. If storage changes from in-memory data to Prisma, only `TasksService` changes; `TasksController` does not change by one line.
- A `NotFoundException` thrown by the service is automatically converted by Nest to HTTP 404 — the controller does not need `try/catch`.

📖 Based on: `src/tasks/tasks.controller.ts`, `src/tasks/tasks.service.ts` — principle from [docs.nestjs.com/providers](https://docs.nestjs.com/providers) (“Controllers should handle HTTP requests and delegate more complex tasks to providers”)

---

### Example 3: A singleton keeps state between requests — verify with curl

```ts
// file: src/tasks/tasks.service.ts
export class TasksService {
  private readonly tasks: Task[] = []; // lives for the app lifetime; does not reset per request
  private nextId = 1;
}
```

**Explanation:**

- Because `TasksService` is a singleton (`Scope.DEFAULT` by default), Nest creates only **one** instance when the app bootstraps. The `tasks`/`nextId` properties live in that instance for the app lifetime.
- Call `POST /tasks` twice in a row (two different HTTP requests, possibly from two terminals): the second task still sees `nextId` increased by the previous request, and the third `GET /tasks` still sees both tasks. If `TasksService` uses `Scope.REQUEST`, every request gets a new `tasks = []`, so data posted earlier “disappears” in the next request.

```bash
pnpm start:dev
curl -X POST localhost:3000/tasks -H 'Content-Type: application/json' -d '{"title":"Learn DI"}'
curl -X POST localhost:3000/tasks -H 'Content-Type: application/json' -d '{"title":"Write SPEC"}'
curl localhost:3000/tasks # should show both tasks, proving state is preserved between requests
```

> 📖 Based on: `src/tasks/tasks.service.ts` — [docs.nestjs.com/fundamentals/injection-scopes](https://docs.nestjs.com/fundamentals/injection-scopes)

---

## 💻 Hands-on

<!-- The learner implements this in the repo, then uses /lesson-review. Do not write the solution here. -->

> The evidence below was run for real under the 2026-08-24 exception (see the disclaimer at the top of this file) - **read-and-call only** against the custom provider/injection scope reference already present in `src/tasks/` (added in lesson 04, NES-5); no code was edited.

**Requirements (performed under the exception):**

1. Confirm `TasksService` receives its dependency via constructor injection, never `new`-ed directly - see `src/tasks/tasks.controller.ts:16` (`constructor(private readonly tasksService: TasksService)`).
2. Confirm the custom provider (string token, `useFactory`) works exactly as Concepts 3-4 describe: `src/tasks/tasks.module.ts` declares `{ provide: 'TASK_ID_START', useFactory: (): number => 1 }`, and `src/tasks/tasks.service.ts` receives it via `@Inject('TASK_ID_START') taskIdStart: number` in its constructor - matching the "non-class token requires `@Inject()`" pattern.
3. Confirm singleton scope keeps state across multiple real HTTP requests (not just inside a test).

**How to check:**

```bash
pnpm test        # tasks.service.spec.ts: "receives the custom provider value through constructor DI"
pnpm test:e2e     # tasks.e2e-spec.ts: full CRUD flow over real HTTP

pnpm build && node dist/main
curl -X POST localhost:3000/tasks -H 'Content-Type: application/json' -d '{"title":"Learn DI"}'
curl -X POST localhost:3000/tasks -H 'Content-Type: application/json' -d '{"title":"Write SPEC"}'
curl -i localhost:3000/tasks
```

**Real results (2026-08-24):**

- `pnpm test`: 6/6 test suites pass (14 tests), including `TasksService` - the test using `useValue: 100` for the `'TASK_ID_START'` token confirms constructor injection with a custom provider **can be replaced** during testing, exactly per Concept 4 (mocking via `useValue` requires no change to `TasksService`).
- `pnpm test:e2e`: 3/3 pass, including the full `/tasks` CRUD flow (create -> list -> get-one -> patch -> delete -> 404 after deletion).
- Real API (app run from `dist/`, **not a test**): the first `POST /tasks` returned `{"id":1,"title":"Learn DI","completed":false}`; the second returned `{"id":2,...}` - proving the real `useFactory` in `TasksModule` (returning `1`, unlike the `100` used only in the unit test) initializes `nextId` correctly, and **both** tasks remained in `GET /tasks` on the third request - exactly as Example 3 describes: `TasksService` is a singleton (`Scope.DEFAULT`), its state (`tasks[]`, `nextId`) lives for the app's lifetime and is not reset between different requests.

**Where you might get stuck, and how to fix it:** It's easy to mistake the `id` starting at `100` (the value used in the unit test) for real app behavior - but that value is a **mock** override via `useValue: 100`, only present in `tasks.service.spec.ts`. The real app always uses the `useFactory` declared in `tasks.module.ts` (which returns `1`). This is a live demonstration of Concept 4: the same token, two different values depending on where the provider is registered (the real module vs. a testing module).

---

## ✅ Review & Quiz

<!-- Complete this after /lesson-review. Answer in your own words; do not copy the answers. If you cannot answer independently, the lesson is not complete — return to the Theory section. -->

> The answers below are Hermes/Claude Code execution-substitute evidence (see the disclaimer at the top of this file), checked directly against the real `src/tasks/` code and the results in the Hands-on section.

1. **Question:** `TasksController` declares `constructor(private readonly tasksService: TasksService)` but there is no line calling `new TasksService()`. Who creates that instance, and how does it know which class to create?

**Answer:** Nest's IoC container creates that instance when `NestFactory.create(AppModule)` runs. Nest reads the constructor parameter's type via `reflect-metadata` (type `TasksService`), uses that class itself as the **token**, looks it up in `TasksModule`'s `providers: [TasksService, ...]` - finds a match, resolves it via `useClass: TasksService` (the full form of the short declaration), creates the instance, and injects it into `TasksController`'s constructor.

2. **Question:** Why does `TasksService` keep the task list across multiple HTTP requests when each request is a completely new function call?

**Answer:** Because `@Injectable()` doesn't declare a `scope`, it defaults to `Scope.DEFAULT` (singleton) - Nest creates only **one** `TasksService` instance at app bootstrap and reuses it for **every** request. The `tasks: Task[]` and `nextId` properties live inside that single instance, not scoped to any particular request - proven live in Hands-on: two consecutive `POST /tasks` calls (two separate HTTP requests) return `id: 1` then `id: 2` incrementing, and the third `GET /tasks` sees both.

3. **Question:** What full syntax is `providers: [TasksService]` inside `@Module` shorthand for? When must the full form be written?

**Answer:** Shorthand for `{ provide: TasksService, useClass: TasksService }` - valid only when the token and class are the same. The full form is required when: the token differs from the actual class (for example a string token like `'TASK_ID_START'` in the repo's real `tasks.module.ts`), you need `useValue`/`useFactory` to compute a value at bootstrap or mock it in a test, or you need `useExisting` to alias two tokens to the same instance.

4. **Question:** If `TasksService` changes to `@Injectable({ scope: Scope.REQUEST })`, what happens to `TasksController`, and why?

**Answer:** `TasksController` automatically becomes request-scoped too, even without declaring any `scope` for it itself - Nest's "bubble up" mechanism: any class that injects a request-scoped provider is pulled into request scope as well, because Nest must rebuild the entire dependency chain for every request to obtain a fresh instance of that request-scoped provider. Consequence: both `TasksController` and `TasksService` would be recreated per request -> the `tasks[]` array would be **lost** after every request (the exact opposite of current behavior), and the app would be slower due to repeated object initialization.

5. **Question:** To inject a provider whose token is a string (for example, `'TASK_ID_GENERATOR'`) into a constructor, which decorator must be added beyond the parameter type? Why is a class/interface often not enough as a token?

**Answer:** You must use `@Inject('TASK_ID_GENERATOR')` - exactly as the real code in `tasks.service.ts` does: `constructor(@Inject('TASK_ID_START') taskIdStart: number)`. Reason it's required: when the token is a class, Nest can infer the type directly from parameter metadata (`reflect-metadata` can read it because the class still exists at runtime); but `number`/`string` are primitive types, and **an interface is completely erased at compile time** - there is nothing left at runtime for Nest to infer a token from. `@Inject()` explicitly pins the token, independent of type inference from the parameter.

**Review the previous lesson:** L02 wrote `TasksController` with CRUD routes and (without explaining why) already placed `@Injectable()` on `TasksService` — L03 explains the mechanism behind that decision: IoC container, token, and scope.

---

## ✅ Key takeaways

- The IoC container creates and resolves providers according to the dependency graph.
- `@Injectable()` marks a class as a provider; the default scope (`Scope.DEFAULT`) is singleton.
- `providers: [TasksService]` is shorthand for `provide: TasksService, useClass: TasksService`.
- A non-class token such as a string/symbol requires `@Inject()` in the constructor.
- `Scope.REQUEST` makes the provider — and dependent providers above it — request-scoped.

---

## 📚 Sources

<!-- Keep the official sources first. -->

- [docs.nestjs.com/providers](https://docs.nestjs.com/providers)
- [docs.nestjs.com/fundamentals/custom-providers](https://docs.nestjs.com/fundamentals/custom-providers)
- [docs.nestjs.com/fundamentals/injection-scopes](https://docs.nestjs.com/fundamentals/injection-scopes)

---

<!-- CO-OP TRANSLATOR DISCLAIMER START -->

**Disclaimer**: This document was translated using the AI translation service [Co-op Translator](https://github.com/Azure/co-op-translator). While we strive for accuracy, please be aware that automated translations may contain errors or inaccuracies. The original document in its native language should be considered the authoritative source. For critical information, professional human translation is recommended. We are not liable for any misunderstandings or misinterpretations arising from the use of this translation.

<!-- CO-OP TRANSLATOR DISCLAIMER END -->
