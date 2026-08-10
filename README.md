# NestJS Training

> A project for **learning NestJS 11** from the official documentation [docs.nestjs.com](https://docs.nestjs.com), but operated **like a real backend project**: Linear for task management, GitHub PRs + CI for quality control, Slack for progress updates, and Notion as a knowledge base.

Final course product: a **Task Management API** (User · Project · Task · Comment) with validation, centralized error handling, JWT auth + RBAC, Swagger docs, API versioning, cache Redis, health check, unit + e2e test, automated CI.

## Where to start

| You want to                                      | Read                                                                 |
| ------------------------------------------------ | -------------------------------------------------------------------- |
| View the complete learning roadmap               | [`docs/ROADMAP.md`](docs/ROADMAP.md)                                 |
| Understand the workflow for each lesson          | [`docs/workflow/WORKFLOW.md`](docs/workflow/WORKFLOW.md)             |
| Understand why the repository is set up this way | [`docs/lessons/00-setup/README.md`](docs/lessons/00-setup/README.md) |
| View architecture decisions and their rationale  | [`docs/adr/`](docs/adr/README.md)                                    |
| Understand how multiple AI agents collaborate    | [`docs/workflow/AGENT-MODEL.md`](docs/workflow/AGENT-MODEL.md)       |

## Environment setup

Requirements: **Node.js >= 20** (required by the NestJS docs), **pnpm**, **Docker**.

```bash
pnpm install          # husky installs git hooks automatically through the "prepare"
cp .env.example .env  # then enter real values
docker compose up -d  # postgres:16 + redis:7
docker compose ps     # both must have status (healthy)
pnpm start:dev        # http://localhost:3000
```

## Common commands

```bash
pnpm start:dev        # dev, watch mode — main development loop
pnpm lint             # eslint --fix
pnpm format           # prettier --write
pnpm test             # unit test
pnpm test:e2e         # e2e test
pnpm test:cov         # coverage
pnpm verify               # exactly what CI runs — use BEFORE opening a PR
pnpm db:up / db:down  # start/stop postgres + redis
```

## Structure

```
src/                       # application code (main.ts, app.module.ts, feature modules)
test/                      # e2e test (*.e2e-spec.ts)
docs/
  ROADMAP.md               # 8 phase, ~26 lesson, official docs links
  workflow/                # WORKFLOW.md · AGENT-MODEL.md
  adr/                     # architecture decision records
  lessons/XX-*/README.md   # English notes for each lesson
  templates/               # template lesson note · retro
.claude/skills/            # lesson-start · teach · lesson-review · sync-progress
.github/workflows/ci.yml   # lint → format → test → build
.husky/                    # pre-commit (lint-staged) · commit-msg (commitlint)
docker-compose.yml         # postgres:16 · redis:7 · adminer (profile "tools")
postman/                   # collection for manual API testing
```

## Important rules

- **The package manager is `pnpm`** — do not use npm/yarn (they create a second lockfile and make CI fail).
- **Conventional Commits are required** — `commitlint` is enforced by a git hook; an invalid format causes the commit to be rejected.
- **Do not push directly to `main`** — branch protection is enabled; every change goes through a PR with passing CI.
- **The PR must contain `Fixes NES-XX`** — this makes Linear move the issue to Done automatically.
- **AI does not write hands-on code for the learner** — see [AGENTS.md](AGENTS.md).

## Quality

| Guardrail         | Where             | What it blocks                       |
| ----------------- | ----------------- | ------------------------------------ |
| `lint-staged`     | hook `pre-commit` | Unformatted code / lint errors       |
| `commitlint`      | hook `commit-msg` | Invalid commit message               |
| GitHub Actions    | every push & PR   | Lint · format · test · build         |
| Branch protection | `main`            | Direct pushes, merging when CI fails |
| Dependabot        | weekly            | Outdated dependencies                |

## Notes

The repository has two remotes: `origin` (GitHub — primary workspace) and `gitlab` (company training repository). The entire workflow in this document uses `origin`.
