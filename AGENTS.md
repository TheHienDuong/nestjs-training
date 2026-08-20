# AGENTS.md — General Contract for All AI Agents

> All agents (Claude Code, codex, agy, or any other agent) **must read this file before working** in the repo.
> Claude Code has supplementary dedicated instructions in `CLAUDE.md` .

## Project Context

This is a **NestJS learning project**, not a commercial product. The user is a beginner backend developer (already familiar with basic Node.js / Express / Prisma / hexagonal architecture), currently learning NestJS 11 following `docs.nestjs.com` . The final course product is a **Task Management API** (User / Project / Task / Comment).
This changes how agents should behave: **the goal is for the learner to make progress, not to complete tasks quickly.**

## Two Absolute Rules

1. **Do not perform hands-on coding for the learner** unless explicitly assigned (issues labeled `agent:codex`, or the corresponding label for other tools acting as the Coder, or direct user request). Default behavior: provide suggestions, point out errors, ask clarifying questions — do not provide complete code.
2. **No agent may review its own generated code.** Code produced by an agent must be submitted via PR for automated review by **the Codex GitHub App connector (layer 1, every PR — `chatgpt-codex-connector[bot]`)** and final sign-off by the **user (lead reviewer)** before merge; large MRs (`mr/*`) add a **Copilot gatekeeper** review (max 2/day). **Only the user merges.** The rationale is documented in `docs/workflow/REVIEW-MODEL.md` + `docs/workflow/AGENT-MODEL.md`.

## Bilingual Policy (two-version rule)

The repo has **2 versions**: branch `main` is Vietnamese, branch `example/nestjs-training` is the English mirror.

- Every document in the repo exists in 2 versions: `main` = Vietnamese, `example/nestjs-training` = English.
- When changing any docs/config: **update both versions**, with equivalent content, no drift.
- Code (`src/`, `test/`) is identical across the 2 versions — only docs/config differ by language.
- GitLab (`gitlab` remote) **only accepts the English version** from `example/nestjs-training`.
- Commits on GitLab: author = `hienduong-agility`, **no** `Co-authored-by` trailer, message written in English.
- Check before calling it done: the 2 versions do not drift (diff empty), the EN version has no Vietnamese characters left.

## Role Assignment

There are two fixed **roles**, not two fixed tool lists — any tool that fills the "Coder" role must adhere to the same standard:

| Role                                                    | Assigned To                                                                       | Boundaries                                                            |
| ------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Mentor · PM**                                         | Always Claude Code (fixed — reason documented in `docs/workflow/AGENT-MODEL.md` ) | No hands-on coding; does not review PR code; does not merge PRs       |
| **Reviewer code-quality (layer 1, automated EVERY PR)** | Codex GitHub App connector (`chatgpt-codex-connector[bot]`)                       | Reviews on PR open/sync; does not merge, no dedicated workflow needed |
| **Gatekeeper (large MRs, max 2/day)**                   | Copilot CLI (GitHub, dispatched via herdr)                                        | ONLY branch `mr/*`; small PRs do NOT use it                           |
| **Lead reviewer + merge**                               | User (Hien Duong, `@TheHienDuong`)                                                | Final decision; **only the user merges**                              |
| **Coder**                                               | codex (only tool in this role)                                                    | Branch `codex/nes-XX-...` ; all output submitted via PR               |
| **Counter-view**                                        | agy (2026-08-20, replaces opencode) — dispatched via herdr pane, NO wrap          | Branch `agy/nes-XX-...` ; not a Coder, not the primary reviewer       |

> **Mandatory code-owner approval (2026-08-20):** `@hienduong-agilityio` must approve every PR before the merge button is enabled on GitHub (`.github/CODEOWNERS`, only Claude Code creates/edits this file). This is an additional gate — it does **not** change merge rights, still only the user (`@TheHienDuong`) presses merge. Full reviewer roles (Claude Local Reviewer, Codex GitHub App connector automated, Copilot gatekeeper for large MRs): see `docs/workflow/REVIEW-MODEL.md`.
>
> ⚠️ **`agy` = counter-view; `opencode` has been removed from the system (2026-08-20).** agy dispatches via a herdr pane (profile `coder-agy`, NO headroom wrap — runs bare), not a Coder, not the primary reviewer.

**MCP:** Linear is open to both Claude Code (PM role) and the tool acting as the Coder (codex) — the coder may configure the Linear MCP itself to read, create, and track its own tasks, but **must not arbitrarily modify issues outside its own tasks** (no status/assignee changes on issues under Claude's review, no edits to issues Claude created for PM purposes). **Notion/Slack/Postman remain only Claude Code connects to (single-writer)** — the tool acting as the Coder does not configure these 3 MCP servers. The Coder still receives specs for learning tasks via the `docs/lessons/XX-*/SPEC.md` file (generated by Claude Code at the `/lesson-start` step) — it does not modify `SPEC.md` itself. Reason: [ADR-0004](docs/adr/0004-mcp-single-writer-for-coder-agent.md) (amended 2026-08-13).

## Project Structure

```
src/                    # application code
  main.ts               # bootstrap
  app.module.ts         # root module
  <feature>/            # each feature contains: .module.ts + .controller.ts + .service.ts + .spec.ts
test/                   # e2e tests (*.e2e-spec.ts), separate config at test/jest-e2e.json
docs/
  ROADMAP.md            # 8 phases, ~26 lessons
  workflow/             # WORKFLOW.md, AGENT-MODEL.md
  adr/                  # architecture decision records
  lessons/XX-*/         # lesson notes in Vietnamese
```

templates/ # template lesson note, retro
dist/ # output build — DO NOT edit manually

````

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
pnpm verify                 # runs exactly what CI runs — use before opening a PR
pnpm db:up / db:down    # postgres + redis via docker compose
````

**The package manager is pnpm.** Using npm or yarn will create a second lockfile and turn CI red.

## Coding style

- TypeScript + decorator + NestJS DI. Dependencies are injected via **constructor injection**; do not manually instantiate with `new`, do not import global singletons.
- Layer separation: `*.controller.ts` handles only HTTP · `*.service.ts` holds business logic · `*.module.ts` handles wiring. **Business logic does not belong in controllers.**
- Follow Nest naming conventions: `TasksController` in `tasks.controller.ts`, `TasksService` in `tasks.service.ts`, `TasksModule` in `tasks.module.ts`.
- One feature = one `src/<feature>/` folder, created exactly once. **Look-before-create**: check whether `src/<feature>/` already exists with `test -d`/`find` (see [FILE-STRUCTURE.md](docs/workflow/FILE-STRUCTURE.md)) before creating a new file/feature; if it already exists, extend it instead of creating a parallel copy.
- Prettier: use single quotes, trailing commas. Prettier manages formatting for `.ts`, `.json`, `.md`, `.yml` — **do not format manually**, run `pnpm format`.- `tsconfig.json`: `strictNullChecks: true`, `noImplicitAny: false`. The `no-explicit-any` rule is disabled in ESLint, but you should still **avoid `any`** — reviewers will flag it.
- **CI runs `eslint --max-warnings=0`** → even warnings will fail the CI, including `no-floating-promises`.

## Code Review Rules

The single source of truth for review rules — every reviewer (Claude Code, Codex GitHub App connector,
Copilot, agy) reads this section, and does not copy the rules into its own separate
file (see `docs/workflow/REVIEW-MODEL.md` §6 — the rulebook table points here). Issue
severity: **P0** (blocks merge), **P1** (should fix before merge), **P2** (suggestion,
non-blocking).

- **Controllers only handle HTTP** — no business logic, no direct DB queries. Business
  logic must live in `*.service.ts`.
- **DI via constructor injection** — no manual `new`, no importing global singletons.
- **Error handling + transactions:** multi-step side effects need clear error handling;
  multi-step operations need consistency (transactions) if a mid-step failure is possible.
- **Cross-file consistency:** changing one file (e.g. a shared DTO/interface) requires
  checking dependent files — do not let types/contracts drift between modules.
- **No over-engineering:** this is a learning project, complexity must match the current
  lesson — do not add abstractions for use cases that don't exist yet.
- **Tests:** include error-case tests, not just the happy path (see the Testing section
  below).
- **Basic security:** never log secrets/tokens/passwords; never return
  `password`/`refreshToken` in a response; validate input at the boundary (DTO +
  `ValidationPipe`).

## Testing

- Unit test files `*.spec.ts` are placed **next to** their corresponding source files in `src/`. E2E tests are located in `test/` with the `.e2e-spec.ts` extension.
- Use `Test.createTestingModule()` from `@nestjs/testing`.
- Tests should verify **behavior**, not just check if mocks were called. Always include error cases, not just happy paths.
- If you change behavior, you must update the corresponding tests. Run `pnpm test` before opening a PR.

## Commit & PR

**Conventional Commits** — `commitlint` enforces this via the `commit-msg` git hook:

```
<type>(<scope>): <description>

feat(tasks): add CRUD endpoints for tasks
docs(lesson-02): notes about controllers and routing
chore: bump @nestjs/core to 11.1.28
```

Allowed types: `feat` `fix` `docs` `test` `refactor` `chore` `style` `perf` `revert` .

- Branches: use the exact name generated by Linear (`hien/nes-XX-...`). Coding agents use the prefix matching their tool name: `codex/nes-XX-...`. The counter-view role (agy) uses `agy/nes-XX-...`.
- PR descriptions must include `Fixes NES-XX` (for agent PRs, reference the assigned issue).
- Use squash and merge. Do not push directly to `main` — branch protection is enabled.
- **Never use `git commit --no-verify`.** These hooks are quality guardrails, not obstacles.

## File Boundaries| Path | Who can edit |

| ---- | ------------ |
| `src/**` , `test/**` | User (hands-on) · coder agent (when explicitly assigned, separate branch) |
| `docs/lessons/**/SPEC.md` | Only Claude (mirrored from Linear) — coder agent only reads, no edits |
| `docs/lessons/**` | Claude (drafting) + user (personal notes) |
| `docs/adr/**` , `docs/workflow/**` | Claude, user reviews via PR |
| `.github/**` , `.husky/**` , `docker-compose.yml` , root config | Claude |
| `dist/` , `node_modules/` , `pnpm-lock.yaml` | Do not edit manually |

## Security & Configuration

- **Never commit secrets.** The `.env` file is already in `.gitignore`; only commit `.env.example` with dummy values.
- When adding new environment variables, you must add them to `.env.example` along with explanatory comments.
- Validate data at the input boundary (DTO + `ValidationPipe`) before passing it to the service.
- Do not log secrets, tokens, passwords. Do not return `password`/`refreshToken` in responses.

## Look up NestJS documentation

`docs.nestjs.com` is an Angular SPA — fetching HTML will **not** return the content. Get the original markdown:

```bash
gh api "repos/nestjs/docs.nestjs.com/contents/content/controllers.md" \
  -H "Accept: application/vnd.github.raw"
```

**Do not write NestJS code from memory when you can look it up.** Library version: `npm view <pkg> version` , do not guess.
