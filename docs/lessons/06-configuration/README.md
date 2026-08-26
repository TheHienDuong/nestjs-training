# L06 — Configuration & environment variables

|                |                                                                                  |
| -------------- | -------------------------------------------------------------------------------- |
| **Phase**      | 2 — Working with Data                                                            |
| **Linear**     | NES-7 (sub-issue: NES-69 Theory & note · NES-72 Hands-on · NES-77 Review & quiz) |
| **Branch**     | `duongthehien2001/nes-7-l06-configuration-environment-variables`                 |
| **Main docs**  | [/techniques/configuration](https://docs.nestjs.com/techniques/configuration)    |
| **Study date** | 2026-08-26                                                                       |

> 📝 **The entire Hands-on + Quiz section of this lesson was executed as a substitute**, not "you did it yourself" as the original scaffold intends. Read the disclaimer right below before reading further — it is a statement with real effect.

> ⚠️ **Disclaimer — execution substitute (2026-08-26):** The **🛠 Hands-on** section (NES-72: install `@nestjs/config`, write `src/config/env.validation.ts` with `class-validator`, register `ConfigModule.forRoot` in `app.module.ts`, fix `main.ts` to read `PORT` via `ConfigService`) was **executed as a substitute by Hermes/Codex** via PR #82 (`Fixes NES-7`, branch `codex/nes-7-l06-config-implementation`, merge commit `f496a77`). The **✅ Review & Quiz** section (NES-77) was **executed as a substitute by Claude Code** during the closeout step, based on reading back the PR #82 diff and the original docs — not answers Hien Duong came up with personally. Both fall under the **one-time user-approved exception (approved one-time execution-substitute authorization, 2026-08-26)** because the user was busy. This is **execution-substitute evidence**: real code ran, tests really passed (`pnpm test` 9 suites/28 tests, `pnpm test:e2e` 3 suites/13 tests, `pnpm verify` PASS — re-verified at closeout time), quiz reasoning based on real code — **NOT** confirmation that Hien Duong personally coded the hands-on or personally answered this quiz. To learn for real, redo the hands-on and answer the quiz yourself before reading the section below.

---

## 🗂 Lesson file map

> The most accurate map + reading each code file (with line numbers): run `pnpm lesson 06`.
> This table is a quick-reading summary; update it when the lesson is complete.

| File                                      | Role (theory / ref / hands-on)                                                                                                | Created in lesson | Status                                           |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------ |
| `docs/lessons/06-configuration/README.md` | Theory + hands-on guide + quiz                                                                                                | L06               | Merged (PR #81, closeout at this step)           |
| `docs/lessons/06-configuration/SPEC.md`   | NES-7 snapshot for the coder agent                                                                                            | L06               | Merged (PR #81)                                  |
| `.env.example`                            | **Already exists since L00** — no new variable needed, only `NODE_ENV`/`PORT` are used and validated                          | L00               | Unchanged — already covers what needs validating |
| `package.json` / `pnpm-lock.yaml`         | Adds dependency `@nestjs/config@^4.0.4` (0 new validation dependency — reuses `class-validator`/`class-transformer` from L05) | —                 | ✅ Merged (PR #82, execution substitute)         |
| `src/config/env.validation.ts`            | Hands-on — validation schema with `class-validator` (Option B, Concept 4)                                                     | L06               | ✅ Merged (PR #82, execution substitute)         |
| `src/config/env.validation.spec.ts`       | Test — valid config + 6 invalid cases → throw                                                                                 | L06               | ✅ Merged (PR #82, execution substitute)         |
| `src/app.module.ts`                       | Hands-on — register `ConfigModule.forRoot({ isGlobal: true, validate })`                                                      | L01/L04           | ✅ Merged (PR #82, execution substitute)         |
| `src/main.ts`                             | Hands-on — swap `process.env.PORT ?? 3000` for `app.get(ConfigService).get('PORT')`, throw if `undefined`                     | L01               | ✅ Merged (PR #82, execution substitute)         |
| `src/main.spec.ts`                        | Test — `bootstrap()` reads `PORT` via `ConfigService` before `listen()`                                                       | L06               | ✅ Merged (PR #82, execution substitute)         |
| `test/setup-env.ts`                       | Test setup — supplies non-secret `NODE_ENV`/`PORT` for e2e (e2e doesn't run `main.ts`)                                        | L06               | ✅ Merged (PR #82, execution substitute)         |
| `test/jest-e2e.json`                      | Edited — adds `setupFiles: ["<rootDir>/setup-env.ts"]`                                                                        | L02               | ✅ Merged (PR #82, execution substitute)         |

---

## 🎯 Objectives

- [x] Use `@nestjs/config` with `ConfigModule.forRoot`
- [x] Validate the environment variable schema (Joi or class-validator) — the app refuses to start if a variable is missing
- [x] Inject `ConfigService` instead of reading `process.env` directly in business logic

> Checked based on **execution-substitute evidence** (real code ran + tests really passed in PR #82) — **not** evidence that Hien Duong personally coded the hands-on. See the disclaimer at the top of the file.

## 📚 Theory

### Concept 1: `ConfigModule.forRoot()` — centralizing how environment variables are read

**The problem it solves:** In a typical Express + `dotenv` app, `process.env.X` gets read all over the place: `main.ts` reads `PORT`, one service reads `JWT_SECRET`, another reads `DATABASE_URL`. Nothing guarantees the variable **actually exists** at runtime — a missing variable only surfaces once that exact line of code runs, sometimes in the middle of handling a real user's request.

**How Nest does it:** `@nestjs/config` ships a `ConfigModule` that wraps [`dotenv`](https://github.com/motdotla/dotenv) (the very package you already used with Express). Import it and call `ConfigModule.forRoot()` in `AppModule`:

```ts
// file: src/app.module.ts (illustration — not yet applied to real code)
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // no need to re-import ConfigModule in TasksModule, UsersModule...
    }),
  ],
})
export class AppModule {}
```

`forRoot()` reads the `.env` file at the project root, merges it with the real `process.env` (shell-exported variables override the ones in `.env`), then registers a `ConfigService` provider that reads back that merged value. This is exactly the **dynamic module** pattern you already wrote by hand in `TasksConfigModule.forRoot()` (L04, see `src/tasks/tasks-config.module.ts`) — the only difference is that Nest has already written that module for you, and it comes with validation built in.

**When NOT to use it:** If the app only has 1-2 environment variables that will never grow (rarely true in practice), reading `process.env.X` directly with a hand-rolled type guard is acceptable. As soon as ≥ 2 modules need to read config, or you need to validate at bootstrap, the benefit of `ConfigModule` far outweighs the cost of one extra dependency.

> 📖 Source: [docs.nestjs.com/techniques/configuration#getting-started](https://docs.nestjs.com/techniques/configuration#getting-started)

---

### Concept 2: Injecting `ConfigService` — why business logic shouldn't read `process.env` directly

**The problem it solves:** `process.env.X` is a hidden global variable (the same "global singleton" pattern this repo's `AGENTS.md` forbids for DI: _"do not import a global singleton"_). A `TasksService` that reads `process.env.TASKS_PAGE_SIZE` directly means:

- It can't be unit tested easily — testing 2 different values means mutating the global `process.env` between test cases (state leaking across test cases).
- It's not centralized — figuring out how many environment variables the app uses means grepping all of `src/`.
- It has no type — `process.env.X` is always typed `string | undefined`, even when you know for a fact it's a number.

**How Nest does it:** Inject `ConfigService` through the constructor, just like any other Nest provider:

```ts
// file: src/tasks/tasks.service.ts (illustration of the added snippet — NOT the actual code today)
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TasksService {
  constructor(private readonly configService: ConfigService) {}

  private get defaultPageSize(): number {
    // compared to reading process.env.TASKS_PAGE_SIZE directly: typed, has a default, has a single source of truth
    return this.configService.get<number>('TASKS_PAGE_SIZE', 20);
  }
}
```

Compared to the old way (`process.env.TASKS_PAGE_SIZE`), `ConfigService.get()` gives a type hint, an explicit default value (the 2nd argument), and — most important for testing — you can **mock `ConfigService` via `Test.createTestingModule()`** instead of mutating the global `process.env`.

**When NOT to use it:** `main.ts` is a reasonable exception — it runs before `NestFactory.create()` returns `app`, so it may still need to read raw `process.env` for something that happens very early (e.g. picking which `.env` file to load). But **once `app` exists**, `main.ts` should also fetch `ConfigService` via `app.get(ConfigService)` instead of continuing to read `process.env` — see Example 2 below, since `src/main.ts` currently gets this wrong.

> 📖 Source: [docs.nestjs.com/techniques/configuration#using-the-configservice](https://docs.nestjs.com/techniques/configuration#using-the-configservice)

---

### Concept 3: Loading `.env`, `isGlobal`, `cache`, `ignoreEnvFile`, custom configuration files — where the trade-offs sit

**The problem it solves:** Not every app loads config the same way. A local environment reads a `.env` file; a production environment (container/CI) usually **has no `.env` file** — variables are injected straight into `process.env` by the platform (Docker, CI secrets, etc.). `ConfigModule.forRoot()` has an option for each situation:

| Option                | Meaning                                                                                                       | Trade-off                                                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `isGlobal: true`      | Registers `ConfigModule`/`ConfigService` app-wide, no need to re-import in every feature module               | Convenient, but it hides which module actually depends on config — a purely hexagonal approach would want each place to import explicitly                                |
| `envFilePath`         | Points to a file other than `.env` (e.g. `.env.development`), can be an array — earlier files take precedence | Allows multiple environments, but easy to get the precedence order wrong if you don't read the array carefully                                                           |
| `ignoreEnvFile: true` | Skips reading a `.env` file entirely, only uses variables already present in `process.env`                    | Correct for real production (deployed without a `.env`), but it **doesn't** disable validation — `validationSchema`/`validate()` still runs on `process.env`             |
| `cache: true`         | Caches `process.env` after the first read so `ConfigService.get()` is faster                                  | Only enable this once you're sure config won't change at runtime (true for most apps) — has nothing to do with validation                                                |
| `load: [factory]`     | Loads an extra factory function that returns an arbitrarily nested config object (e.g. `database.host`)       | Flexible, but **the object returned from `load` is NOT automatically checked by `validationSchema` (Joi)** — you must write that validation logic by hand in the factory |

**How Nest does it:** for the current project, `isGlobal: true` is a reasonable choice (multiple feature modules: `tasks`, `users`, and future modules) — L07 (Prisma) and L13 (JWT) will both need to read config, and re-importing `ConfigModule` in every module would be unnecessary repetition.

**When NOT to use `isGlobal: true`:** if you're deliberately keeping a strict hexagonal boundary — every module that needs config must _explicitly declare_ that dependency via `imports: [ConfigModule]` — then `isGlobal: true` blurs that boundary (everyone gets `ConfigService` without declaring it). This is a point you can decide differently yourself during hands-on; this lesson note only states the trade-off, it doesn't impose a choice.

> 📖 Source: [docs.nestjs.com/techniques/configuration#custom-env-file-path](https://docs.nestjs.com/techniques/configuration#custom-env-file-path), [#custom-configuration-files](https://docs.nestjs.com/techniques/configuration#custom-configuration-files), [#cache-environment-variables](https://docs.nestjs.com/techniques/configuration#cache-environment-variables)

---

### Concept 4: Schema validation — the app refuses to start if a variable is missing

**The problem it solves:** This is the core goal of issue NES-7. Without validation, a missing variable only surfaces once the code reaches the line that reads it (possibly in the middle of a real request, the same problem as in Concept 1). To make the app **fail fast at bootstrap** — before `app.listen()` — validation needs to run as soon as `ConfigModule` finishes loading.

**How Nest does it — 2 options**, both of which run while `ConfigModule.forRoot()` is being resolved (meaning **before** `NestFactory.create()` returns, before `app.listen()` runs):

**Option A — Joi (`validationSchema`):**

```ts
// file: src/app.module.ts (illustration — not yet applied)
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';

ConfigModule.forRoot({
  isGlobal: true,
  validationSchema: Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .default('development'),
    PORT: Joi.number().port().default(3000),
  }),
});
```

**Option B — a custom `validate()` with `class-validator`** (the repo already has `class-validator` + `class-transformer` from L05 — choosing B means **0 new dependencies**, unlike A which needs `joi`):

```ts
// file: src/config/env.validation.ts (illustration — doesn't exist yet)
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, Max, Min, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;
}

export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validated;
}
```

**The refuse-to-start behavior — exactly what happens:** both approaches **throw a synchronous exception** while `ConfigModule` is being initialized, which is inside `NestFactory.create(AppModule)` — before `main.ts` can reach `app.listen()`. Because `bootstrap()` in the current `main.ts` is `async` and the final call is `void bootstrap();` (no `await`, no `.catch()`), that exception surfaces as an **unhandled promise rejection**: Node prints a stack trace (with the Joi/class-validator error message describing exactly which variable is wrong) and the process stops — the server **never reaches `app.listen()`**, so no port ever gets opened. This is something you need to observe yourself in the hands-on step (see 🛠 Hands-on below) — this lesson note describes the mechanism per the official docs, it isn't a claim that this was already run.

**An easy point to get wrong:** `validationSchema` (Joi) **only inspects the keys present in the merged `.env`/`process.env`** — it does **not** validate the object returned from `load: [customFactory]` (see Concept 3). If you use a custom configuration file for nested config (`database.host`, etc.), the validation logic for that part must be written by hand inside the factory function — the docs say so explicitly: _"configuration files aren't automatically validated, even if you're using the `validationSchema` option"_.

**When NOT to use it:** don't validate variables that aren't used yet at this lesson (e.g. `JWT_SECRET`, `DATABASE_URL` — used from L13/L07). Adding them to the schema now would be validating a feature that doesn't exist, which violates this repo's "don't over-engineer" principle (`AGENTS.md`).

> 📖 Source: [docs.nestjs.com/techniques/configuration#schema-validation](https://docs.nestjs.com/techniques/configuration#schema-validation), [#custom-validate-function](https://docs.nestjs.com/techniques/configuration#custom-validate-function)

---

## 🔗 Connecting to prior knowledge

| Prior knowledge                                                                                                            | NestJS equivalent                                                                                                                                                                             | Where it differs                                                                                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Express + `dotenv`: call `dotenv.config()` once in `index.js`, then read `process.env.X` scattered across routes/services  | `ConfigModule.forRoot()` wraps `dotenv` (the same package Express already used) + `ConfigService` is a single access point                                                                    | Nest adds a **validate right at bootstrap** step — Express+dotenv has no built-in notion of this, you have to write it by hand (and it usually gets skipped)                                   |
| Prisma: `DATABASE_URL` in `.env`, `PrismaClient` reads it automatically via `dotenv`/process environment variables on init | Starting L07, `DATABASE_URL` will be read through `ConfigService` and passed into `PrismaService`, instead of letting Prisma silently read `process.env` itself                               | Same `.env` source, but NestJS centralizes reading + validation into one layer, and Prisma only receives an already-validated value                                                            |
| Hexagonal architecture: domain/business logic doesn't depend directly on infrastructure (DB, file system, real env)        | `ConfigService` acts as an **adapter** between the "outside world" (`process.env`, the `.env` file) and domain code — domain code only knows `configService.get('X')`, not where `.env` lives | Calling `process.env.X` directly inside a service means domain code leaks knowledge of infrastructure (exactly what hexagonal wants to avoid); `ConfigService` is a more explicit port/adapter |

**Something I used to misunderstand:** This section is normally for a **personal** misunderstanding discovered while coding it yourself — but this lesson's hands-on was executed as a substitute by Hermes/Codex (see the disclaimer at the top of the file), so there's no real personal experience to record here. Instead, here are 2 points Claude Code found worth noting when reading back the PR #82 diff against the illustrations above:

1. Example 2 illustrates `configService.get<number>('PORT', 3000)` — with a default value right at the `get()` call. The real code in `src/main.ts` does **not** pass a default: `app.get(ConfigService).get<number>('PORT')`, with an explicit throw if `undefined`. This is intentional, not an oversight: `validate()` already ran inside `ConfigModule.forRoot()` **before** this line, so by the time `main.ts` reaches `app.listen()`, `PORT` is guaranteed to already be a valid number — adding a default here would be dead code, or worse, would silently mask an invariant violation if one ever actually occurred (a bug elsewhere causing `ConfigService` to return `undefined` even though `validate()` passed).
2. `env.validation.ts` does not use `enableImplicitConversion: true` as illustrated in Concept 4 — instead it manually converts `PORT` to `Number` by hand, and **only** when the value is a non-empty string after `trim()`. Reason: `class-transformer`'s default implicit conversion turns an empty string `PORT=""` into `0` (a valid number per `@Min(0)`), letting the "forgot to set `PORT`" case slip past validation instead of being blocked — a subtler edge case than the simple illustration in the Theory section.

---

## 💻 Worked examples

### Example 1: Registering `ConfigModule` with validation — a starting point for `app.module.ts`

```ts
// file: src/app.module.ts (illustration of the part to ADD — not an applied diff)
import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation'; // if you choose Option B in Concept 4
// ...import the existing modules: AppController, AppService, TasksModule, ...

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate, // or validationSchema: Joi.object({...}) if you choose Option A
    }),
    // UsersModule, TasksModule, TasksConfigModule.forRoot(...) — keep as-is
  ],
  // controllers, providers stay unchanged
})
export class AppModule {}
```

**Explanation:**

- `ConfigModule.forRoot({...})` should be the **first reasonable** import in `imports` — other modules (if they need to read config right at init) depend on it being ready first.
- `isGlobal: true` means `TasksModule`, `UsersModule` don't need `imports: [ConfigModule]` added to inject `ConfigService`.
- If `validate` throws (missing `NODE_ENV`/`PORT` or a badly-formatted value), this entire `@Module({...})` never finishes initializing — the consequence described in Concept 4.

> 📖 Based on: [docs.nestjs.com/techniques/configuration#getting-started](https://docs.nestjs.com/techniques/configuration#getting-started)

### Example 2: The current `main.ts` reads `process.env.PORT` directly — this is what needs fixing

The **actual code currently in the repo** (`src/main.ts`):

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000); // ⚠️ reads process.env directly, "?? 3000" silently swallows the missing-variable case
}

void bootstrap();
```

The fix (illustration, you write this yourself during hands-on):

```ts
// file: src/main.ts (illustration — not yet applied)
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  await app.listen(configService.get<number>('PORT', 3000));
}

void bootstrap();
```

**Explanation:**

- `app.get(ConfigService)` fetches the provider `ConfigModule` already registered — this only works **after** `NestFactory.create()` has returned, meaning after the validation from Concept 4 has already passed.
- The default `3000` now lives in **one explicit place** (the 2nd argument to `get()`) instead of `??` — the runtime behavior is the same when `PORT` has a valid value, but when `PORT` is a garbage string (`PORT=abc`), the old `?? 3000` **cannot catch it** (the string `"abc"` isn't `undefined`/`null` so `??` doesn't trigger) — whereas with `validate`/`validationSchema` from Concept 4, a badly-formatted value gets blocked **before** this line ever runs.

> 📖 Based on: [docs.nestjs.com/techniques/configuration#using-in-the-maints](https://docs.nestjs.com/techniques/configuration#using-in-the-maints)

---

## 🛠 Hands-on

<!-- YOU write this part yourself. The agent does not do it for you. -->

**Requirements (from issue NES-7 + NES-72):**

1. **Don't create a new `.env.example`** — this file already exists at the repo root since L00 (`NODE_ENV`, `PORT`, and variables for later lessons). Open it, and only **add a new variable** to it if you decide you need one that doesn't exist yet (e.g. if you choose to add `TASKS_PAGE_SIZE`). If you don't add any variable, this step is already satisfied — no need to create a duplicate file.
2. Install `@nestjs/config`, and `joi` if you choose Option A in Concept 4 (Option B needs nothing extra — `class-validator`/`class-transformer` are already present from L05):
   ```bash
   pnpm add @nestjs/config
   # only run the line below if choosing Joi:
   pnpm add joi
   ```
3. Create the validation file (if choosing Option B) or write `validationSchema` directly in `app.module.ts` (if choosing Option A) — based on Example 1.
4. Edit `src/app.module.ts`: add `ConfigModule.forRoot({ isGlobal: true, validate/validationSchema })` at the start of the `imports` array.
5. Edit `src/main.ts`: replace `process.env.PORT ?? 3000` with a read through `ConfigService` — based on Example 2.

**How to verify:**

```bash
pnpm start:dev
# Observe: the app starts normally, Nest's log prints the listening port matching PORT in .env
```

```bash
# Try making the app refuse to start when an env variable is missing/invalid — this is the most important part of the lesson
cp .env .env.bak            # back up before editing
# edit .env: comment out the PORT= line (or change NODE_ENV=development to an invalid value)
pnpm start:dev
# Observe: the app does NOT start — the terminal prints an error describing exactly which variable is wrong (Joi or class-validator message),
# the process stops, and no "Application is running on..." line is ever printed because it never reached app.listen().
mv .env.bak .env             # restore .env
pnpm start:dev                # confirm the app starts normally again
```

```bash
pnpm test      # make sure existing tests aren't broken
pnpm test:e2e  # see the note below before running this — main.ts is not exercised by e2e
```

**Common snags and how to unblock them:**

- If `pnpm test:e2e` still passes **even though you deliberately broke `.env`**: that's expected — `test/*.e2e-spec.ts` builds the app via `Test.createTestingModule().createNestApplication()`, which **does not run `src/main.ts`**, so the part you edited in `main.ts` (reading `PORT` via `ConfigService`) is never exercised by any e2e test. This is exactly the trap already documented in the L05 lesson note (`docs/lessons/05-dto-pipes-validation/README.md`) — if you want automated test coverage for the "refuses to start when a required env variable is missing" behavior, you need a **dedicated unit test for the `validate()` function** (call it directly, no need to spin up the whole app) — not an e2e test.
- If the app still starts even after you delete a variable: check whether `validate`/`validationSchema` is actually being passed into `ConfigModule.forRoot({...})` — a copy-paste that drops the field is the most common mistake.
- If you see an error like "Cannot find module 'joi'": you chose Option A but forgot `pnpm add joi` in step 2.

### ✅ Execution-substitute evidence — PR #82 (real results, not a walkthrough)

> See the disclaimer at the top of the file: the section below describes code that **really ran** in PR #82 (`codex/nes-7-l06-config-implementation` → `main`, merge `f496a77`), not something Hien Duong did personally. No sentinel file `.hermes/runs/*.json` was found for this run (unlike previous lessons dispatched via pane) — the evidence here is the merged PR + green GitHub Actions CI + a re-verify done at closeout time.

**0. Dependency.** `@nestjs/config@^4.0.4` added to `dependencies` in `package.json`, `pnpm-lock.yaml` updated in the same commit. **Option B** from Concept 4 (`class-validator`, not Joi) — 0 new validation dependency, reusing `class-validator`/`class-transformer` already present from L05.

**1. `src/config/env.validation.ts` (the AC's validate).** `NodeEnvironment` enum (`development`/`production`/`test`). `EnvironmentVariables` class: `NODE_ENV` (`@IsDefined @IsEnum(NodeEnvironment)`), `PORT` (`@IsDefined @IsNumber({allowInfinity:false,allowNaN:false}) @IsInt @Min(0) @Max(65535)`). The `validate()` function converts `PORT` to `Number` by hand only when it's a non-empty string after `trim()` (avoiding the empty-string-becomes-`0` bug, see "Something I used to misunderstand"), then `plainToInstance` + `validateSync({ skipMissingProperties: false })`; throws an `Error` listing every invalid property/message.

**2. `src/app.module.ts`.** `ConfigModule.forRoot({ isGlobal: true, validate })` is the first import in the `imports` array, with a comment explaining why `class-validator` was chosen over adding Joi.

**3. `src/main.ts`.** `bootstrap()` was changed to an `export async function` (to be testable), reads `const port = app.get(ConfigService).get<number>('PORT')` — no default passed (see "Something I used to misunderstand" #1) — throws an explicit `Error` if `undefined`, then `app.listen(port)`.

**4. Tests.** `src/config/env.validation.spec.ts`: 1 case with valid config returns a correctly-typed instance + `it.each` with 5 invalid cases (missing `NODE_ENV`, missing `PORT`, invalid `NODE_ENV` value, non-numeric `PORT`, empty-string `PORT`) all throw with the correct property name, plus 1 case for `PORT` exceeding the TCP range (65536). `src/main.spec.ts`: mocks `NestFactory.create`, asserts `bootstrap()` calls `app.get(ConfigService)` → `configService.get('PORT')` → `app.listen(port)` in the correct order with the resolved value.

**5. E2E setup.** `test/tasks.e2e-spec.ts` etc. build the app via `Test.createTestingModule({ imports: [AppModule] }).createNestApplication()` — this **does not run `main.ts`**, but it does import `AppModule`, so `ConfigModule.forRoot({ validate })` still runs validation at `createTestingModule()` time. `test/setup-env.ts` (new, run via `setupFiles` in `test/jest-e2e.json`) supplies `process.env.NODE_ENV ??= 'test'` and `process.env.PORT ??= '3000'` — non-secret values — so that import doesn't throw in the e2e environment.

**Contract preserved.** `main.ts` still calls `app.listen(port)` exactly once with a numeric port; behavior when `PORT` is valid is unchanged — only the behavior when `PORT` is missing/invalid changes (refuses to start instead of a silent fallback), exactly the lesson's goal, not a broken contract.

**Verify results (re-run at closeout time, 2026-08-26, matching PR #82's CI):** `pnpm test` — 9 suites / 28 tests pass. `pnpm test:e2e` — 3 suites / 13 tests pass (no new e2e case, per the note above: `main.ts` isn't exercised by e2e). `pnpm verify` (lint `--max-warnings=0` + prettier check + jest + build) — PASS. GitHub Actions CI on PR #82 (`Lint · Test · Build`) — SUCCESS, merge commit `f496a77543c4f2d073284ee7400127b86f8aa139`.

---

## ✅ Review & Quiz

> The answers below are **execution-substitute evidence** from Claude Code (see the disclaimer at the top of the file), based directly on the real code in PR #82 and the original docs — not Hien Duong's own answers.

1. **Q:** If `ConfigModule` doesn't set `isGlobal: true`, what happens when a feature module (e.g. `TasksModule`) tries to inject `ConfigService` without its own `imports: [ConfigModule]`? What benefit does forcing every module to explicitly declare `imports: [ConfigModule]` bring to the hexagonal boundary (ports & adapters) that `isGlobal: true` erases?
   **Answer:** Without `isGlobal: true`, `ConfigModule` only exists within the scope of the module that imported it (here, `AppModule`) — Nest's DI is scoped per module. `TasksModule` trying to inject `ConfigService` without `imports: [ConfigModule]` makes Nest throw right at bootstrap (`NestFactory.create`), an `UnknownDependenciesException`: _"Nest can't resolve dependencies of the TasksService (?). Please make sure that the argument ConfigService at index [0] is available in the TasksModule context"_ — a different kind of "refuses to start" error, caused by an unresolved module graph, not by `validate()` from Concept 4. The benefit of forcing every module to declare `imports: [ConfigModule]` itself: a module's `imports` becomes an explicit list of every infrastructure port/adapter it depends on — reading just that module file is enough, no need to know the whole app's wiring. `isGlobal: true` trades that explicitness for convenience (not repeating the import in every feature module) — exactly the tradeoff already stated in Concept 3.

2. **Q:** How do `validationSchema` (Joi) and a custom `validate()` (using `class-validator`) differ in scope — specifically regarding the object returned from `load: [customFactory]`? Why will this difference matter once you write `database.config.ts` with `registerAs()` in Lesson 07?
   **Answer:** Both mechanisms only run on the flat `process.env`/`.env` object that `ConfigModule` merges **before** any `load` factory runs — neither automatically validates the **return value** of `load: [factory]`/`registerAs()`, since that factory builds an arbitrary nested object of its own (no longer a raw string from env). In L07, if `database.config.ts` is written as `registerAs('database', () => ({ url: process.env.DATABASE_URL, ... }))`, a missing/invalid `DATABASE_URL` will **not** be caught by the existing `validate()` in `env.validation.ts` — either `DATABASE_URL` must be added to the `EnvironmentVariables` class itself so it's validated at the raw-env step, or the factory must throw on an invalid value itself; skip both and the error only surfaces later — when `PrismaClient` actually tries to connect — defeating the "fail fast at bootstrap" goal this lesson is building toward.

3. **Q:** Do `ignoreEnvFile: true` and having a `validationSchema`/`validate` at the same time conflict with each other? Explain precisely which data source gets validated in that case.
   **Answer:** No conflict — the two options answer two different questions. `ignoreEnvFile: true` only decides the **source** of the values: whether a `.env` file gets read at all (correct for real production, where the platform injects straight into `process.env`, with no `.env` file). `validate`/`validationSchema` always runs on the **final result** currently in `process.env` at the moment `ConfigModule.forRoot()` resolves — regardless of where that value came from. With `ignoreEnvFile: true`, the set of values being validated is just whatever the platform set directly on `process.env` (no merge from `.env`); without it, that set is `process.env` merged with `.env` (real shell variables override `.env`). In other words, `ignoreEnvFile` decides the **input**, while `validate`/`validationSchema` decides **whether that input is accepted** — two independent, composable layers, not mutually exclusive.

4. **Q:** Why is `await app.listen(process.env.PORT ?? 3000)` (the code currently in `main.ts`) considered a more dangerous "silent fallback" than having no fallback at all? After you fix it with `ConfigService` + schema validation, what's the expected behavior when `PORT` is set to a non-numeric string (e.g. `PORT=abc`) — how does it differ from before the fix?
   **Answer:** `??` only triggers when the value is `null`/`undefined`. A value that **exists but is badly formatted**, like `PORT=abc`, isn't `undefined`, so `??` doesn't catch it — the string `"abc"` is passed straight into `app.listen()`, causing the app to bind the wrong port/behave unexpectedly **with no error clearly pointing at `PORT`** — more dangerous than "no fallback" because it hides a real configuration error instead of reporting it immediately. After the fix (PR #82): `PORT=abc` is caught immediately by `validate()` in `env.validation.ts` inside `ConfigModule.forRoot()` — `@IsInt()`/`@IsNumber()` fails, `validate()` throws an `Error` describing exactly the `PORT` field, and that exception surfaces before `NestFactory.create()` returns, so the process stops **before ever reaching the `app.listen()` line** — unlike before the fix, where the app kept "running" (silently binding the wrong port) instead of stopping with a clear error.

5. **Q:** `test/*.e2e-spec.ts` builds the app via `Test.createTestingModule().createNestApplication()`, which doesn't go through `main.ts`. What does this mean for writing an automated test that checks "the app refuses to start when a required env variable is missing"? Where would you put that test, and what would it check directly?
   **Answer:** Since `bootstrap()` in `main.ts` (the `app.get(ConfigService).get('PORT')` line + throw if `undefined`) is never reached by e2e, e2e **cannot** prove "the process refuses to start" in the true end-to-end sense. Real proof has to live at the unit level, in the exact two places that actually enforce fail-fast: `src/config/env.validation.spec.ts` calls `validate(config)` directly with various missing/invalid `NODE_ENV`/`PORT` combinations and asserts it throws (this is where "the app refuses to start on bad env" is actually proven, no app needs to be built at all); `src/main.spec.ts` mocks `NestFactory.create` to assert `bootstrap()` calls `app.get(ConfigService)` → `.get('PORT')` → `app.listen()` in the correct order. These two tests (already present in PR #82) together cover exactly the two points that e2e structurally cannot reach.

**Reviewing the previous lesson:** L05 used DTOs + `ValidationPipe` to validate data at the **HTTP request boundary** (whatever the client sends in, reject it right away if it's wrong). L06 applies the exact same "fail fast at the boundary" philosophy to a different boundary: the **process boundary** (the environment variables the app receives at startup) — the same principle, two different points in the request/process lifecycle.

---

## 🧠 Key takeaways

1. `ConfigService` centralizes reading environment variables + validating right at bootstrap, replacing scattered `process.env.X` reads that nothing guarantees exist.
2. `isGlobal: true` avoids repeating `imports: [ConfigModule]` in every feature module — in exchange, the dependency boundary between modules becomes blurrier.
3. `validationSchema` (Joi) only inspects keys in `.env`/`process.env`; an object from `load: [customFactory]`/`registerAs()` is **not** automatically validated — that logic must be written by hand in the factory.
4. There are 2 equivalent fail-fast approaches: Joi (`validationSchema`, adds 1 new dependency) or a custom `validate()` with `class-validator` (0 new dependencies, already present from L05) — this is your choice to make, there's no single correct answer. **PR #82 chose Option B** (`class-validator`) — 0 new validation dependency.
5. `src/main.ts` (before PR #82) read `process.env.PORT ?? 3000` directly — this is exactly the line this lesson asks you to fix; the current e2e tests don't catch a mistake in that line (because e2e doesn't go through `main.ts`) — real coverage lives in `env.validation.spec.ts` + `main.spec.ts` (unit), not e2e.

---

## 📎 Sources

- [docs.nestjs.com/techniques/configuration](https://docs.nestjs.com/techniques/configuration)
- [github.com/motdotla/dotenv](https://github.com/motdotla/dotenv) — the package `@nestjs/config` wraps internally
- [github.com/sideway/joi](https://github.com/sideway/joi) — if choosing Option A in Concept 4
- `docs/lessons/05-dto-pipes-validation/README.md` — the `createTestingModule` trap where `main.ts` never runs, which applies here too
