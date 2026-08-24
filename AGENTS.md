# AGENTS.md — General Contract for All AI Agents

> All agents (Claude Code, codex, agy, or any other agent) **must read this file before working** in the repo.
> Claude Code has supplementary dedicated instructions in `CLAUDE.md`.

## Project Context

This is a **NestJS learning project**, not a commercial product. The user is a beginner backend developer (already familiar with basic Node.js / Express / Prisma / hexagonal architecture), currently learning NestJS 11 following `docs.nestjs.com`. The final course product: a **Task Management API** (User / Project / Task / Comment).

This changes how agents should behave: **the goal is for the learner to make progress, not to complete tasks quickly.**

## Two Absolute Rules

1. **Do not perform hands-on coding for the learner** unless explicitly assigned (issues labeled `agent:codex` or the corresponding label for other tools acting as the Coder, or direct user request). Default: give suggestions, point out errors, ask counter questions — do not provide complete code.
2. **No agent reviews its own generated code.** Code an agent produces must go through a PR for the **Codex GitHub App connector to review automatically** (layer 1, every PR — `chatgpt-codex-connector[bot]`) and for the **user (lead reviewer) to sign off** before merge; a large MR (`mr/*`) adds a **Copilot gatekeeper** (max 2/day). **Only the user merges.** Rationale in `docs/workflow/REVIEW-MODEL.md` + `docs/workflow/AGENT-MODEL.md`.

## Bilingual Policy (two-version rule)

The repo has **2 versions**: branch `main` is Vietnamese, branch `example/nestjs-training` is the English mirror.

- Every document in the repo has 2 versions: `main` = Vietnamese, `example/nestjs-training` = English.
- When changing any docs/config: **update both versions**, with equivalent content, no drift.
- Code (`src/`, `test/`) is identical across both versions — only docs/config differ by language.
- GitLab (`gitlab` remote) **only accepts the English version** from `example/nestjs-training`.
- Commits on GitLab: author = `hienduong-agility`, **no** `Co-authored-by` trailer, message in English.
- Check before calling it done: the 2 versions do not drift (diff empty), the EN version has no Vietnamese characters left.

## Role Assignment

Two fixed **roles**, not two fixed tool lists — whichever tool fills the "Coder" role follows the same mold:

| Role                                                       | Assigned to                                                                  | Boundaries                                                            |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Mentor · PM**                                            | Always Claude Code (fixed — reason in `docs/workflow/AGENT-MODEL.md`)        | No hands-on coding; does not review PR code; does not merge PRs       |
| **Reviewer code-quality (layer 1, automated on EVERY PR)** | Codex GitHub App connector (`chatgpt-codex-connector[bot]`)                  | Reviews on PR open/sync; does not merge, no dedicated workflow needed |
| **Gatekeeper (large MRs, max 2/day)**                      | Copilot CLI (GitHub, dispatched via herdr)                                   | ONLY branch `mr/*`; NOT used for small PRs                            |
| **Lead reviewer + merge**                                  | User (Hien Duong, `@TheHienDuong`)                                           | Final decision; **only the user merges**                              |
| **Coder**                                                  | codex (sole holder of this role)                                             | Branch `codex/nes-XX-...`; output always via PR                       |
| **Counter-view**                                           | agy (2026-08-20, replaces opencode) — dispatched via herdr pane, NOT wrapped | Branch `agy/nes-XX-...`; not a Coder, not the primary reviewer        |

> **Code owner mandatory approval (2026-08-20):** `@hienduong-agilityio` must approve every PR before the merge button is available on GitHub (`.github/CODEOWNERS`, only Claude Code creates/edits this file). This is an additional gate — it does **not** change merge rights, still only the user (`@TheHienDuong`) can click merge. For the full reviewer role breakdown (Claude Reviewer local, automated Codex GitHub App connector, Copilot gatekeeper for large MRs): see `docs/workflow/REVIEW-MODEL.md`.
>
> ⚠️ **`agy` = counter-view; `opencode` has been removed from the system (2026-08-20).** agy is dispatched via herdr pane (profile `coder-agy`, NOT wrapped by headroom — runs bare), it is not a Coder, not the primary reviewer.

**MCP:** Linear is open to both Claude Code (PM role) and the tool acting as the Coder (codex) — the coder may configure the Linear MCP itself to read, create, and track its own tasks, but **must not arbitrarily edit issues outside its own tasks** (no status/assignee changes on issues under Claude's review, no edits to issues Claude created for PM purposes). **Notion/Slack/Postman remain connected only by Claude Code (single-writer)** — the tool acting as the Coder does not configure these 3 MCP servers. The Coder still receives specs for learning tasks via the `docs/lessons/XX-*/SPEC.md` file (generated by Claude Code at the `/lesson-start` step) — it does not edit `SPEC.md` itself. Rationale: [ADR-0004](docs/adr/0004-mcp-single-writer-for-coder-agent.md) (amended 2026-08-13).

## Project Structure

```
src/                    # application code
  main.ts               # bootstrap
  app.module.ts         # root module
  <feature>/            # each feature: .module.ts + .controller.ts + .service.ts + .spec.ts
test/                   # e2e tests (*.e2e-spec.ts), separate config at test/jest-e2e.json
docs/
  ROADMAP.md            # 8 phases, ~26 lessons
  workflow/             # WORKFLOW.md, AGENT-MODEL.md
  adr/                  # architecture decision records
  lessons/XX-*/         # lesson notes (Vietnamese)
  templates/            # lesson note template, retro
dist/                   # build output — DO NOT edit manually
```

## Commands

```bash
pnpm install            # install dependencies per pnpm-lock.yaml
pnpm start:dev          # dev, watch mode
pnpm build              # nest build → dist/
pnpm lint               # eslint --fix
pnpm format             # prettier --write
pnpm test               # unit test
pnpm test:e2e           # e2e test
pnpm test:cov           # coverage
pnpm verify                 # exactly what CI runs — use before opening a PR
pnpm db:up / db:down    # postgres + redis via docker compose
```

**The package manager is pnpm.** Using npm or yarn will create a second lockfile and turn CI red.

## Coding style

- TypeScript + decorator + NestJS DI. Dependencies flow through **constructor injection**, no manual `new`, no importing global singletons.
- Layering: `*.controller.ts` handles only HTTP · `*.service.ts` holds business logic · `*.module.ts` wires things together. **Business logic must not live in controllers.**
- Follow Nest naming conventions: `TasksController` in `tasks.controller.ts`, `TasksService` in `tasks.service.ts`, `TasksModule` in `tasks.module.ts`.
- Prettier: single quote, trailing comma. Prettier manages formatting for `.ts`, `.json`, `.md`, `.yml` — **do not format by hand**, run `pnpm format`.
- Every new reference code file must have a header comment in the form `// [NES-X · lesson NN] <file role>`, e.g. `// [NES-3 · lesson 02] Reference — controller, teaching comments inline`.
- One feature = one `src/<feature>/` folder, created exactly once. **Look-before-create**: check whether `src/<feature>/` already exists with `test -d`/`find` (see [FILE-STRUCTURE.md](docs/workflow/FILE-STRUCTURE.md)) before creating a new file/feature; if it already exists, extend it instead of creating a parallel copy.
- Agents running in parallel: each the the agent touches only its own module; shared files (`app.module.ts`, `package.json`, `docs/ROADMAP.md`, `docs/lessons/_agent-log.md`, `docs/templates/*`) are merged by Hermes — do not touch them concurrently. Details: [FILE-STRUCTURE.md](docs/workflow/FILE-STRUCTURE.md).
- `tsconfig.json`: `strictNullChecks: true`, `noImplicitAny: false`. `no-explicit-any` is disabled in ESLint, but still **avoid `any`** — the reviewer will catch it.
- **CI runs `eslint --max-warnings=0`** → even warnings will fail CI, including `no-floating-promises`.

## Code Review Rules

The single source of truth for review rules — every reviewer (Claude Code, Codex GitHub App
connector, Copilot, agy) reads this section rather than copying the rule into its own file
(see `docs/workflow/REVIEW-MODEL.md` §6 — the rulebook table points back here). Issue
severity: **P0** (blocks merge), **P1** (should fix before merge), **P2** (suggestion, non-blocking).

- **Controllers only handle HTTP** — no business logic, no direct DB queries. Business
  logic must live in `*.service.ts`.
- **DI via constructor injection** — no manual `new`, no importing global singletons.
- **Error handling + transactions:** multi-step side effects need clear error handling;
  multi-step operations need consistency (a transaction) if they can fail partway through.
- **Cross-file consistency:** changing one file (e.g. a shared DTO or interface) requires
  checking its dependents — don't let types/contracts drift between modules.
- **Do not over-engineer:** this is a learning project, complexity must match the current
  lesson — don't add abstractions for a use case that doesn't exist yet.
- **Tests:** cover error cases, not just the happy path (see the Testing section below).
- **Basic security:** don't log secrets/tokens/passwords; don't return `password`/`refreshToken`
  in responses; validate input at the boundary (DTO + `ValidationPipe`).

## Testing

- Unit tests `*.spec.ts` sit **next to** the source file in `src/`. E2E tests live in `test/`, with the `.e2e-spec.ts` extension.
- Use `Test.createTestingModule()` from `@nestjs/testing`.
- Tests check **behavior**, not just whether a mock was called. Always include an error case, not just the happy path.
- Changing behavior means updating the tests. Run `pnpm test` before opening a PR.

## Commit & PR

**Conventional Commits** — blocked at the `commit-msg` git hook by `commitlint`:

```
<type>(<scope>): <short description>

feat(tasks): add CRUD endpoints for tasks
docs(lesson-02): notes on controllers and routing
chore: bump @nestjs/core to 11.1.28
```

Allowed types: `feat` `fix` `docs` `test` `refactor` `chore` `style` `perf` `revert`.

- When a lesson is done: run `pnpm lesson --tag <NN>` to create the git tag `lesson/NN` marking that lesson's commit.
- Branch: use the **exact** name Linear generates (`hien/nes-XX-...`). The coder agent uses that tool's name as the prefix: `codex/nes-XX-...`. The counter-view role (agy) uses `agy/nes-XX-...`.
- PR description must include `Fixes NES-XX` (an agent's PR references the issue it was assigned).
- Squash and merge, **merged by the user** (no agent merges). Never push straight to `main` — branch protection is enabled.
- **Never use `git commit --no-verify`.** The hook is a quality guardrail, not an obstacle.

## File Boundaries

| Path                                                         | Who may edit                                                                                    |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `src/**`, `test/**`                                          | User (hands-on) · coder agent (when explicitly assigned, dedicated branch)                      |
| `docs/lessons/**/SPEC.md`                                    | Only Claude (a snapshot from Linear) — the Coder the the agent only reads it and never edits it |
| `docs/lessons/**`                                            | Claude (writes) + user (personal notes)                                                         |
| `docs/adr/**`, `docs/workflow/**`                            | Claude, user approves via PR                                                                    |
| `.github/**`, `.husky/**`, `docker-compose.yml`, root config | Claude                                                                                          |
| `dist/`, `node_modules/`, `pnpm-lock.yaml`                   | Never edit by hand                                                                              |

## Security & Configuration

- **Never commit a secret.** `.env` is already in `.gitignore`; only commit `.env.example` with fake values.
- Adding a new environment variable requires adding it to `.env.example` with an explanatory comment.
- Validate data at the input boundary (DTO + `ValidationPipe`) before it reaches the service.
- Never log secrets, tokens, passwords. Never return `password`/`refreshToken` in a response.

## Looking up NestJS documentation

`docs.nestjs.com` is an Angular SPA — fetching the HTML will **not** return the content. Get the raw markdown:

```bash
gh api "repos/nestjs/docs.nestjs.com/contents/content/controllers.md" \
  -H "Accept: application/vnd.github.raw"
```

**Don't write NestJS code from memory when you can look it up.** Library version: `npm view <pkg> version`, don't guess.
