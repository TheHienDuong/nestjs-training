# L02 — Controllers & Routing

|                  |                                                     |
| ---------------- | --------------------------------------------------- |
| **Phase**        | 1 — Foundations                                     |
| **Linear**       | NES-3                                               |
| **Branch**       | `duongthehien2001/nes-3-l02-controllers-routing`    |
| **Main docs**    | [/controllers](https://docs.nestjs.com/controllers) |
| **Date studied** | 2026-08-17                                          |

---

## 🗂 File map for this lesson

| File                                    | Role                                 | Created in lesson | Status              |
| --------------------------------------- | ------------------------------------ | ----------------- | ------------------- |
| `src/tasks/dto/create-task.dto.ts`      | Ref — DTO                            | L02               | New                 |
| `src/tasks/dto/update-task.dto.ts`      | Ref — DTO                            | L02               | New                 |
| `src/tasks/tasks.controller.spec.ts`    | Ref — unit test                      | L02               | New                 |
| `src/tasks/tasks.controller.ts`         | Ref — controller (teaching comments) | L02               | New                 |
| `src/tasks/tasks.module.ts`             | Ref — module                         | L02               | New                 |
| `src/tasks/tasks.service.ts`            | Ref — service                        | L02               | New                 |
| `test/tasks.e2e-spec.ts`                | Ref — e2e test                       | L02               | New                 |
| `src/app.module.ts`                     | Ref — registers TasksModule          | L00               | Modified (2nd time) |
| `docs/lessons/02-controllers/README.md` | Lesson note L02                      | L02               | New                 |
| `docs/lessons/02-controllers/SPEC.md`   | Spec from Linear                     | L02               | New                 |

> The most accurate map + line-by-line code reading (with line numbers): run `pnpm lesson 02`.
> Note: `pnpm lesson 02` pulls from the diff tag → may include 2 governance files mixed in (#31/#32) — this table is the canonical source per the PR #33/#34 diff.

---

## 🎯 Objectives

- [ ] Write `TasksController` yourself with GET/POST/PATCH/DELETE routes, correctly wired into `TasksModule`
- [ ] Explain how Nest builds the routing map from `@Controller()` + method decorators via `reflect-metadata`
- [ ] Distinguish `@Param` (resource identifier, required) from `@Query` (filter/sort/pagination, optional)
- [ ] Correctly use `ParseIntPipe` to both transform and validate a route param, and know why a DTO must be a `class`
- [ ] Explain why "thin controller" is the most important principle of this lesson, and the cost of using `@Res()` without `passthrough`

---

## 📚 Theory

### 1. What is a Controller — its architectural role

A controller is the **boundary interface layer** of a Nest application: it receives HTTP requests, determines which route handles them, and returns the response. Nest does **not** contain business logic here — the "thin controller" principle states that all business logic, DB access, and computation must be delegated to a **Provider** (Service); the controller only routes + extracts input + formats output.

Mechanically: a controller is an ordinary **class**, marked with the `@Controller(prefix?)` decorator. The decorator attaches metadata to the class; at bootstrap (`NestFactory.create(AppModule)`), Nest uses `reflect-metadata` to read all of this metadata and build the **routing map** — a table mapping `(HTTP method, path) → handler function`. This is a core difference from Express: Express registers routes in a functional style (`router.get(path, fn)`), while Nest uses a class + decorator model inspired by Angular, taking advantage of TypeScript's static typing and constructor-based dependency injection.

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('tasks')
export class TasksController {
  @Get()
  findAll(): string {
    return 'This action returns all tasks';
  }
}
```

**The final route path = the `@Controller()` prefix + the path in the method decorator.** For example `@Controller('products')` + `@Get('featured')` → `GET /products/featured`. The method name (`findAll`, `create`, ...) is entirely arbitrary — Nest does not read the method name, only the decorator.

> 📖 Source: NotebookLM §1, §2.1; original docs [Controllers — Routing](https://docs.nestjs.com/controllers#routing)

### 2. Controller ↔ Module ↔ Provider (the IoC picture)

A controller **must** be declared in the `controllers: []` array of a `@Module()` — otherwise, Nest doesn't know the class exists and won't mount any of its routes (404, even though the code has no syntax errors). Providers (services) are declared in `providers: []`, and Nest's **IoC Container** automatically manages the lifecycle of both controllers and providers — injected via the constructor, never manually `new`'d.

```typescript
// tasks.module.ts
import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
```

When `NestFactory.create(AppModule)` runs, Nest resolves the dependency graph (DAG) in a **bottom-up** direction: it initializes providers first, then injects them into the constructor of the controller that depends on them. Providers default to **singleton** — one instance shared across the whole application, unless a different injection scope is declared.

> 📖 Source: NotebookLM §1 (the Controller ↔ Module ↔ Provider section); original docs [Controllers — Getting up and running](https://docs.nestjs.com/controllers#getting-up-and-running)

### 3. HTTP method decorators + route parameter tokens

Nest provides decorators for every standard HTTP method: `@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()`, `@Options()`, `@Head()`, and `@All()` (matches every method). Routes with dynamic parameters use a `:name` token in the path.

```typescript
@Controller('tasks')
export class TasksController {
  @Get()
  findAll() {
    return 'This action returns all tasks';
  }

  @Get(':id')
  findOne(@Param() params: any) {
    console.log(params.id);
    return `This action returns task #${params.id}`;
  }
}
```

`@Param()` called with no argument → returns the **entire params object** (`{ id: '1' }`); called with a key (`@Param('id')`) → returns the **value directly**. A static route (`@Get('featured')`) must be declared **before** a dynamic route (`@Get(':id')`) — otherwise, the dynamic route will match first and "swallow" a request that should have belonged to the static route (see Pitfalls #1).

> 📖 Source: NotebookLM §2.2; original docs [Controllers — Resources](https://docs.nestjs.com/controllers#resources), [Route parameters](https://docs.nestjs.com/controllers#route-parameters)

### 4. `@Param('id', ParseIntPipe)` — transform + validate at the same time

A route param always arrives as a `string` (a property of URLs). `ParseIntPipe` is a **built-in pipe** that handles two roles at once:

1. **Transformation** — coerces `"123"` (string) → `123` (number).
2. **Validation** — if the string can't be parsed into a number, it automatically throws `BadRequestException` (400) **before** the handler is called.

```typescript
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return `This action returns task #${id}`;
}
```

Calling `GET /tasks/abc` returns:

```json
{
  "statusCode": 400,
  "message": "Validation failed (numeric string is expected)",
  "error": "Bad Request"
}
```

The `findOne` handler never runs with a malformed `id` value — the pipe blocks it at the "boundary" before it reaches the Service.

> 📖 Source: NotebookLM §2.3; original docs [Pipes — Built-in pipes](https://docs.nestjs.com/pipes#built-in-pipes), [Binding pipes](https://docs.nestjs.com/pipes#binding-pipes)

### 5. `@Query('key')` — fundamentally different from `@Param`

`@Query()` extracts parameters after the `?` in the URL. **Semantically**, this is the most important difference between `@Param` and `@Query`:

- `@Param` = a path parameter, **required**, used to **identify** a specific resource (`/tasks/101` → task #101).
- `@Query` = an **optional** parameter, used to filter, sort, or paginate a collection of resources (`/tasks?status=done&sort=desc`).

```typescript
@Get()
findAll(@Query('status') status?: string) {
  return `This action returns all tasks filtered by status: ${status}`;
}
```

> 📖 Source: NotebookLM §2.4, §3 (comparison table); original docs [Controllers — Query parameters](https://docs.nestjs.com/controllers#query-parameters)

### 6. `@Body()` + DTO — why it must be a `class`

A DTO (Data Transfer Object) is an object describing the structure of data sent over the network. Nest **recommends using a class**, not an interface, for a runtime reason: a TypeScript interface is **completely erased** when compiled to JavaScript (it only exists at compile-time), whereas a class remains a real constructor function at runtime. `ValidationPipe` (combining `class-validator` + `class-transformer`) needs to read the parameter's **metatype** at runtime to know how to transform/validate it — this is only possible when the DTO is a class.

```typescript
// create-task.dto.ts
import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  status?: string;
}
```

```typescript
@Post()
create(@Body() createTaskDto: CreateTaskDto) {
  return 'This action adds a new task';
}
```

Automatic validation mechanism: `class-transformer` converts the raw JSON payload into an instance of `CreateTaskDto`, `class-validator` checks each decorator (`@IsString`, `@MinLength`, ...); if it fails → `ValidationPipe` automatically throws `BadRequestException` (400). **Prerequisite:** you must enable `app.useGlobalPipes(new ValidationPipe())` in `main.ts` — if you forget, the decorators on the DTO just sit there with nothing executing the validation (see Pitfalls #2).

> 📖 Source: NotebookLM §2.5; original docs [Controllers — Request payloads](https://docs.nestjs.com/controllers#request-payloads); enabling `ValidationPipe` globally — [Techniques/Validation](https://docs.nestjs.com/techniques/validation) (`app.useGlobalPipes`, line 149 of the original file — **not part of the controllers page**, verified separately)

### 7. `@HttpCode` / `@Header` / `@Res()` — why Nest hides `req`/`res` by default

In **Standard** mode (recommended), Nest automatically serializes the return value to JSON and sets status 200 by default (201 for POST). `@HttpCode(code)` overrides the status; `@Header(key, value)` sets a static header:

```typescript
@Post()
@HttpCode(204)
@Header('Cache-Control', 'no-store')
create(@Body() createTaskDto: CreateTaskDto) {
  return 'This action adds a new task';
}
```

**Why Nest hides `req`/`res` by default:** to preserve **platform-agnosticism** — controller code doesn't depend on Express or Fastify. When you inject `@Res()` (or `@Response()`), Nest switches that route into **Library-specific mode**: you must call `res.send()`/`res.json()` yourself (otherwise the request hangs indefinitely), and it **disables** the entire Standard response mechanism for that route — including Interceptors, `@HttpCode()`, `@Header()`, `CacheInterceptor`. To use `@Res()` while still keeping these features, pass the `passthrough: true` option:

```typescript
@Get()
findAll(@Res({ passthrough: true }) res: Response) {
  res.cookie('session', 'abc');
  return []; // Nest still serializes JSON automatically, Interceptors still run
}
```

> 📖 Source: NotebookLM §2.6; original docs [Controllers — Status code](https://docs.nestjs.com/controllers#status-code), [Response headers](https://docs.nestjs.com/controllers#response-headers), [Request object](https://docs.nestjs.com/controllers#request-object) (the `@Res()`/`@Response()` table warns about Library-specific mode)

### 8. Route wildcards & redirect (extended — ⚠️ rarely used in the Task Management domain but present in the original docs)

`*` acts as a wildcard at the end of a path (`@Get('abcd/*')` matches `abcd/123`, `abcd/abc`...). As of Express v5, a wildcard **in the middle** of a route needs a name (`ab{*splat}cd`); Fastify **does not support** wildcards in the middle of a route — this is one of the rare places where platform-agnosticism breaks down. `@Redirect(url, statusCode)` redirects the response, defaulting to `statusCode = 302`; a return value of type `HttpRedirectResponse` can override this parameter for dynamic redirects.

> 📖 Source: original docs [Controllers — Route wildcards](https://docs.nestjs.com/controllers#route-wildcards), [Redirection](https://docs.nestjs.com/controllers#redirection) (not in the NotebookLM §1–§6 summary, cross-checked directly against the original file)

### 9. Request lifecycle & where Pipes fit

The order in which Nest processes a request: **Middleware → Guards → Interceptors (pre-controller) → Pipes → Route Handler**. A Pipe always runs **right before** the handler is called, after a Guard has allowed the request through and after the pre-controller Interceptor phase. When a pipe fails (e.g. `ParseIntPipe` can't parse the value), it throws an exception (`BadRequestException`) straight into the **default Exception Filter** — the handler is **never** called.

**Comparing the response shape between `ParseIntPipe` and `ValidationPipe` on failure** — both happen at the Pipes stage, both get blocked before the controller, both go through the same Exception Filter, but they differ in scope and error shape:

|             | `ParseIntPipe` (parameter-scoped)                                                     | `ValidationPipe` (global/controller/method-scoped)                                                |
| ----------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Scope       | A single parameter (`@Param`/`@Query`)                                                | The entire DTO (`@Body`), multiple fields at once                                                 |
| Error shape | `message` is **a single string** (`"Validation failed (numeric string is expected)"`) | `message` is **an array** — `class-validator` collects errors from every invalid field in the DTO |

> 📖 Source: NotebookLM round 2 (2026-08-17) §1 — `/tmp/l02-notebook-answer2.md`; cross-checked against the original docs [Pipes — Built-in pipes](https://docs.nestjs.com/pipes#built-in-pipes), [Exception filters](https://docs.nestjs.com/exception-filters) (⚠️ the exact step names "Middleware → Guards → Interceptors → Pipes" haven't been cross-checked directly against a single docs page — needs further verification at [/faq/request-lifecycle](https://docs.nestjs.com/faq/request-lifecycle) if available)

### 10. Promise vs Observable — return value & error propagation

A handler can return a `Promise` or an RxJS `Observable`; Nest handles them differently at the execution layer but **identically** at the error layer:

- **`Promise`**: Nest `await`s the handler, takes the resolved value, serializes it to JSON.
- **`Observable`**: Nest `subscribe`s automatically, waits for the stream to `complete`, and takes the **last** emitted value.
- **Error propagation**: whether a `Promise` rejects or an `Observable` emits an error, both end up at the same **Exception Filter** — for the same exception type (e.g. `NotFoundException`), the error response returned is **identical**, regardless of which async mechanism the handler uses.

```typescript
@Get()
async findAll(): Promise<Task[]> {
  return this.tasksService.findAll(); // Nest await + serialize
}

@Get()
findAllStream(): Observable<Task[]> {
  return this.tasksService.findAllAsStream(); // Nest subscribe + takes the last value
}
```

> 📖 Source: NotebookLM round 2 (2026-08-17) §4 — `/tmp/l02-notebook-answer2.md`; cross-checked against the original docs [Controllers — Asynchronicity](https://docs.nestjs.com/controllers#asynchronicity)

### 11. Custom pipes (`PipeTransform`) — how they differ from built-in ones

A built-in pipe (`ParseIntPipe`) is bound by passing the class token directly — `@Param('id', ParseIntPipe)` — Nest instantiates it automatically. A custom pipe implements the `PipeTransform` interface, is marked `@Injectable()`, and can be instantiated in two ways: `new MyPipe()` inline (no DI), or registered as a provider to take advantage of dependency injection (e.g. injecting a Service to check existence in the DB).

```typescript
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseTaskStatusPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    const allowed = ['todo', 'doing', 'done'];
    if (!allowed.includes(value)) {
      throw new BadRequestException(`"${value}" is not a valid task status`);
    }
    return value;
  }
}
```

The `transform(value, metadata)` signature:

- `value` — the raw value received (before transformation).
- `metadata: ArgumentMetadata` — includes `type` (`'body' | 'query' | 'param' | 'custom'`), `metatype` (the parameter's runtime type — **only meaningful when the DTO is a class**; if the DTO is declared as an interface, `metatype` will be `undefined`, reinforcing the reason from §6 for why a DTO must be a class), and `data` (the string passed in the decorator, e.g. `'id'` in `@Param('id')`).

The `return` value from `transform()` **replaces** the argument passed into the handler; if the pipe `throw`s, the exception goes through the same Exception Filter as a built-in pipe.

> 📖 Source: NotebookLM round 2 (2026-08-17) §7 — `/tmp/l02-notebook-answer2.md`; cross-checked against the original docs [Pipes — Custom pipes](https://docs.nestjs.com/pipes#custom-pipes)

---

## 🔄 Connecting to prior knowledge (Express ↔ Nest)

| Criteria            | Express                                       | Nest (Standard mode)                                                        | What's different                                                                                                     |
| ------------------- | --------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Registering a route | `router.get('/tasks/:id', (req, res) => ...)` | `@Get(':id')` in the class `@Controller('tasks')`                           | The route is attached to a class + decorator; Nest builds the routing map itself at bootstrap via `reflect-metadata` |
| Route params        | `req.params.id`                               | `@Param('id') id: string`                                                   | A pipe (`ParseIntPipe`) can be attached right at the declaration site to transform + validate                        |
| Query params        | `req.query.filter`                            | `@Query('filter') filter: string`                                           | `@Param` = required identifier, `@Query` = optional filter/sort/pagination                                           |
| Body                | `req.body`                                    | `@Body() dto: CreateTaskDto`                                                | The body must be described by a DTO **class** (not an interface) so the pipe can read the runtime metatype           |
| Status code         | `res.status(204).send()`                      | `@HttpCode(204)`                                                            | No need to inject `res`; Standard response is preserved (Interceptor, automatic serialization)                       |
| Custom header       | `res.set('Cache-Control', 'no-store')`        | `@Header('Cache-Control', 'no-store')`                                      | The header is declared statically right on the decorator                                                             |
| Redirect            | `res.redirect('https://nestjs.com')`          | `@Redirect('https://nestjs.com', 302)`                                      | Can be overridden dynamically by returning an `HttpRedirectResponse` object                                          |
| Response types      | `res.send()`/`res.json()` manually            | Auto-serializes JSON; supports `Promise`/RxJS `Observable` returns directly | Whether the handler is `async` or returns an `Observable`, Nest resolves/subscribes to it automatically              |

> 📖 Source: NotebookLM §3 (original table, with the "What's different" column added)

---

## 🔑 Key points

1. Route path = `@Controller()` prefix + method decorator path; the method name doesn't affect routing.
2. Static routes must be declared **before** dynamic routes (`:id`) — declaration order determines which route matches first.
3. A controller must be inside a Module's `controllers: []`, otherwise Nest won't mount its routes (silent 404).
4. `@Param` = resource identifier (required); `@Query` = filter/sort/pagination (optional).
5. A DTO must be a `class`, not an `interface` — because interfaces are erased at compile time, and pipes need the metatype at runtime.
6. `ParseIntPipe` (and the `Parse*` family) does both transform and validate right at the route param/query.
7. `ValidationPipe` must be enabled globally (`app.useGlobalPipes`) for decorators on the DTO to take effect.
8. `@HttpCode`/`@Header` handle status/headers without falling into `@Res()`'s library-specific mode.
9. `@Res()` without `passthrough: true` disables Interceptors, `@HttpCode`, and `@Header` for that route.
10. "Thin controller": business logic is always delegated to a Provider/Service; the controller only routes + formats I/O.
11. Pipes always run **after** Guards and Interceptors (pre-controller), right before the handler — request lifecycle: Middleware → Guards → Interceptors → Pipes → Handler.
12. For `PATCH` routes needing a partial update, use `PartialType()` from `@nestjs/mapped-types` instead of `skipMissingProperties: true` — it avoids mass-assignment risk and keeps the Swagger schema correct.
13. NestJS 11 bundles **Express v5** via `@nestjs/platform-express` — a trailing wildcard (`*`) is still compatible with both adapters, but a wildcard **in the middle** of a route requires named syntax (`*splat`) on Express 5 and is **not** supported by Fastify.

> 📖 Source: compiled from NotebookLM §1–§4 and the original controllers/pipes docs cited above; points 11–13 added from NotebookLM round 2 (2026-08-17) §1, §2, §8 — `/tmp/l02-notebook-answer2.md`

---

## 📝 Summary

A Controller in Nest is the boundary interface layer, connecting HTTP requests to business logic that lives in a Provider — not a place to hold that logic. Routes are determined statically at bootstrap via decorators (`@Controller` + method decorator); Nest leverages `reflect-metadata` to build the routing map instead of manually registering functions like Express does. Data-extraction decorators (`@Param`, `@Query`, `@Body`) directly replace `req.params`/`req.query`/`req.body`, along with the ability to attach a pipe to transform + validate right at the declaration point — this is a core strength over plain Express. Hiding `req`/`res` by default keeps the code platform-agnostic; `@Res()` should only be used when full control is truly needed, and `passthrough: true` should always be considered so Standard features (Interceptor, `@HttpCode`, `@Header`) aren't lost.

| Aspect           | Key point to remember                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------- |
| Architecture     | Controller = interface layer, thin; logic belongs to the Provider                             |
| Routing          | prefix + method path, static before dynamic, metadata read at bootstrap                       |
| Input decorators | `@Param` (identifier, required) / `@Query` (filter, optional) / `@Body` (DTO class)           |
| Pipes            | `ParseIntPipe` = transform + validate; `ValidationPipe` needs to be enabled globally for DTOs |
| Output control   | `@HttpCode`/`@Header` keep Standard mode; `@Res()` needs `passthrough` if you want to keep it |

> 📖 Source: compiled from NotebookLM §1–§4 + original docs [/controllers](https://docs.nestjs.com/controllers)

---

## ❓ Self-quiz (10–15 questions, with answers)

**Multiple choice:**

1. **Q:** Why should a DTO use `class` instead of `interface`?
   **A:** An interface is completely erased when compiled to JS — it no longer exists at runtime for a pipe to read its metatype; a class remains a real constructor at runtime.

2. **Q:** What is the default status code for a successful `POST` request (Standard mode, no `@HttpCode`)?
   **A:** 201 (Created) — unlike other methods, which default to 200.

3. **Q:** What happens if you use `@Res()` without passing `passthrough: true`?
   **A:** The route falls into Library-specific mode: Interceptors, `@HttpCode()`, `@Header()`, `CacheInterceptor` are disabled for that route; if you forget to call `res.send()`/`res.json()`, the request hangs.

4. **Q:** Should route `@Get(':id')` be declared before or after route `@Get('featured')`?
   **A:** After — the static route (`'featured'`) must be declared before the dynamic route (`:id`); otherwise `:id` will match `'featured'` first and the static route will never be reached.

5. **Q:** Which pipe both coerces string → number and validates, throwing 400 if parsing fails?
   **A:** `ParseIntPipe`.

6. **Q:** What does `@Param()` return if you don't pass a key?
   **A:** The entire route params object (e.g. `{ id: '1' }`), not a single value.

7. **Q:** For `class-validator` decorators on a DTO to actually run, what needs to be configured in `main.ts`?
   **A:** `app.useGlobalPipes(new ValidationPipe())` — without it, the decorators on the DTO are just inert annotations.

8. **Q:** What's the fundamental semantic difference between `@Query` and `@Param`?
   **A:** `@Param` identifies a specific resource and is required in the path; `@Query` is an optional parameter for filter/sort/pagination.

**Essay:**

9. **Q:** Why does the "thin controller" principle matter, and what should/shouldn't a controller contain?
   **A:** A controller should only route, extract input (`@Param`/`@Query`/`@Body`), call the Service, and format output. It should not contain business logic, direct DB queries, or business computation — that violates Single Responsibility, makes unit testing hard, and makes it hard to reuse logic elsewhere (e.g. a CLI, a cron job).

10. **Q:** Explain how Nest resolves dependencies when `NestFactory.create(AppModule)` runs.
    **A:** Nest builds a dependency graph (DAG) among Modules/Providers, resolving it bottom-up: it initializes Providers first, then injects them (via the constructor) into the Controller/Provider that depends on them. Providers default to a singleton shared across the whole application.

11. **Q:** What steps does the `ValidationPipe` + DTO class mechanism follow?
    **A:** `class-transformer` converts the raw JSON payload into an instance of the DTO class → `class-validator` checks each constraint decorator (`@IsString`, `@MinLength`...) → if any decorator fails, `ValidationPipe` automatically throws `BadRequestException` (400) before reaching the handler.

12. **Q:** How can you set a cookie via `res.cookie()` while still keeping the Standard response (return value auto-serialized)?
    **A:** Inject `@Res({ passthrough: true }) res: Response`, call `res.cookie(...)` to act on it directly, then still `return [...]` so Nest handles the rest like Standard mode.

13. **Q:** If you forget to declare `TasksController` in `TasksModule`'s `controllers: []`, what happens when you call its route?
    **A:** Nest doesn't know that controller exists and won't mount any of its routes — calling the request returns 404, even though the TypeScript code compiles and runs without errors.

14. **Q:** Why did Nest choose the class + decorator model instead of registering routes as functions like Express?
    **A:** To take advantage of TypeScript's static typing, constructor-based dependency injection, and explicit metadata declaration (`reflect-metadata`) — allowing other layers (pipes, guards, interceptors) to attach at the same declaration point consistently.

15. **Q:** What status code does `@Redirect()` return by default if `statusCode` isn't passed?
    **A:** 302 (Found).

**Round 2 (added 2026-08-17):**

16. **Q:** What's the difference in the **shape** of the error response between a `ParseIntPipe` failure and a `ValidationPipe` failure on a DTO?
    **A:** `ParseIntPipe` returns `message` as a single **string** (the error for 1 parameter); `ValidationPipe` returns `message` as an **array** — `class-validator` collects errors from every invalid field in the DTO.

17. **Q:** What is NestJS's recommended standard way to validate a DTO for a `PATCH` route (partial update), and why shouldn't you just use `skipMissingProperties: true`?
    **A:** Use `PartialType()` from `@nestjs/mapped-types` — it inherits from the original DTO, automatically making every field optional while still validating the format when a field is sent. `skipMissingProperties: true` carries a mass-assignment risk (it skips validation even for fields that should be required), throws off the Swagger schema, and if enabled globally affects every other `POST`/`PUT` too.

18. **Q:** When two routes conflict (`@Get(':id')` declared before `@Get('search')` in the same controller), does Nest warn at bootstrap?
    **A:** No. Nest doesn't log a warning at bootstrap — the bug only surfaces when a real request calls `search` and gets "swallowed" by the dynamic route `:id`; it can be caught earlier via Nest Devtools (the routing flow graph).

19. **Q:** In a DTO used for `@Query()` that combines multiple filter fields, which `class-transformer` decorator do you use to coerce a `string` query param into `number`/`boolean`?
    **A:** `@Type(() => Number)` or `@Type(() => Boolean)`, combined with `ValidationPipe({ transform: true })` so `class-transformer` (`plainToClass`) performs the coercion.

20. **Q:** What drawback does `@Res({ passthrough: true })` have related to caching when writing a controller?
    **A:** A route using `@Res()` (even with `passthrough: true`) **cannot** use `CacheInterceptor` — testing or expecting caching behavior on that route will be wrong.

> 📖 Source: NotebookLM §5 (10 original questions, rephrased + questions 13–15 added, cross-checked against the original controllers.md docs); questions 16–20 from NotebookLM round 2 (2026-08-17) §1, §2, §3, §5, §6 — `/tmp/l02-notebook-answer2.md`

---

## 🧠 Open questions

1. If the `TasksController` domain needs both `GET /tasks/export` (a static report export) and `GET /tasks/:id` routes at the same time, what's the correct declaration order, and what happens if it's declared wrong?
2. `@Res({ passthrough: true })` is a reasonable "escape hatch" — but if a team overuses it across most routes, what does that say about their controller architecture?
3. If `TasksController` and `ProjectsController` have Services with a circular dependency on each other, how does Nest handle it with `forwardRef()`, and is this a sign that the Module boundaries need to be split up again? _(⚠️ this content isn't on the `/controllers` page, see [Circular dependency](https://docs.nestjs.com/fundamentals/circular-dependency) — verified: `forwardRef()` lets Nest reference a class not yet defined, used when two Services `@Inject(forwardRef(() => ...))` each other)_
4. Does the project's Task Management API need API versioning (`@Version('2')`) starting from this lesson, or should it be deferred until there's an actual breaking change? _(⚠️ this content belongs to [Versioning](https://docs.nestjs.com/techniques/versioning) — `app.enableVersioning({ type: VersioningType.URI })`, not part of the `/controllers` page, verified to exist but not yet covered in any lesson)_
5. If the project later switches from the Express to the Fastify adapter, which parts of `TasksController` (written correctly in Standard mode) will need **no** changes, and which parts (if using a mid-route wildcard or `@Res()`) will have to be rewritten?
6. A route conflict between two controllers sharing the same prefix in two different modules is decided by Nest based on the `imports` declaration order in `AppModule` — if the Task Management domain later has multiple teams contributing modules, how can this kind of conflict be caught early before it causes a production bug? Is the Nest Devtools flow graph enough to build into the PR review process?
7. `whitelist: true` + `forbidNonWhitelisted: true` on `ValidationPipe` forces every field in a DTO to have at least one decorator (even just `@IsOptional()`), otherwise it's stripped or returns 400 — for a `Task` domain with many optional filters, should the tradeoff between safety (blocking unknown params) and convenience (easy to forget adding a decorator for a new field) lean one way or the other?
8. If a query field needs both `@Type(() => Number)` to coerce its type and validation of a valid value range (e.g. `limit` capped at 100), does the order in which `class-transformer` (`@Type`) and `class-validator` (`@Max`) are applied inside the same `ValidationPipe({ transform: true })` guarantee transform runs before validate, or do you need to write a custom pipe as in §11 to control the order?

> 📖 Source: NotebookLM §6 (questions 1, 3 modeled on the original edge case); questions 2, 4, 5 self-authored based on the project's Task Management domain — cross-checked against the original docs cited above; questions 6–8 added from NotebookLM round 2 (2026-08-17) §3, §5, §7 — `/tmp/l02-notebook-answer2.md` (⚠️ question 8 on the internal transform/validate order has no clear citation in the round-2 source — needs further verification in the original `class-validator`/`class-transformer` docs)

---

## ⚠️ Pitfalls

1. **Wrong static/dynamic route order:** `@Get(':id')` declared before `@Get('featured')` → a `GET /tasks/featured` request gets misread as `id = 'featured'`, and the static route is never called. **How to avoid it:** always declare static routes before parameterized routes.
2. **Forgetting to enable `ValidationPipe` globally:** missing `app.useGlobalPipes(new ValidationPipe())` in `main.ts` → `class-validator` decorators on the DTO (`@IsString`, `@MinLength`...) have no effect, and bad data still reaches the Service. **How to avoid it:** enable the global pipe from the very first lesson that has DTO validation.
3. **Putting business logic in the controller:** DB queries or business computation right inside a controller method → violates Single Responsibility, makes unit testing hard (you'd have to mock the whole HTTP layer), and makes it hard to reuse logic elsewhere. **How to avoid it:** move all logic into the Service; the controller only calls the Service.
4. **Overusing `@Res()` without `passthrough`:** loses all Standard response features (Interceptor, `@HttpCode`, `@Header`, `CacheInterceptor`); if you forget to call `res.send()` → the request hangs indefinitely. **How to avoid it:** only use `@Res()` when you truly need full control, and always consider `passthrough: true` first.
5. **Declaring a DTO with `interface` instead of `class`:** the interface is erased at compile time → `ValidationPipe` can't read the metatype → validation silently doesn't run (no error, no warning — dangerous because it's hard to detect). **How to avoid it:** always use `class` for DTOs; this is a mandatory convention, not optional.
6. **Circular dependency between two Modules/Services depending on each other:** the IoC Container can't resolve the initialization order → an error at bootstrap. **How to avoid it:** use `forwardRef()` on both directions of `@Inject()`, or preferably restructure the Module boundaries if the circular dependency is a sign of a design flaw (see Open Questions #3).
7. **Using `skipMissingProperties: true` as a "convenience" for PATCH — a mass-assignment risk:** enabling this flag on `ValidationPipe` skips validation even for fields that should require the correct format, not just missing fields; if enabled globally, it spreads to every other `POST`/`PUT`, not just the PATCH route. **How to avoid it:** use `PartialType()` from `@nestjs/mapped-types` for each Update DTO instead of flipping a global flag.
8. **A mid-route wildcard when switching adapters:** NestJS 11 bundles Express v5 — a mid-route wildcard (`ab/*cd`) requires named syntax `ab{*splat}cd`; Fastify **does not support** mid-route wildcards in any form. **How to avoid it:** avoid mid-route wildcards if there's any chance of switching adapters; only use a wildcard at the end of a path (`abcd/*`) — this is compatible with both.
9. **`@Res()` (even with `passthrough: true`) breaks `CacheInterceptor`:** a route using `@Res()` can't use Nest's automatic caching even with `passthrough` enabled, which easily causes confusion — "why isn't caching working" — when debugging. **How to avoid it:** if a route needs caching, avoid `@Res()`; if you must use it (e.g. to set a dynamic cookie), implement caching manually or accept that the route won't be cached.
10. **The old-style middleware wildcard (`.*`) is deprecated in Nest 11:** the old regex-style syntax is no longer consistent between Express 5 and Fastify. **How to avoid it:** use `*splat` (named wildcard) instead of `.*` in middleware declarations so the code runs correctly on both adapters.

> 📖 Source: NotebookLM §4 (pitfalls #1–#6); cross-checked against the original docs [Controllers](https://docs.nestjs.com/controllers), [Pipes](https://docs.nestjs.com/pipes), [Circular dependency](https://docs.nestjs.com/fundamentals/circular-dependency); pitfalls #7–10 added from NotebookLM round 2 (2026-08-17) §2, §8 — `/tmp/l02-notebook-answer2.md` (⚠️ pitfall #10 about the deprecated `.*` middleware — the round-2 source asserts this but it hasn't been cross-checked directly against the official changelog/`techniques/middleware` docs, needs further verification)

---

## 📎 Sources

- **NotebookLM (grounded in docs.nestjs.com/controllers)** — `/tmp/l02-notebook-answer.md`, used for: Theory §1–§6, the Express↔Nest comparison table, Key points, Summary, the multiple-choice+essay quiz, Open Questions #1/#3, Pitfalls.
- [docs.nestjs.com/controllers](https://docs.nestjs.com/controllers) — the official source, cross-checked directly for every concept; used specifically for Theory §8 (wildcard, redirect), which isn't in the NotebookLM summary.
- [docs.nestjs.com/pipes](https://docs.nestjs.com/pipes) — the Built-in pipes / Binding pipes section, for `ParseIntPipe`.
- [docs.nestjs.com/techniques/validation](https://docs.nestjs.com/techniques/validation) — `app.useGlobalPipes(new ValidationPipe())`, verified separately for Theory §6 and Pitfalls #2 (not part of the `/controllers` page).
- [docs.nestjs.com/techniques/versioning](https://docs.nestjs.com/techniques/versioning) — verified separately for Open Questions #4 (⚠️ not covered in any lesson yet, reference only).
- [docs.nestjs.com/fundamentals/circular-dependency](https://docs.nestjs.com/fundamentals/circular-dependency) — verified separately for Pitfalls #6 and Open Questions #3 (`forwardRef()`).
- NestJS version used in the repo: `@nestjs/core@11.2.1` (declared in `package.json`: `^11.0.1`).
- `src/users/users.controller.ts`, `src/users/dto/create-user.dto.ts` — an existing reference implementation in the repo (NES-2), used to cross-check the real pattern already running in the project (⚠️ doesn't use `class-validator` decorators yet, just a plain DTO — will be added in the validation lesson).
- **NotebookLM round 2 (2026-08-17)** — `/tmp/l02-notebook-answer2.md`, used for: Theory §9–§11 (request lifecycle & Pipes, Promise vs Observable, custom pipe), Key points #11–13, Quiz #16–20, Open Questions #6–8, Pitfalls #7–10.
- [docs.nestjs.com/controllers#asynchronicity](https://docs.nestjs.com/controllers#asynchronicity) — verified separately for Theory §10 (Promise vs Observable).
- [docs.nestjs.com/pipes#custom-pipes](https://docs.nestjs.com/pipes#custom-pipes) — verified separately for Theory §11 (custom `PipeTransform`).
- [docs.nestjs.com/exception-filters](https://docs.nestjs.com/exception-filters) — verified separately for Theory §9 (Exception Filter catching errors from a Pipe).
