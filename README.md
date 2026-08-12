# NestJS Training

> A project to **learn NestJS 11** following the official documentation at [docs.nestjs.com](https://docs.nestjs.com), but operated **like a real backend project**: Linear for task management, GitHub PR + CI for quality control, Slack for progress reporting, Notion as the knowledge base.

Final course product: a **Task Management API** (User · Project · Task · Comment) with validation, centralized error handling, JWT auth + RBAC, Swagger docs, API versioning, Redis cache, health check, unit + e2e tests, automated CI.

## Where to start

| What you want                               | Read                                                                  |
| -------------------------------------- | -------------------------------------------------------------------- |
| View the full learning roadmap               | [`docs/ROADMAP.md`](docs/ROADMAP.md)                                 |
| Understand the workflow for each lesson     | [`docs/workflow/WORKFLOW.md`](docs/workflow/WORKFLOW.md)             |
| Understand why the repo is structured this way | [`docs/lessons/00-setup/README.md`](docs/lessons/00-setup/README.md) |
| View architecture decisions and their rationale  | [`docs/adr/`](docs/adr/README.md)                                    |
| Understand how multiple AI agents collaborate      | [`docs/workflow/AGENT-MODEL.md`](docs/workflow/AGENT-MODEL.md)       |

## Environment setupRequirements: **Node.js >= 20** (required by NestJS documentation), **pnpm**, **Docker**.

```bash
pnpm install          # husky automatically installs git hooks via the "prepare" script
cp .env.example .env  # then fill in the actual values
docker compose up -d  # postgres:16 + redis:7
docker compose ps     # both must be in (healthy) status
pnpm start:dev        # http://localhost:3000
```

## Common Commands

```bash
pnpm start:dev        # development, watch mode — main loop
pnpm lint             # eslint --fix
pnpm format           # prettier --write
pnpm test             # unit test
pnpm test:e2e         # e2e test
pnpm test:cov         # coverage
pnpm verify           # runs the same checks as CI — use BEFORE opening a PR
pnpm db:up / db:down  # start/stop postgres + redis
```

## Project Structure

```
src/                       # application code (main.ts, app.module.ts, feature modules)
test/                      # e2e test (*.e2e-spec.ts)
docs/
  ROADMAP.md               # 8 phases, ~26 lessons, link to official documentation
  workflow/                # WORKFLOW.md · AGENT-MODEL.md
  adr/                     # architecture decision records
  lessons/XX-*/README.md   # Vietnamese notes for each lesson
  templates/               # template lesson note · retro
.claude/skills/            # lesson-start · teach · lesson-review · sync-progress
.github/workflows/ci.yml   # lint → format → test → build
`````` 
.husky/                    # pre-commit (lint-staged) · commit-msg (commitlint)
docker-compose.yml         # postgres:16 · redis:7 · adminer (profile "tools")
postman/                   # manual API test collection
```

## Important Rules
- **Package manager is `pnpm`** — do not use npm/yarn (this will create a second lockfile and break CI).
- **Conventional Commits are mandatory** — `commitlint` blocks at the git hook, commits with incorrect format will be rejected.
- **Do not push directly to `main`** — branch protection is enabled; all changes go through PRs with passing CI.
- **PRs must include `Fixes NES-XX`** — this is what makes Linear automatically move issues to Done.
- **AI must not write hands-on code in place of learners** — see [AGENTS.md](AGENTS.md).

## Quality
| Barrier          | Location             | Blocks                         |
| ----------------- | ----------------- | ------------------------------- |
| `lint-staged`     | hook `pre-commit` | Unformatted code / lint errors     |
| `commitlint`      | hook `commit-msg` | Non-standard commit messages        |
| GitHub Actions    | every push & PR     | Lint · format · test · build    |
| Branch protection | `main`            | Direct push, merge when CI is failing |
| Dependabot        | weekly         | Outdated dependencies             |

## NotesThe repo has two remotes: `origin` (GitHub — the main working repository) and `gitlab` (the company's training repository). All workflows in this document use `origin`.