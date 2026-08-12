# 🔄 WORKFLOW — Project Workflow

> This is the repo's "rulebook". Every lesson goes through exactly 6 steps below.
> Dual purpose: **learn NestJS** and **learn how a real backend team operates**.

## Tool Map

```
                    ┌─────────────────────────────┐
                    │  LINEAR  (source of truth)  │
                    │  Initiative → Project →     │
                    │  Issue → Sub-issue          │
                    └──────┬───────────────┬──────┘
        GitHub integration │               │ Slack integration
              (automatic)  │               │  (automatic)
                    ┌──────▼──────┐  ┌─────▼────────────┐
                    │   GITHUB    │  │ #nestjs-training │
                    │ code · PR   │  │  issue notices   │
                    │ CI Actions  │  │  learning digest │
                    └──────┬──────┘  └──────────────────┘
                           │
              ┌────────────▼─────────────┐
              │  docs/lessons/*.md       │  ← Vietnamese notes, reviewed via PR
              │  NOTION hub              │  ← consolidated knowledge, quick lookup
              └──────────────────────────┘
```

**Foundational principle:** prioritize native integration over manual sync. Linear communicates with GitHub and Slack natively; the agent only handles tasks that the integration cannot perform (write notes, consolidate Notion, compile learning digests).

---

## Lesson Lifecycle (6 steps)

### Step 1 — Open Lesson · `/lesson-start`

```
/lesson-start L02
```

The skill will:

1. Read the corresponding issue on Linear, summarize the goal in Vietnamese
2. Create a branch following Linear's convention (see the _Branch_ section below)
3. Create `docs/lessons/02-controllers/README.md` from the template
4. Move the issue to **In Progress** → Slack will automatically receive the notification

### Step 2 — Learn Theory · `/teach`

```
/teach controllers
```

Claude takes on the role of a teacher:

- **Always read the latest official docs from the web before teaching** — never teach from memory
- Explain in Vietnamese: what the concept is, what problem it solves, and when _not_ to use it
- Runnable examples, with links to the exact section of the original docs
- Connect to prior knowledge: how Express / Prisma / hexagonal architecture map to the new concept
- End with 3–5 comprehension check questions

### Step 3 — Hands-on (you code it yourself)

**Claude does not code the hands-on portion for you.** Claude's role in this step is to provide suggestions, point out errors, and ask counter questions.

To get a "reference solution" to compare after you finish coding on your own: tag the issue with `agent:codex` (or the corresponding tag for other tools) and assign it to the **Coder agent** — default is codex — to work on a separate branch, see [AGENT-MODEL.md](AGENT-MODEL.md).

### Step 4 — Review · `/lesson-review`

Claude reviews your code like a real senior reviewer: asks questions about design choices, points out non-idiomatic code, and quizzes you to confirm you understand (not just copy). Results are recorded in the _Review_ section of the lesson note.

### Step 5 — Pull Request

```bash
git push -u origin <branch>
gh pr create --fill
```

- The PR description **must include** the line `Fixes NES-XX` → after merging, Linear will automatically move the issue to **Done**
- CI must be passing before merging (the `main` branch has protection enabled)
- Merge using **Squash and merge** to keep the `main` history clean: 1 lesson = 1 commit

### Step 6 — Sync · `/sync-progress`

Update `docs/ROADMAP.md`, push knowledge notes to the Notion hub, send learning digests to the `#nestjs-training` channel.

---

## Conventions

### Branch

Linear automatically generates a branch name for each issue (via the _Copy git branch name_ button), in the format:

```
hien/nes-12-controllers-va-routing
```

Use **exactly** that name. The `nes-12` string is what allows Linear to automatically recognize the branch and update the issue status. Using a different name will break automation.

### Commit — Conventional Commits

```
<type>(<scope>): <short imperative description>
```

| Type       | Use when                                   |
| ---------- | ------------------------------------------ |
| `feat`     | Add new features to the API                |
| `fix`      | Fix bugs                                   |
| `docs`     | Write/edit lesson notes, READMEs, ADRs     |
| `test`     | Add/edit tests                             |
| `refactor` | Restructure code without changing behavior |
| `chore`    | Configuration, dependencies, CI            |
| `style`    | Formatting, no logic changes               |

Scope should be the lesson or module name: `docs(lesson-02): ...`, `feat(tasks): ...`

`commitlint` runs on the `commit-msg` git hook — incorrect format will block the commit **right on your machine**, no need to wait for CI.

### Definition of Done — a lesson is only considered complete when all 5 criteria are met

- [ ] Lesson note is fully written, with complete **Prior Knowledge Connections** and **Sources** sections
- [ ] Hands-on runs successfully (`pnpm start:dev` + test the API via Postman)
- [ ] Tests for the newly written code pass (`pnpm test`)
- [ ] Pass the quiz from the review step — understand _why_, not just _how_
- [ ] PR has passing CI and has been merged into `main`

---

## Automated Quality Gates

| Quality Gate                      | Runs where   | Blocks what                                         |
| --------------------------------- | ------------ | --------------------------------------------------- |
| `lint-staged` (pre-commit)        | Your machine | Unformatted / lint-error code                       |
| `commitlint` (commit-msg)         | Your machine | Commit messages that don't follow the convention    |
| GitHub Actions CI                 | On GitHub    | Lint / test / build failures                        |
| Branch protection                 | On GitHub    | Direct pushes to `main`, merging when CI is failing |
| Coverage threshold (from Phase 5) | CI           | Coverage dropping below the threshold               |
| Dependabot                        | On GitHub    | Outdated dependencies (opens weekly PRs)            |

This order is intentional: **detect errors as early and as cheaply as possible**. A formatting error caught on your machine takes 2 seconds; caught in CI takes 3 minutes; caught in review takes half a day of another person's time.

---

## Common Commands

```bash
# Development loop
pnpm install
pnpm start:dev                 # watch mode
pnpm lint                      # eslint --fix
pnpm format                    # prettier --write

# Test
pnpm test                      # unit
pnpm test -- app.controller     # a file
pnpm test -- -t "test name"      # by name
pnpm test:cov                  # coverage
pnpm test:e2e                  # e2e

# Local infrastructure
docker compose up -d           # postgres + redis
docker compose ps              # check health
docker compose down            # shut down (keep data)
docker compose down -v         # shut down and DELETE data

# GitHub
gh pr create --fill
gh run watch                   # view real-time CI runs
gh pr checks                   # PR check status
```

## First-time Environment Setup

```bash
pnpm install                   # Husky automatically installs hooks via the "prepare" script
cp .env.example .env           # then fill in the values
docker compose up -d
```

---

<!-- CO-OP TRANSLATOR DISCLAIMER START -->

**Disclaimer**:
This document has been translated using AI translation service [Co-op Translator](https://github.com/Azure/co-op-translator). While we strive for accuracy, please be aware that automated translations may contain errors or inaccuracies. The original document in its native language should be considered the authoritative source. For critical information, professional human translation is recommended. We are not liable for any misunderstandings or misinterpretations arising from the use of this translation.
<!-- CO-OP TRANSLATOR DISCLAIMER END -->
