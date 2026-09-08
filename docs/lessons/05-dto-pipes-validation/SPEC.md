<!--
SPEC.md — task handoff source for the Coder agent (NES-6, L05).
Only Claude may edit this file (see docs/adr/0004-mcp-single-writer-for-coder-agent.md
and docs/workflow/AGENT-MODEL.md). The "Snapshot from Linear" section is copied verbatim
from the Linear NES-6 issue description. If the Linear issue changes later, update this
file at the same time.
-->

# NES-6 — L05 — DTO + Pipes + ValidationPipe

| Field      | Value                                                                                                       |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| Issue      | [NES-6](https://linear.app/food-ordering-api/issue/NES-6/l05-dto-pipes-validationpipe)                      |
| Project    | Phase 2 — Working with Data                                                                                 |
| Labels     | `hands-on`, `phase-2`                                                                                       |
| Priority   | Medium · Estimate 2 points                                                                                  |
| Branch     | `duongthehien2001/nes-6-l05-dto-pipes-validationpipe`                                                       |
| Sub-issues | NES-57 Theory & note · NES-60 Hands-on · NES-65 Review & quiz (all still in Backlog when the lesson opened) |

---

## Part A — Snapshot from Linear (verbatim from the NES-6 description)

### 🎯 Learning objectives

- [ ] Write DTOs with `class-validator` + `class-transformer`
- [ ] Enable a global `ValidationPipe`, understand `whitelist`/`forbidNonWhitelisted`/`transform`
- [ ] Write a simple custom Pipe yourself

### 📚 Official documentation

- [https://docs.nestjs.com/techniques/validation](https://docs.nestjs.com/techniques/validation)
- [https://docs.nestjs.com/pipes](https://docs.nestjs.com/pipes)

### 🔗 Connect to prior knowledge

Express: manual validation with `if (!body.title) throw ...` or a separate `joi`/`zod` middleware ↔ Nest: declare rules directly on the DTO via decorators, the Pipe runs automatically before the handler — validation becomes declarative instead of imperative.

### 🛠 Hands-on

1. Create `CreateTaskDto`/`UpdateTaskDto` with sensible validation rules (title required, status is an enum...)
2. Enable a global `ValidationPipe` in `main.ts`

### ✅ Definition of Done

- [ ] Lesson note complete
- [ ] Tests pass (including the DTO-invalid → 400 case), quiz pass, PR merged

---

## Part B — Acceptance criteria (interpreted by Claude from Part A, matching the repo's current state)

> Part B does **not** exist in the Linear description. It is a detailed elaboration so the reference implementation has verifiable criteria. If it diverges from Part A, Part A wins.

**AC1 — Dependency.** `class-validator` (currently `0.15.1`) and `class-transformer` (`0.5.1`) are in `dependencies` of `package.json`, installed with **pnpm**, `pnpm-lock.yaml` updated in the same commit. The repo currently does **not** have these two packages.

**AC2 — `CreateTaskDto`.** `src/tasks/dto/create-task.dto.ts`: `title` required, a string, not empty (including a string of only whitespace), with a reasonable length limit. No other field is accepted.

**AC3 — `UpdateTaskDto`.** `src/tasks/dto/update-task.dto.ts`: every field optional (`title?`, `completed?`), `completed` must be a real boolean, `title` applies the same rule as AC2 when present. Keep the current PATCH behavior (an empty body does not break the task).

**AC4 — Global `ValidationPipe`.** Enabled with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`, and must take effect in **both** runtime and e2e tests.

> ⚠️ A real constraint of this repo: `test/*.e2e-spec.ts` builds the app with `Test.createTestingModule(...).createNestApplication()`, which does **not** run the code in `src/main.ts`. If you only call `app.useGlobalPipes()` in `main.ts`, e2e will have no validation and the 400 tests in AC7 will fail. Choose **one** option and record the reason in the PR: (a) register via the `APP_PIPE` provider in `AppModule`; (b) keep `main.ts` and add the exact same configuration to each e2e setup.

**AC5 — Value import for DTOs.** `src/tasks/tasks.controller.ts` currently uses `import type { CreateTaskDto }` / `import type { UpdateTaskDto }`. A type-only import is erased at compile time → `metatype` is lost → `ValidationPipe` skips the DTO. Must change to a value import. Same issue in `src/users/users.controller.ts` if touched.

**AC6 — Custom pipe.** One simple, self-written pipe: a class with `@Injectable()`, implementing `PipeTransform`, throwing `BadRequestException` on bad input, bound at the right scope (param or method — no need for global), with a unit test `*.spec.ts` placed next to the source file.

**AC7 — Tests, must include a DTO-invalid → HTTP 400 case.**

- `POST /tasks` body `{}` → **400**, `message` is an array containing an error for `title`.
- `POST /tasks` body `{ "title": "" }` (and a whitespace-only variant) → **400**.
- `POST /tasks` body `{ "title": "ok", "hacker": true }` → **400** when `forbidNonWhitelisted` is enabled (if only `whitelist` is chosen, it must be **201** + the extra field stripped; the test must match the exact configuration chosen in AC4).
- `PATCH /tasks/:id` body `{ "completed": "yes" }` → **400**.
- `GET /tasks/abc` → **400** (regression for the `ParseIntPipe` already present since L02/L04).
- Unit test for the custom pipe: valid input returns the transformed value; bad input throws `BadRequestException`.
- All existing CRUD tests (`test/tasks.e2e-spec.ts`, `test/users.e2e-spec.ts`, `src/**/*.spec.ts`) still pass.

**AC8 — Quality gate.** `pnpm verify` green (lint `--max-warnings=0` + prettier check + jest + build). E2E runs separately via `pnpm test:e2e`.

**AC9 — No change to the existing contract.** The Task response keeps the shape `{ id, title, completed }`; `GET /tasks` keeps the `Cache-Control: no-store` header; `DELETE` keeps 204.

### Points requiring a user decision before coding

Part A says _"title required, status is an enum..."_ but the current model in `src/tasks/tasks.service.ts` is `completed: boolean`, and `test/tasks.e2e-spec.ts` plus the Postman collection already follow that shape.

- **Default of this SPEC:** keep `completed: boolean` and validate it with `@IsBoolean()` — treat "status is an enum" in Part A as an illustrative example of "a sensible rule", not a requirement to change the model.
- **If the user wants a real enum:** that is a contract change (adding `TaskStatus`), requiring the service, e2e tests, and Postman collection to be updated at the same time → call it out explicitly in the PR, do not do it silently.

## Part C — Boundaries for the reference implementation (coder agent)

- May only edit `src/**`, `test/**`, and `package.json` + `pnpm-lock.yaml` (**only** to add `class-validator` + `class-transformer`).
- **Do not** touch `docs/**` (including this SPEC file), `.github/**`, `.husky/**`, `postman/**` — unless the user decides to change the contract per the section above.
- New files must have the header comment `// [NES-6 · lesson 05] <file role>`.
- **Keep the existing teaching comments** in `src/tasks/**` and `src/users/**` — a lesson from PR #60: removing teaching comments strips `main`'s teaching value.
- Separate branch `codex/nes-6-...`, output goes through a PR with a `Fixes NES-6` line; **do not** review your own PR, **do not** merge.
- The reference implementation should only be done **after** the user has completed the hands-on (NES-60) themselves — this is a solution for comparison, not a replacement.
