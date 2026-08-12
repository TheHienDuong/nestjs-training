# NestJS Training

> A project to **learn NestJS 11** following the official [docs.nestjs.com](https://docs.nestjs.com) documentation, but operated **like a real backend project**: Linear for task management, GitHub PR + CI for quality control, Slack for progress updates, Notion as the knowledge base.

Final course product: a **Task Management API** (User · Project · Task · Comment) with validation, centralized error handling, JWT auth + RBAC, Swagger docs, API versioning, Redis cache, health check, unit + e2e tests, automated CI.

## Where to start

| What you want                                   | Read                                                                 |
| ----------------------------------------------- | -------------------------------------------------------------------- |
| View the full learning roadmap                  | [`docs/ROADMAP.md`](docs/ROADMAP.md)                                 |
| Understand the workflow for each lesson         | [`docs/workflow/WORKFLOW.md`](docs/workflow/WORKFLOW.md)             |
| Understand why the repo is structured this way  | [`docs/lessons/00-setup/README.md`](docs/lessons/00-setup/README.md) |
| View architecture decisions and their rationale | [`docs/adr/`](docs/adr/README.md)                                    |
| Understand how multiple AI agents collaborate   | [`docs/workflow/AGENT-MODEL.md`](docs/workflow/AGENT-MODEL.md)       |

## Environment setup

Requirements: **Node.js >= 20** (as required by NestJS documentation), **pnpm**, **Docker**.

```bash
pnpm install          # Husky automatically installs git hooks via the "prepare" script
cp .env.example .env  # then fill in the actual values
docker compose up -d  # PostgreSQL 16 + Redis 7
docker compose ps     # both must be in the (healthy) state
pnpm start:dev        # http://localhost:3000
```

## Common commands

```bash
pnpm start:dev        # dev, watch mode — main loop
pnpm lint             # eslint --fix
pnpm format           # prettier --write
pnpm test             # unit test
pnpm test:e2e         # e2e test
pnpm test:cov         # coverage
pnpm verify               # matches what CI runs — use BEFORE opening a PR
pnpm db:up / db:down  # toggle postgres + redis
```

## Structure

```
src/                       # application code (main.ts, app.module.ts, feature modules)
test/                      # e2e tests (*.e2e-spec.ts)
docs/
  ROADMAP.md               # 8 phases, ~26 lessons, links to official docs
  workflow/                # WORKFLOW.md · AGENT-MODEL.md
  adr/                     # architecture decision records
  lessons/XX-*/README.md   # Vietnamese notes for each lesson
  templates/               # lesson note · retro templates
.claude/skills/            # lesson-start · teach · lesson-review · sync-progress
.github/workflows/ci.yml   # lint → format → test → build
.husky/                    # pre-commit (lint-staged) · commit-msg (commitlint)
docker-compose.yml         # postgres:16 · redis:7 · adminer (profile "tools")
postman/                   # collection for manual API testing
```

## Important rules

- **Package manager is `pnpm`** — do not use npm/yarn (it will create a second lockfile and break CI).
- **Conventional Commits are mandatory** — `commitlint` blocks commits at the git hook; incorrectly formatted commits will be rejected.
- **Do not push directly to `main`** — branch protection is enabled; all changes must go through PRs with passing CI.
- **PRs must include `Fixes NES-XX`** — this is what triggers Linear to automatically move the issue to Done.
- **AI must not write hands-on code in place of the learner** — see [AGENTS.md](AGENTS.md).

## Quality

| Gate              | Location          | Blocks                                    |
| ----------------- | ----------------- | ----------------------------------------- |
| `lint-staged`     | `pre-commit` hook | Unformatted code / lint errors            |
| `commitlint`      | `commit-msg` hook | Non-standard commit messages              |
| GitHub Actions    | every push & PR   | Lint · format · test · build              |
| Branch protection | `main`            | Direct pushes, merging when CI is failing |
| Dependabot        | weekly            | Outdated/ vulnerable dependencies         |

## Notes

The repo has two remotes: `origin` (GitHub — the main working remote) and `gitlab` (the company's training repo). All workflows in this document use `origin`.

---

<!-- CO-OP TRANSLATOR DISCLAIMER START -->

**Disclaimer**:
This document has been translated using AI translation service [Co-op Translator](https://github.com/Azure/co-op-translator). While we strive for accuracy, please be aware that automated translations may contain errors or inaccuracies. The original document in its native language should be considered the authoritative source. For critical information, professional human translation is recommended. We are not liable for any misunderstandings or misinterpretations arising from the use of this translation.
<!-- CO-OP TRANSLATOR DISCLAIMER END -->
