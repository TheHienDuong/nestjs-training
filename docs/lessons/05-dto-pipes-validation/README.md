# L05 — DTO + Pipes + ValidationPipe

|                |                                                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Phase**      | 2 — Working with Data                                                                                             |
| **Linear**     | NES-6 (sub-issue: NES-57 Theory & note · NES-60 Hands-on · NES-65 Review & quiz)                                  |
| **Branch**     | `duongthehien2001/nes-6-l05-dto-pipes-validationpipe`                                                             |
| **Main docs**  | [/techniques/validation](https://docs.nestjs.com/techniques/validation) · [/pipes](https://docs.nestjs.com/pipes) |
| **Study date** | 2026-08-25                                                                                                        |

> 📝 **The entire Hands-on + Quiz section of this lesson was executed as a substitute**, not "you did it yourself" as the original scaffold intends. Read the disclaimer right below before reading further — it is a statement with real effect.

> ⚠️ **Disclaimer — execution substitute (2026-08-25):** The **🛠 Hands-on** section (NES-60: DTO validation, a global `ValidationPipe`, a custom pipe, a test case for invalid → 400) was **executed as a substitute by Hermes/Codex** via PR #78 (`Fixes NES-6`, branch `codex/nes-6-dto-pipes-validation`, merge commit `b3086f4`). The **✅ Review & Quiz** section (NES-65) was **executed as a substitute by Claude Code** in the closeout step right after, based on reading back the PR #78 diff and the original docs — not answers Hien Duong came up with personally. Both fall under the **one-time user-approved exception (approved one-time exception, 2026-08-25)** because the user was busy. This is **execution-substitute evidence**: real code ran, tests really passed (`pnpm test` 7 suites/20 tests, `pnpm test:e2e` 3 suites/13 tests, `pnpm verify` PASS), quiz reasoning based on real code — **NOT** confirmation that Hien Duong personally coded the hands-on or personally answered this quiz. To learn for real, redo the hands-on and answer the quiz yourself before reading the section below.

---

## 🗂 Lesson file map

> The most accurate map + reading each code file (with line numbers): run `pnpm lesson 05`.
> This table is a quick-reading summary; update it when the lesson is complete.

| File                                                         | Role (theory / ref / hands-on)                                 | Created in lesson | Status                                   |
| ------------------------------------------------------------ | -------------------------------------------------------------- | ----------------- | ---------------------------------------- |
| `docs/lessons/05-dto-pipes-validation/README.md`             | Theory + hands-on guide + quiz                                 | L05               | Merged (PR #78)                          |
| `docs/lessons/05-dto-pipes-validation/SPEC.md`               | NES-6 snapshot + acceptance criteria for the reference impl    | L05               | Merged (PR #78)                          |
| `package.json` / `pnpm-lock.yaml`                            | Added `class-validator` + `class-transformer`                  | —                 | ✅ Merged (PR #78, execution substitute) |
| `src/tasks/dto/create-task.dto.ts`                           | Hands-on — added validation decorators for `title`             | L04               | ✅ Merged (PR #78, execution substitute) |
| `src/tasks/dto/update-task.dto.ts`                           | Hands-on — every field optional + rule for `completed`         | L04               | ✅ Merged (PR #78, execution substitute) |
| `src/tasks/tasks.controller.ts`                              | Hands-on — changed `import type` DTOs to a value import        | L02               | ✅ Merged (PR #78, execution substitute) |
| `src/app.module.ts`                                          | Hands-on — registered a global `ValidationPipe` via `APP_PIPE` | L01 / L04         | ✅ Merged (PR #78, execution substitute) |
| `src/tasks/pipes/parse-completed-query.pipe.ts` + `.spec.ts` | Hands-on — self-written custom pipe + unit test                | L05               | ✅ Merged (PR #78, execution substitute) |
| `test/tasks.e2e-spec.ts`                                     | Hands-on — added a DTO-invalid → 400 case                      | L04               | ✅ Merged (PR #78, execution substitute) |

---

## 🎯 Objectives

<!-- 3-5 measurable bullet points. "Understand controllers" is not measurable.
     "Be able to write a controller with 5 CRUD routes, and explain @Param vs @Query" is measurable. -->

- [x] Be able to write `CreateTaskDto` / `UpdateTaskDto` using `class-validator` decorators, and explain why a DTO must be a **class**, not an `interface` or a `type`.
- [x] Enable a global `ValidationPipe` and clearly state the behavioral difference between `whitelist`, `forbidNonWhitelisted`, and `transform` — what each option blocks or changes.
- [x] Write a custom pipe implementing `PipeTransform`, bind it at the right scope, and explain why a pipe runs _after_ a guard but _before_ the handler.
- [x] Prove with tests: a request with an invalid DTO returns **HTTP 400** with a `message` describing the failing field, and a request with an extra field is either stripped or rejected according to the configuration.
- [x] Point out 2 real traps in this repo: `import type` for DTOs, and e2e tests not running the code in `main.ts`.

> Checked based on **execution-substitute evidence** (real code ran + real tests passed in PR #78, quiz reasoning based on real code) — **not** evidence that Hien Duong personally coded the hands-on or personally answered the quiz. See the disclaimer at the top of the file.

## 📚 Theory

<!-- Explain in English, in order: PROBLEM first, SOLUTION after.
     Each concept must have a link to the correct section of the original docs for reference.
     Avoid machine-translating docs — write as if you are teaching the person sitting next to you. -->

### Concept 1: DTO — and why it must be a `class`

**Problem it solves:** `@Body()` returns exactly what the client sent — a plain object, untyped, with no guarantees. The current `CreateTaskDto` in the repo only declares `title!: string`, but that is a TypeScript promise made **at compile time**; at runtime the client can still send `{}`, `{"title": 123}`, or `{"title":"ok","isAdmin":true}`, and `TasksService` will receive it as-is.

**How Nest implements it:** A DTO (Data Transfer Object) is a class describing the shape of data crossing the HTTP boundary. Nest reads the type of a handler parameter at runtime via `emitDecoratorMetadata` (already enabled in this repo's `tsconfig.json`) and passes it to the pipe as `metatype`. Only a **class** survives TypeScript compilation — `interface` and `type` are erased entirely, so the pipe has nothing to inspect.

The docs state two easy-to-trip-on points directly:

- _"Since TypeScript does not store metadata about generics or interfaces... consider using concrete classes in your DTOs."_
- _"When importing your DTOs, you can't use a type-only import as that would be erased at runtime"_ — meaning you must `import { CreateTaskDto }`, **not** `import type { CreateTaskDto }`.

The second point is already wrong right in this repo: `src/tasks/tasks.controller.ts` imports both DTOs with `import type`. If you enable `ValidationPipe` without fixing that import, the pipe still runs but **silently skips** validation — no error, no warning, it just doesn't validate anything.

**When NOT to use it:** A DTO is the shape of the **HTTP boundary**, not a domain model. Don't reuse the same class for the request body, the entity inside the service, and the database row — those three change for three different reasons (in the same spirit as the ports & adapters pattern you already know).

> 📖 Source: https://docs.nestjs.com/techniques/validation#auto-validation

### Concept 2: `class-validator` — a rule is a decorator, not an `if`

**Problem it solves:** In Express you write `if (!body.title) return res.status(400)...` in every handler. 5 routes means 5 repeated `if` blocks, and every rule change means remembering to fix all of them.

**How Nest implements it:** `class-validator` lets you attach a rule directly to a DTO property with a decorator: `@IsString()`, `@IsNotEmpty()`, `@IsOptional()`, `@IsBoolean()`, `@IsEnum()`, `@MaxLength()`, `@IsEmail()`... The rule lives right next to the data declaration, so reading the DTO tells you the contract. Every route using that DTO automatically inherits the rule — there's no need to remember where the validator is called.

Current versions: `class-validator@0.15.1`, `class-transformer@0.5.1`. The repo does **not** have them installed yet — this is the first hands-on task.

**When NOT to use it:** A business rule that needs a data query ("title must not duplicate an open task of this user") does not belong on the DTO — that's business logic, in the service. A DTO only cares about the **shape and type** validity of the payload.

> 📖 Source: https://docs.nestjs.com/techniques/validation#using-the-built-in-validationpipe · decorator list: https://github.com/typestack/class-validator#validation-decorators

### Concept 3: `class-transformer` — the missing link that makes decorators work

**Problem it solves:** JSON arriving over the network at `@Body()` is a **plain object**, carrying no class information. But `class-validator`'s decorators are registered per class. A plain object and a class never meet → the decorators are useless.

**How Nest implements it:** `class-transformer` provides `plainToInstance(metatype, value)` — it builds a real instance of the DTO from the plain object, so the rules attached to the class can actually apply. This is exactly the 2 core lines inside `ValidationPipe`, shown again in Example 3.

Besides that, when `transform: true` is enabled, `class-transformer` is also what converts primitive types: `"1"` from a path param becomes `1` if the handler signature declares `id: number`.

**When NOT to use it:** No need to call `plainToInstance` manually in a controller — `ValidationPipe` already does it. Calling it again just adds another hard-to-trace transformation layer.

> 📖 Source: https://docs.nestjs.com/pipes#class-validator

### Concept 4: Pipe — its place in the request lifecycle

**Problem it solves:** You need a place to hook in **between** the moment Nest has extracted a parameter from the request and the moment the handler is called, either to reject bad data or to transform it into the right shape. Express middleware can't do this generically: middleware doesn't know which handler is about to run, which parameter, or what type.

**How Nest implements it:** A pipe is a class with `@Injectable()` implementing `PipeTransform`, with exactly one method, `transform(value, metadata)`. Nest runs pipes **right before calling the handler**, on each argument. A pipe has only two outcomes: return a value (possibly changed) or throw an exception.

The order to memorize (already noted in the ROADMAP, will be recapped in L11):

```
Middleware → Guard → Interceptor (before) → Pipe → Handler → Interceptor (after) → Exception Filter
```

A pipe runs **inside the exceptions zone**, so a `BadRequestException` you throw is caught by the exception layer and turned into a standard 400 response — no need to write `res.status(400).json(...)` yourself.

Nest ships with 10 built-in pipes: `ValidationPipe`, `ParseIntPipe`, `ParseFloatPipe`, `ParseBoolPipe`, `ParseArrayPipe`, `ParseUUIDPipe`, `ParseEnumPipe`, `DefaultValuePipe`, `ParseFilePipe`, `ParseDatePipe`. The repo already uses one from L02: `@Param('id', ParseIntPipe)` in `tasks.controller.ts` — that's why `GET /tasks/abc` returns 400 instead of 500.

**When NOT to use it:** A pipe is not the place for business logic or side effects (writing to a DB, sending email). It should only validate/transform an argument. Need to gate by permission → Guard; need to wrap/change the response → Interceptor.

> 📖 Source: https://docs.nestjs.com/pipes · https://docs.nestjs.com/pipes#built-in-pipes

### Concept 5: `whitelist` / `forbidNonWhitelisted` / `transform`

**Problem it solves:** By default, `new ValidationPipe()` only checks the declared rules — it does **not** touch extra fields. If a client sends `{"title":"ok","completed":true,"id":999}`, the `id: 999` still goes straight into the service. With a real entity (L07+) this is the classic mass-assignment hole.

**How Nest implements it:** Three options, each with one clear job:

| Option                 | What it does                                                                            | Effect on an extra field           |
| ---------------------- | --------------------------------------------------------------------------------------- | ---------------------------------- |
| _(none enabled)_       | Only runs declared rules                                                                | Extra field passes through as-is   |
| `whitelist: true`      | **Strips** any property without a validation decorator from the result object           | Extra field is stripped, still 201 |
| `forbidNonWhitelisted` | Instead of stripping, it **throws**. Only has an effect together with `whitelist: true` | 400 Bad Request                    |
| `transform: true`      | `plainToInstance` + converts primitive types per the handler signature                  | Unrelated to extra fields          |

The point most often misunderstood: `whitelist` filters by **whether a decorator exists**, not by "whether the property is declared in the class". A property declared in the DTO but without a decorator will still be stripped by `whitelist: true` — silently, with no error.

`transform: true` has one more effect: primitive type conversion. If a handler declares `findOne(@Param('id') id: number)`, `"7"` becomes `7` without needing `ParseIntPipe`. This is "implicit conversion"; this repo's current approach (`ParseIntPipe` written explicitly) is "explicit conversion" — both are valid, they just differ in whether anyone reading the code sees it immediately.

**When NOT to use it:** `forbidNonWhitelisted: true` makes the API strict toward older clients (one extra field breaks the request). For an internal or learning API it's very much worth enabling since it surfaces errors early; for a public API with many client versions, consider only `whitelist`.

> 📖 Source: https://docs.nestjs.com/techniques/validation#stripping-properties · https://docs.nestjs.com/techniques/validation#transform-payload-objects

### Concept 6: Which scope to register the pipe at — and this repo's real e2e trap

**Problem it solves:** The same `ValidationPipe` can be attached at 4 levels: per parameter, per method (`@UsePipes()`), the whole controller, or the whole app. Pick the wrong level and you either repeat it 40 times, or validate places that shouldn't be validated.

**How Nest implements it:** For input validation, the docs recommend the **global** scope so "all endpoints are protected from receiving incorrect data". There are 2 ways to register it globally, and they are **not** equivalent:

| Way                                        | Written where                                    | Can inject a dependency? | Works in e2e tests? |
| ------------------------------------------ | ------------------------------------------------ | ------------------------ | ------------------- |
| `app.useGlobalPipes(new ValidationPipe())` | `src/main.ts`, outside any module                | ❌ No                    | ❌ No               |
| `APP_PIPE` provider token                  | `providers` of `AppModule` (from `@nestjs/core`) | ✅ Yes                   | ✅ Yes              |

The last column is a real trap in this repo: `test/tasks.e2e-spec.ts` builds the app with `Test.createTestingModule(...).createNestApplication()` — the `bootstrap()` function in `main.ts` **never runs** in tests. That means if you only do exactly what the issue's second bullet says ("enable a global ValidationPipe in `main.ts`") and then write an e2e test expecting 400, the test will **fail** — for a reason that isn't obvious at all.

Two ways out, pick one and record the reason in the PR:

1. Register with `APP_PIPE` in `AppModule` → e2e automatically gets validation, and it also opens the door for a pipe that needs to inject a dependency later.
2. Keep `main.ts` and add the exact same configuration to each e2e spec's setup → closer to the literal issue text, but the configuration is duplicated in 2 places and can easily drift.

**When NOT to use global scope:** When a rule is only correct for one route (e.g. a pipe that looks up a Task by id and returns the entity). Bind that kind at the parameter/method level, don't push it to global.

> 📖 Source: https://docs.nestjs.com/pipes#global-scoped-pipes · https://docs.nestjs.com/techniques/validation#auto-validation

### Concept 7: Custom pipe — `PipeTransform` and `ArgumentMetadata`

**Problem it solves:** Built-in pipes cover the common cases, but there are transformations that are only correct for your own domain: normalizing `title` (trim + collapse whitespace), coercing the `completed` query param to a boolean per your own convention, or turning `id` into the Task entity itself.

**How Nest implements it:** Write a class implementing `PipeTransform<T, R>` with `transform(value: T, metadata: ArgumentMetadata): R`. `metadata` tells you what this argument is:

```ts
export interface ArgumentMetadata {
  type: 'body' | 'query' | 'param' | 'custom';
  metatype?: Type<unknown>;
  data?: string;
}
```

- `type`: comes from `@Body()`, `@Query()`, `@Param()`, or a custom decorator.
- `metatype`: the type declared in the handler signature (`CreateTaskDto`, `String`, `Number`...) — `undefined` if no type is declared. This is exactly what `import type` loses.
- `data`: the string passed to the decorator, e.g. `'id'` in `@Param('id')`.

`transform()` is allowed to be `async` (Nest supports asynchronous pipes). The returned value **completely replaces** the original argument.

**When NOT to use it:** Don't rewrite `ValidationPipe` or `ParseIntPipe` — the docs say plainly that the built-in versions are far more complete. Write a custom pipe when the logic is genuinely domain-specific, or when you're learning the mechanism (exactly the case in this lesson).

> 📖 Source: https://docs.nestjs.com/pipes#custom-pipes · https://docs.nestjs.com/pipes#transformation-use-case

---

## 🔗 Connect to prior knowledge

<!-- The most important section of the whole note. Fast learning = anchoring new knowledge to what you already know.
     Always cross-reference with: Express, Prisma, hexagonal architecture. -->

| Knowledge you already have                                                                                                      | Equivalent in NestJS                                                                     | Differences                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Express: `if (!req.body.title) return res.status(400).json(...)` in every handler                                               | A decorator on the DTO + `ValidationPipe` running automatically before the handler       | Declarative instead of imperative: the rule lives in one place, every route using that DTO inherits it, and there's no way to "forget to call the validator".                                        |
| Express + `joi`/`zod`: the schema is a separate object, you must remember to call `schema.validate()` at the top of the handler | The DTO class **is** the schema; the pipe finds the `metatype` itself and validates      | No "remember to call" step. In exchange, the mechanism depends on runtime metadata → losing metadata (using an `interface`, `import type`) silently loses validation.                                |
| Express: `req.params.id` is always a string, you `parseInt` it yourself and check `isNaN`                                       | `@Param('id', ParseIntPipe)` or `transform: true`                                        | Nest separates type coercion out of the handler, and a coercion error automatically becomes 400 via the exception layer instead of you writing the error response yourself.                          |
| Prisma: `prisma.task.create({ data })` throws if `data` has the wrong type or a missing required field                          | `ValidationPipe` rejects at the **HTTP boundary**, before it ever reaches the service/DB | Prisma protects the data layer and returns a technical error (500 if uncaught); the pipe protects the input layer and returns 400 with a message for the client. Two different layers, so keep both. |
| Hexagonal: DTO/command at the adapter layer, entity at the domain layer, a mapper in between                                    | A DTO in `src/<feature>/dto/` = the HTTP adapter's input port; `Task` = the domain       | Nest doesn't force the separation, so it's very easy to slide into reusing one class for both HTTP and domain. Keeping them apart is your own choice, not the framework's default.                   |

**What I used to misunderstand:** This section is normally where you record a **personal** misunderstanding discovered while coding yourself — but this lesson's hands-on was executed as a substitute by Hermes/Codex (see the disclaimer at the top of the file), so there is no real personal experience to record here. Instead, here are 2 points that are easy to misread, found by Claude Code while re-reading the PR #78 diff and the original Linear issue — still worth reading even though they aren't a personal, hard-won lesson:

1. Linear issue NES-6 writes "status is an enum" in the Hands-on section, which can make a reader think the `Task` model must change. PR #78 **kept** `completed: boolean` (the correct default already recorded in `SPEC.md` before coding) — that phrase in the issue was just an example illustrating "a sensible rule", not a requirement to change the contract.
2. `whitelist: true` + `forbidNonWhitelisted: true` applied via `APP_PIPE` is **app-wide**, not just for `tasks`. Because of that, `CreateUserDto` (a different module, outside NES-6's direct scope) also had to gain decorators (`@IsEmail`, `@MaxLength`, `password?` optional) so the existing `users.e2e-spec.ts` wouldn't break from extra fields being rejected — a global pipe change had a side effect spilling into a module not directly related to the issue.

---

## 💻 Explained Examples

<!-- Each example: RUNNABLE code + line-by-line explanation of important parts + source link.
     Do not copy docs verbatim: adapt them to the project's Task Management domain.
     NOTE: the examples below intentionally use the Users domain, NOT Tasks —
     the Tasks part is your hands-on, the note doesn't write the solution for you. -->

### Example 1: A DTO with rules — `CreateUserDto` (Users domain, not the hands-on task)

```ts
// file: src/users/dto/create-user.dto.ts — illustration, NOT a requirement to edit for this lesson
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @IsEmail()
  email!: string;
}
```

**Explanation:**

- Multiple decorators on the same property are **all** applied; a 400 response gathers every error into the `message` array, unless `stopAtFirstError` is enabled.
- `name!` keeps the `!` exactly as it already exists in the repo because `strictNullChecks: true` — that mark only tells TypeScript "this will be assigned at runtime", it creates **no** runtime check at all. Exactly why `class-validator` is needed.
- A property with **no** decorator gets stripped from the result object by `whitelist: true` — even if it's declared in the class.

> 📖 Based on: https://docs.nestjs.com/techniques/validation#auto-validation (the docs' own `CreateUserDto` example, adapted to this repo's domain)

### Example 2: The same request, three pipe configurations, three outcomes

```ts
// illustrates behavior — which configuration to pick is your decision in the hands-on
new ValidationPipe(); // (a) only runs rules
new ValidationPipe({ whitelist: true }); // (b) strips extra fields
new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }); // (c) rejects extra fields
```

For request `POST /users` with body `{ "name": "Hien", "email": "a@b.com", "role": "admin" }`:

| Configuration | HTTP | Service receives                 | Note                                                 |
| ------------- | ---- | -------------------------------- | ---------------------------------------------------- |
| (a)           | 201  | `{ name, email, role: 'admin' }` | `role` leaks into the service — mass assignment      |
| (b)           | 201  | `{ name, email }`                | `role` is stripped **silently**, client doesn't know |
| (c)           | 400  | _(handler never runs)_           | `message: ["property role should not exist"]`        |

**Explanation:**

- (a) is the default — most compatible, weakest on security.
- (b) and (c) differ in whether the client **is told**. Choose (c) when you want errors surfaced early (a learning repo → should choose (c)); choose (b) when there are old clients that can't be fixed.
- `forbidNonWhitelisted: true` without `whitelist: true` has no effect — the docs state clearly it must go **together**.

> 📖 Based on: https://docs.nestjs.com/techniques/validation#stripping-properties

### Example 3: Inside `ValidationPipe` — the 2 core lines

```ts
// file: excerpted from the docs — a simplified version of ValidationPipe to understand the mechanism
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class SimpleValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value; // no metatype (interface / import type) => skip
    }
    const object = plainToInstance(metatype, value); // class-transformer
    const errors = await validate(object); // class-validator
    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```

**Explanation:**

- The line `if (!metatype ...) return value;` is the entire answer to "why does the pipe validate nothing even though it's enabled": with no `metatype`, the pipe returns the value unchanged. Both `import type` and `interface` lead exactly into this branch.
- `plainToInstance` is the required link — without it, `validate()` receives a plain object and sees no decorators at all.
- `transform()` is `async` because `class-validator` supports asynchronous validators.
- Nest's built-in version does far more than this (whitelist, transform, `exceptionFactory`, `errorFormat`...) — read the simplified version only to understand the mechanism, **not** to copy it.

> 📖 Based on: https://docs.nestjs.com/pipes#class-validator

### Example 4: A custom transformation pipe — the docs' minimal `ParseIntPipe`

```ts
// file: excerpted from the docs — a skeleton for a custom pipe, NOT the pipe you need to submit
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed');
    }
    return val;
  }
}
```

**Explanation:**

- `PipeTransform<string, number>`: the generic states clearly `string` in, `number` out — the returned value **replaces** the original argument before the handler receives it.
- Throwing `BadRequestException` is enough to get a standard 400 response, since the pipe runs inside the exceptions zone.
- This is exactly the mechanism behind `@Param('id', ParseIntPipe)`, already used in `tasks.controller.ts` since L02 — the built-in version just has more options.
- Your custom pipe in the hands-on should do something **different** from this (don't rewrite `ParseIntPipe`) — see the hint in the Hands-on section.

> 📖 Based on: https://docs.nestjs.com/pipes#transformation-use-case

---

## 🛠 Hands-on

<!-- YOU code this part yourself. The agent does not do it for you.
     The note only states requirements and hints and how to self-verify — no ready-made solution. -->

**Requirements:**

0. Install the dependency (not in the repo yet): `pnpm add class-validator class-transformer`. Check that they land in `dependencies`, not `devDependencies` — runtime code needs them.
1. **`CreateTaskDto`** (`src/tasks/dto/create-task.dto.ts`): `title` required, a string, not empty (including `"   "`), with a length limit. Decide for yourself which decorators to use and why — you'll be asked again in the quiz.
2. **`UpdateTaskDto`** (`src/tasks/dto/update-task.dto.ts`): every field optional; `completed` must be a real boolean (what about the string `"true"` — do you want to accept or reject it?). Remember that `whitelist: true` strips a property **without** a decorator — even if it's declared in the class.
3. **Enable a global `ValidationPipe`** with `whitelist`, `forbidNonWhitelisted`, `transform`. Re-read Concept 6 and **choose** between `main.ts` + `useGlobalPipes` and `APP_PIPE` in `AppModule`; record your reason in the PR description.
4. **Fix the DTO import in `tasks.controller.ts`** from `import type` to a value import. Before fixing it, try running with `import type` first to see with your own eyes that validation does **not** run — a lesson more expensive than getting it right from the start.
5. **Write one simple custom pipe**, placed in `src/tasks/pipes/`, with a unit test `*.spec.ts` next to the source file. A few reasonable directions — pick one: normalize `title` (trim + collapse extra whitespace); coerce the `completed` query (`'true'`/`'false'`/`'1'`/`'0'`) into a boolean and throw 400 on any other value; or a pipe checking that `id` is within a valid range. **Don't** rewrite `ParseIntPipe`.
6. **Add a test for the DTO-invalid → 400 case** in `test/tasks.e2e-spec.ts` (see AC7 in `SPEC.md` for the minimum case list). If you chose `main.ts` in step 3, remember e2e does not run `main.ts`.
7. Run `pnpm verify` and `pnpm test:e2e` — both must be green before opening a PR.

**How to verify:**

```bash
pnpm start:dev

# valid -> 201
curl -i -X POST http://localhost:3000/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"Learning validation"}'

# missing title -> expect 400 with a message describing the failing field
curl -i -X POST http://localhost:3000/tasks \
  -H 'content-type: application/json' \
  -d '{}'

# empty / whitespace-only title -> expect 400
curl -i -X POST http://localhost:3000/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"   "}'

# extra field -> 400 if forbidNonWhitelisted, 201 + stripped if only whitelist
curl -i -X POST http://localhost:3000/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"ok","hacker":true}'

# wrong boolean type -> expect 400
curl -i -X PATCH http://localhost:3000/tasks/1 \
  -H 'content-type: application/json' \
  -d '{"completed":"yes"}'

# regression: ParseIntPipe already in place since L02 -> still must be 400
curl -i http://localhost:3000/tasks/abc

pnpm verify
pnpm test:e2e
```

**Where you might get stuck, and how to troubleshoot:**

- **Pipe is enabled but an invalid request still returns 201** → almost certainly `import type` in the controller (Concept 1), or the handler declares the type as an `interface` instead of a class.
- **`curl` returns 400 but the e2e test returns 201** → e2e does not run `main.ts` (Concept 6). This is the number-one trap in this lesson.
- **A field declared in the DTO disappears from the result** → that property is missing a validation decorator and `whitelist: true` stripped it.
- **`Nest can't resolve dependencies`** after switching to `APP_PIPE` → check that `APP_PIPE` is imported from `@nestjs/core` (not `@nestjs/common`).
- **ESLint red because of `@typescript-eslint/no-unsafe-argument` or `no-floating-promises`** → CI runs with `--max-warnings=0` so a warning also turns it red; fix it, don't disable the rule.
- **Mismatch between the issue and the current model:** NES-6 mentions "status is an enum" but the repo currently uses `completed: boolean`. This lesson's default is to **keep `completed`** — see the "Points requiring a user decision" section in `SPEC.md` if you actually want to change it.

### ✅ Execution-substitute evidence — PR #78 (real results, not a guide)

> See the disclaimer at the top of the file: the section below describes code that **really ran** in PR #78 (`codex/nes-6-dto-pipes-validation` → `main`, merge `b3086f4`), not something Hien Duong did personally.

**0. Dependency (AC1).** `class-validator@0.15.1` + `class-transformer@0.5.1` are in `dependencies` (not `devDependencies`) of `package.json`, `pnpm-lock.yaml` updated in the same commit.

**1–2. DTOs.** `src/tasks/dto/create-task.dto.ts`: `title` required (`@IsString @IsNotEmpty`), rejects a whitespace-only string via `@Matches(/\S/)` (`@IsNotEmpty()` alone isn't enough because `"   "` isn't empty by string length), `@MaxLength(200)`. `src/tasks/dto/update-task.dto.ts`: every field `@IsOptional()`, `title` applies the same rule as `create`, `completed` uses `@IsBoolean()` — **rejects** the string `"true"`, matching the "reject" choice set out in requirement 2.

**3. Global `ValidationPipe` via `APP_PIPE` — why not `main.ts`.** `src/app.module.ts` registers `new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` via the `APP_PIPE` token (from `@nestjs/core`) in `AppModule`'s `providers`, with a comment right in the code: _"APP_PIPE covers both src/main.ts bootstrap and createNestApplication e2e apps."_ This is option (a) from Concept 6 / `SPEC.md` AC4 — required because `test/tasks.e2e-spec.ts` builds the app with `Test.createTestingModule({ imports: [AppModule] }).createNestApplication()`, which does **not** run `main.ts`; if `app.useGlobalPipes()` in `main.ts` had been chosen instead, every new 400 case added in AC7 would fail in e2e even though manual `curl` calls via `pnpm start:dev` would still be correct.

**4. Value import (AC5).** `src/tasks/tasks.controller.ts` changed `import type { CreateTaskDto }` / `import type { UpdateTaskDto }` to a value import (`import { CreateTaskDto } from './dto/create-task.dto'`), keeping `import type { Task }` separate since `Task` doesn't need runtime metadata (it's not a DTO going through `@Body()`).

**5. Custom pipe (AC6).** `src/tasks/pipes/parse-completed-query.pipe.ts`: `ParseCompletedQueryPipe implements PipeTransform<string | undefined, string | undefined>` — normalizes the `completed` query (`'true'|'1'` → `'true'`, `'false'|'0'` → `'false'`, anything else → `BadRequestException`), bound at `@Query('completed', ParseCompletedQueryPipe)` in `findAll()` (parameter scope, not global — matching the hint "don't rewrite `ParseIntPipe`"). The unit test next to the file (`parse-completed-query.pipe.spec.ts`) covers 4 canonical values, an `undefined` value, and an invalid value that throws.

**6–7. DTO-invalid → 400 test cases (AC7, `test/tasks.e2e-spec.ts`).** Real cases now running: `POST /tasks {}` → 400, `message` contains `"title"`; `POST /tasks {title: ''}` and `{title: '   '}` → 400; `POST /tasks {title: 123}` (wrong type) → 400; `POST /tasks {title: 'x'.repeat(201)}` (exceeds `MaxLength`) → 400; `POST /tasks {title: 'ok', hacker: true}` → 400 (from `forbidNonWhitelisted`, not strip + 201); `PATCH /tasks/:id {completed: 'yes'}` → 400; `PATCH /tasks/:id {title: '   '}` → 400; `GET /tasks?completed=maybe` → 400 (via `ParseCompletedQueryPipe`); `GET /tasks/abc` → 400 (regression for `ParseIntPipe` from L02, still intact).

**Contract unchanged (AC9).** A valid `POST /tasks` still returns `{ id, title, completed }`; `GET /tasks` still has the `Cache-Control: no-store` header; `DELETE /tasks/:id` still returns `204`. The existing CRUD flow test (`supports the complete in-memory CRUD flow`) passes without a logic change.

**Side effect outside NES-6's scope.** Because `APP_PIPE` is global, `src/users/dto/create-user.dto.ts` also needed extra decorators (`@MaxLength(80)` for `name`, `password?` optional with `@IsString @MaxLength(200)`) so the existing `test/users.e2e-spec.ts` wouldn't break from `forbidNonWhitelisted`; `password` still does not appear in the response (due to the existing exclusion logic in the service/mapping, not the pipe's whitelist).

**Verify results (re-read at closeout time, matching PR #78):** `pnpm test` — 7 suites / 20 tests pass. `pnpm test:e2e` — 3 suites / 13 tests pass. `pnpm verify` (lint `--max-warnings=0` + prettier check + jest + build) — PASS. Merge commit `b3086f4`.

---

## ✅ Review & Quiz

> The answers below are **execution-substitute evidence** from Claude Code (see the disclaimer at the top of the file), based directly on the real code in PR #78 and the original docs — not Hien Duong's own answers.

1. **Question:** A DTO in Nest must be a `class`, an `interface` cannot be used. What runtime mechanism makes that mandatory, and exactly where does `import type { CreateTaskDto }` break it inside a pipe's `transform()`?
   **Answer:** Nest reads a handler parameter's type at runtime via `emitDecoratorMetadata` (enabled in `tsconfig.json`) and attaches that type to `ArgumentMetadata.metatype` passed to the pipe. Only a **class** survives TypeScript compilation into JS — `interface`/`type` are erased entirely, leaving nothing for `metatype` to point to. `import type { CreateTaskDto }` breaks exactly at the first line of `transform()` inside `ValidationPipe` (see Example 3): `if (!metatype || !this.toValidate(metatype)) { return value; }`. Because `import type` is completely erased by TypeScript at compile time (the same effect as `interface`), the parameter `createTaskDto: CreateTaskDto` ends up with `metatype` as `undefined` at runtime — the pipe falls into the `return value` branch, returning the raw value never passed through `plainToInstance`/`validate`. This is exactly the real bug that existed in `tasks.controller.ts` before PR #78, fixed by switching to a value import.

2. **Question:** You enable `whitelist: true` but **not** `forbidNonWhitelisted`. A client sends one extra field. What happens to that request, and why could this be more dangerous than returning 400?
   **Answer:** `whitelist: true` alone only **silently strips** a property with no validation decorator from the object `class-transformer` builds — the request still returns `201`, the service receives the stripped object, but the client gets **no notification** that their field was dropped. This is more dangerous than returning 400 because: (1) the client sees `201` = "success" and assumes the field was saved, while that data has actually vanished — a silent bug that's hard to debug; (2) it masks a real client error (e.g. a typo in the field name) instead of reporting it immediately, letting the mistake accumulate and only surface later, somewhere far harder to trace back to the cause. `forbidNonWhitelisted: true` (chosen in PR #78, always paired with `whitelist: true`) turns that behavior into an immediate `400` with a `message` naming the rejected field.

3. **Question:** `transform: true` does two different things. Name both, and say whether `@Param('id', ParseIntPipe)` in `tasks.controller.ts` is still needed once `transform: true` is enabled — and why you'd still want to (or not want to) keep it.
   **Answer:** The two things: (1) `plainToInstance` builds a **real instance** of the DTO from the plain object — the required link for `class-validator` decorators to have any effect, since `validate()` cannot see decorators on a plain plain object; (2) **primitive type coercion** per the type declared in the handler signature, e.g. `@Param('id') id: number` will automatically turn `"7"` (a string from the URL) into `7` — "implicit conversion", no separate `ParseIntPipe` needed. In this repo's actual `tasks.controller.ts`, `@Param('id', ParseIntPipe)` is **still kept** even though `transform: true` is already enabled globally via `APP_PIPE`. A reasonable reason to keep it: it documents right at the route signature that `id` must be a number — anyone reading the code doesn't need to know that `transform: true` is enabled in `AppModule` to understand that; it's also the pipe already present since L02, and `SPEC.md`'s AC7 explicitly notes the `GET /tasks/abc → 400` case as "a regression for the `ParseIntPipe` already present since L02" — PR #78 deliberately kept it as an anchor, rather than switching to rely purely on the new implicit conversion (matching AC9: no change to the existing contract).

4. **Question:** How does registering `ValidationPipe` via `app.useGlobalPipes()` in `main.ts` differ from registering it via the `APP_PIPE` provider in `AppModule`? Name **two** differences, one of which you ran into directly while writing this lesson's e2e tests.
   **Answer:** Difference 1 — **dependency injection**: `app.useGlobalPipes(new ValidationPipe())` in `main.ts` just calls the function with a manually built instance, bypassing Nest's DI container, so that pipe can't inject another provider. `APP_PIPE` is a real provider token in `AppModule`'s `providers` (using `useFactory`), so it can inject a dependency like any other provider. Difference 2 — **whether it takes effect in e2e**, and this is exactly what came up directly while doing this lesson: `test/tasks.e2e-spec.ts` builds the app with `Test.createTestingModule({ imports: [AppModule] }).createNestApplication()` — `bootstrap()` in `main.ts` **never runs** down this path. PR #78 chose `APP_PIPE` in `AppModule` precisely for that reason (a comment in the code: _"APP_PIPE covers both src/main.ts bootstrap and createNestApplication e2e apps"_) — had `main.ts` been chosen instead, all 9 new `400` cases added to `tasks.e2e-spec.ts` would have failed, even though manual `curl` calls via `pnpm start:dev` would still be correct.

5. **Question:** A pipe runs after a Guard but before the Handler. If you wanted to write a pipe that looks up a Task by `id` and returns the entity to the handler, what are the pros/cons of putting that logic in a pipe versus letting the service call `findOne()` inside the handler? When would you **not** choose the pipe approach?
   **Answer:** Pros of putting lookup logic in a pipe: the handler receives the entity already confirmed to exist (no need to call `findOne()` again), and a "not found" error is rejected earlier in the request lifecycle (at Pipe, before Handler); if multiple routes need "look up, then process", the logic is written once and bound in several places. Cons: a pipe only receives the value of **one** argument (`ArgumentMetadata.data` is that parameter's name) — if the lookup needs extra context from another argument (e.g. needing `userId` from a token to check the task belongs to that user's project), the pipe has no built-in access to the whole handler signature, so the logic tends to get fragmented. In the current repo, `TasksService.findOne()` **already** throws a not-found error — moving that logic into a pipe would **duplicate** the service, and would violate the exact rule this repo follows ("business logic doesn't live outside the service") — looking up an entity by id is still business logic, whether it runs in a pipe or a controller. You would **not** choose the pipe approach when: (1) the lookup needs more than one request parameter (auth, ownership checks spanning multiple arguments); (2) the service already has the lookup + standard error logic — splitting it into a pipe just creates one more place to keep in sync every time the entity's shape changes.

**Review the previous lesson:** _(filled in during the `/lesson-review` step — below, Claude Code fills it in at closeout instead, based on reading the code, not the user's personal recollection)_ L04 finished building `TasksService`/`TasksModule` with in-memory CRUD, without rejecting anything at the HTTP boundary — `POST /tasks` with any body at all reached the service. L05 adds exactly that missing layer: `ValidationPipe` (via `APP_PIPE`) rejects at the Pipe layer, **before** a request ever touches the very `TasksService` L04 built — same service, no logic changed, just one more defensive layer placed in front of it.

---

## 🧠 Key Takeaways

<!-- Maximum 5 lines. This is the section you will review quickly before interviews. -->

1. A DTO must be a **class** and must be imported with a **value import** — losing runtime metadata silently loses validation.
2. `class-validator` declares rules via decorators; `class-transformer` (`plainToInstance`) is the missing link turning a plain object into an instance the rules can apply to.
3. `whitelist` strips a property without a decorator · `forbidNonWhitelisted` (paired with `whitelist`) turns stripping into 400 · `transform` builds an instance + coerces primitive types.
4. A pipe runs right before the handler, inside the exceptions zone → a `BadRequestException` automatically becomes a standard 400 response.
5. `useGlobalPipes()` in `main.ts` does **not** apply to e2e tests built with `Test.createTestingModule`; `APP_PIPE` does, and it can also inject a dependency.

---

## 🚧 Boundaries for the reference implementation (coder agent)

> Already executed via PR #78 under the execution-substitute exception (see the disclaimer at the top of the file) — the boundaries below are the conditions set **before** it ran, kept here as a record, not remaining work.

> Normally only applies **after** you've finished the hands-on (NES-60) yourself. The reference solution is for comparison, not a replacement — see `docs/workflow/AGENT-MODEL.md`.

- Handoff spec: [`SPEC.md`](SPEC.md) (Part B = acceptance criteria, Part C = file boundaries). The coder agent **only reads** it, does not edit `SPEC.md`.
- May edit: `src/**`, `test/**`, and `package.json` + `pnpm-lock.yaml` (only to add `class-validator`, `class-transformer`).
- **Do not** touch: `docs/**`, `.github/**`, `.husky/**`, `postman/**`.
- New files must have the header comment `// [NES-6 · lesson 05] <file role>`; **keep** the existing teaching comments in `src/tasks/**` and `src/users/**` (a lesson from PR #60).
- Separate branch `codex/nes-6-...`, PR with a `Fixes NES-6` line. Local review by Claude Code, automated layer-1 review by the Codex GitHub App connector, **only the user merges**.

---

## 📎 Sources

<!-- Every link used. Official sources go first. -->

- [docs.nestjs.com/techniques/validation](https://docs.nestjs.com/techniques/validation)
- [docs.nestjs.com/techniques/validation#stripping-properties](https://docs.nestjs.com/techniques/validation#stripping-properties)
- [docs.nestjs.com/techniques/validation#transform-payload-objects](https://docs.nestjs.com/techniques/validation#transform-payload-objects)
- [docs.nestjs.com/pipes](https://docs.nestjs.com/pipes)
- [docs.nestjs.com/pipes#custom-pipes](https://docs.nestjs.com/pipes#custom-pipes)
- [docs.nestjs.com/pipes#global-scoped-pipes](https://docs.nestjs.com/pipes#global-scoped-pipes)
- [typestack/class-validator — decorator list](https://github.com/typestack/class-validator#validation-decorators)
- [typestack/class-transformer](https://github.com/typestack/class-transformer)
- [nestjs/nest — sample/01-cats-app](https://github.com/nestjs/nest/tree/master/sample/01-cats-app) — a DTO with `class-validator` decorators + `app.useGlobalPipes(new ValidationPipe())` in `main.ts`
- [nestjs/nest — sample/35-zod-validation](https://github.com/nestjs/nest/tree/master/sample/35-zod-validation) — the Zod schema-based approach, for comparison with the decorator-based one
