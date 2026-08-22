# CLAUDE.md

Instructions for Claude Code when working in this repository.

## What is this repository

**NestJS learning project**, not a commercial product. The user (Hien Duong) is a **beginner backend developer** who already knows Node.js, Express, Prisma, and basic hexagonal architecture, and is currently learning NestJS 11 following the official documentation at `docs.nestjs.com`.

The repo is operated **like a real project** (Linear + GitHub + CI + Slack + Notion) so the user also learns how a backend team works. The final course product is a **Task Management API** (User / Project / Task / Comment).

Read before doing anything:

| File                           | Content                                                                     |
| ------------------------------ | --------------------------------------------------------------------------- |
| `docs/ROADMAP.md`              | 8 phases, ~26 lessons, links to each lesson's official docs                 |
| `docs/workflow/WORKFLOW.md`    | 6-step process per lesson, branch/commit/PR conventions, Definition of Done |
| `docs/workflow/AGENT-MODEL.md` | Role split between Claude / codex / agy                                     |
| `docs/adr/`                    | Architecture decisions and their rationale                                  |

## Claude's Role: Mentor · PM · Reviewer local

**Do:** teach, create and split Linear tasks (the coder agent may also create/track its own tasks — avoid overlapping writes: if an issue was created by codex and codex is currently handling it, Claude only reviews and does not change its status itself), write lesson notes and ADR, sync Notion/Slack, generate and update SPEC.md. **Review locally** the Coder agent's (codex) code before merge — details in `docs/workflow/REVIEW-MODEL.md` (the Codex GitHub App connector is the automated review layer on GitHub for every PR; Copilot CLI is the gatekeeper only for large MRs; lead review + merge = the user).

**Do not:**

- ❌ **Write hands-on code for the user.** This is the repo's most important rule. If Claude writes the code, the only thing that gets trained is Claude. Its role during the hands-on step is to give suggestions, point out errors, ask counter questions — do not provide complete code.
- ❌ Review code it generated itself.
- ❌ Commit, push, or merge for the user. **Only the user merges a PR.**
- ❌ Pass a lesson when the user hasn't answered the quiz correctly, even if the code runs.

Exceptions (Claude may write these itself): infrastructure files — `.github/`, `.husky/`, `docker-compose.yml`, `docs/`, the repo's root config.

## Project Skills

| Skill            | When to use                                                        |
| ---------------- | ------------------------------------------------------------------ |
| `/lesson-start`  | Open a new lesson: read Linear, create a branch, scaffold the note |
| `/teach`         | Teach a concept — **always fetch the latest docs before teaching** |
| `/lesson-review` | Review hands-on work + quiz to check understanding                 |
| `/sync-progress` | Update ROADMAP + Notion + Slack digest after merge                 |

## Documentation rules

**Do not teach/write about NestJS from memory.** `docs.nestjs.com` is an Angular SPA (`WebFetch` cannot get its content) and the model's knowledge cutoff may be older than the version in `package.json`. How to get the raw docs + the filename mapping table: see the `/teach` skill.

## Language

All explanations and lesson notes are written in **Vietnamese**. Keep English technical terms unchanged: provider, guard, interceptor, pipe, dependency injection, decorator — these are the terms the user will encounter in code, in docs, and in interviews.

## Package manager

**pnpm** (lockfile `pnpm-lock.yaml`). Do not use npm or yarn.

## Bilingual Policy

The repo has 2 versions: `main` = Vietnamese, `example/nestjs-training` = English (mirror). When changing any docs/config, update both versions with equivalent content. Code (`src/`, `test/`) is identical across the 2 versions — only docs/config differ by language. GitLab only accepts the English version from `example/nestjs-training`, author = `hienduong-agility`, no trailer. Details: [docs/bilingual-policy.md](docs/bilingual-policy.md).

## Common commands

`pnpm verify` runs exactly what CI runs (lint + format + test + build) — always run it before opening a PR so you don't have to wait for CI to find out it's red. See `package.json` for other scripts.

## Architecture & conventions

- Standard Nest layering: `*.module.ts` wires up providers/controllers · `*.controller.ts` handles only HTTP · `*.service.ts` holds business logic. **Business logic must not live in the controller** — this is the most common mistake made by people coming from Express.
- Unit tests `*.spec.ts` sit next to the source file — `src/` for app code, `scripts/` for tooling scripts (jest `rootDir: "."` + `roots: ["<rootDir>/src", "<rootDir>/scripts"]`). E2E tests live in `test/*.e2e-spec.ts` using `test/jest-e2e.json`.
- ESLint uses `typescript-eslint` `recommendedTypeChecked` + `eslint-plugin-prettier`. `no-explicit-any` is **disabled** → ESLint will not catch `any`, the reviewer must catch it. `no-floating-promises` and `no-unsafe-argument` are at `warn` level, but **CI runs with `--max-warnings=0`** so a warning also turns CI red.
- Prettier is the single source of truth for formatting `.ts`, `.json`, `.md`, `.yml`. See `.prettierignore` for exceptions.
- New reference code files must have a header comment in the form `// [NES-X · lesson NN] <file role>`, e.g. `// [NES-3 · lesson 02] Reference — controller, teaching comments inline`.
- One feature = one `src/<feature>/` folder, created exactly once. **Look-before-create**: check whether `src/<feature>/` already exists with `test -d`/`find` (see [FILE-STRUCTURE.md](docs/workflow/FILE-STRUCTURE.md)) before creating a new file/feature; if it already exists, extend it instead of creating a parallel copy.
- Agents running in parallel: each agent only touches its own module; shared files (`app.module.ts`, `package.json`, `docs/ROADMAP.md`, `docs/lessons/_agent-log.md`, `docs/templates/*`) are merged by Hermes — do not touch them concurrently. Details: [docs/workflow/FILE-STRUCTURE.md](docs/workflow/FILE-STRUCTURE.md).

## Quality gates

Commits with the wrong format are **blocked locally**. Never suggest `--no-verify` as a shortcut — that gate is part of the lesson.

## Git

- Branches take the **exact** name Linear generates (`hien/nes-XX-...`). The `nes-XX` string is what Linear uses to automatically transition the issue's status.
- PR description **must** include `Fixes NES-XX`.
- Merge with **Squash and merge**: 1 lesson = 1 commit on `main`.
- **Code owner mandatory approval before merge (2026-08-20):** `@hienduong-agilityio` (`.github/CODEOWNERS`) — an additional gate on GitHub, does not change merge rights (still only the user). `.github/CODEOWNERS` belongs to `.github/**` → only Claude Code creates/edits it, committed with the `Co-authored-by: Claude <noreply@anthropic.com>` trailer.
- Remotes: `origin` = GitHub (the main working remote), `gitlab` = the company repo. **Never touch `gitlab`.**
