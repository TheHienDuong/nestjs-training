# 🔄 WORKFLOW — Project Workflow Process

> This is the repo's "internal rulebook". Every lesson follows exactly the 6 steps outlined below.
> Dual purpose: **learn NestJS** and **learn how a real backend team operates**.

## Tool Map

```
                    ┌─────────────────────────────┐
                    │   LINEAR  (source of truth)   │
                    │  Initiative → Project →     │
                    │  Issue → Sub-issue          │
                    └──────┬───────────────┬──────┘
        GitHub integration │               │ Slack integration
              (automatic)    │               │    (automatic)
                    ┌──────▼──────┐  ┌─────▼────────────┐
                    │   GITHUB    │  │ #nestjs-training │
                    │ code · PR   │  │  issue notifications │
                    │ CI Actions  │  │  learning digest │
                    └──────┬──────┘  └──────────────────┘
                           │
              ┌────────────▼─────────────┐
              │  docs/lessons/*.md       │  ← Vietnamese notes, reviewed via PR
              │  NOTION hub              │  ← consolidated knowledge, quick lookup
              └──────────────────────────┘
```

**Core principle:** prioritize _native integration_ over manual sync. Linear communicates directly with GitHub and Slack; the agent only handles tasks that integrations cannot perform (writing notes, consolidating Notion content, compiling learning digests).## Lifecycle of a lesson (6 steps)

### Step 1 — Start lesson · `/lesson-start`
```
/lesson-start L02
```
The skill will:
1. Read the corresponding issue on Linear, summarize the goal in Vietnamese
2. Create a branch that **follows Linear's convention** (see the _Branch_ section below)
3. Create `docs/lessons/02-controllers/README.md` from the template
4. Move the issue to **In Progress** → Slack will automatically send a notification

### Step 2 — Learn theory · `/teach`
```
/teach controllers
```
Claude acts as the teacher:
- **Always read the latest docs from the web before teaching** — do not teach from memory
- Explain in Vietnamese: what the concept is, what problem it solves, when you _should not_ use it
- Provide runnable examples, along with a link to the exact section of the original docs
- Connect to prior knowledge: explain how Express / Prisma / hexagonal map to the current topic
- End with 3–5 comprehension check questions

### Step 3 — Hands-on (you code it yourself)
**Claude will not write the hands-on code for you.** Claude's role in this step is to provide hints, point out errors, and ask counter questions.

If you want a "reference solution" to compare after finishing on your own: add the `agent:codex` label (or the corresponding label for other tools) to the issue, and assign it to the **Coder agent** — codex by default — to work on a separate branch, see [AGENT-MODEL.md](AGENT-MODEL.md).

### Step 4 — Review · `/lesson-review`Have Claude review your code as a real senior reviewer: ask questions about design choices, point out non-idiomatic code, and include a **quiz** to confirm you understand rather than just copy. Record the results in the _Review_ section of the lesson note.

### Step 5 — Pull Request

```bash
git push -u origin <branch>
gh pr create --fill
```

- The PR description **must** include the line `Fixes NES-XX` → once merged, Linear will automatically move the issue to **Done**
- You can only merge once CI passes (the `main` branch has protection enabled)
- Use **Squash and merge** to keep the `main` branch history clean: 1 lesson = 1 commit

### Step 6 — Sync · `/sync-progress`

Update `docs/ROADMAP.md`, push knowledge notes to the Notion hub, send learning digests to `#nestjs-training`.

## Conventions

### Branch

Linear automatically generates a branch name for each issue (the _Copy git branch name_ button), in the format:
```
hien/nes-12-controllers-va-routing
```
Use **exactly** that name. The `nes-12` string is what allows Linear to automatically recognize the branch and update the issue status. Using a different name will break the automation.

### Commit — Conventional Commits
```
<type>(<scope>): <short description, imperative mood>
```

| Type       | Use when                             |
| ---------- | ------------------------------------ |
| `feat`     | Add new API features                 |
| `fix`      | Fix bugs                             |
| `docs`     | Write/edit lesson note, README, ADR  || `test`     | Add/modify tests                        |
| `refactor` | Restructure code, no behavior change |
| `chore`    | Configuration, dependencies, CI             |
| `style`    | Formatting, no logic change              |

Scope should be the lesson or module name: `docs(lesson-02): ...`, `feat(tasks): ...`

`commitlint` runs on the `commit-msg` git hook — if the format is incorrect, the commit is **blocked immediately on your local machine**, no need to wait for CI.

### Definition of Done — a lesson is only considered complete when all 5 of the following requirements are met

- [ ] Lesson notes are fully written, and include the **Link to prior knowledge** and **Sources** sections
- [ ] Hands-on exercises run successfully (`pnpm start:dev` + test the API via Postman)
- [ ] Tests for the newly written code pass (`pnpm test`)
- [ ] Pass the quiz at the review stage — understand *why*, not just *how*
- [ ] The PR has passing (green) CI and has been merged into `main`

---

## Automated quality gates

| Quality gate                          | Runs on                          | Blocks                            |
| --------------------------------- | ----------- | -------------------------------------- |
| `lint-staged` (pre-commit)        | Your local machine | Unformatted code / lint errors            |
| `commitlint` (commit-msg)         | Your local machine | Commit messages that do not follow conventions          |
| GitHub Actions CI                 | On GitHub | Lint / test / build failures               |
| Branch protection                 | On GitHub | Direct pushes to `main`, merging when CI is failing || Coverage threshold _(from Phase 5)_ | CI | Coverage drops below threshold |
| Dependabot | On GitHub | Outdated dependencies (opens weekly PR) |

This order is intentional: **catching errors early is significantly cheaper**. Formatting errors caught locally take 2 seconds; caught in CI take 3 minutes; caught in code review take half a day of another person's time.

---

## Commonly used commands

```bash
# Development loop
pnpm install
pnpm start:dev                 # watch mode
pnpm lint                      # eslint --fix
pnpm format                    # prettier --write

# Test
pnpm test                      # unit
pnpm test -- app.controller     # single file
pnpm test -- -t "test name"      # by test name
pnpm test:cov                  # coverage
pnpm test:e2e                  # e2e

# Local infrastructure
docker compose up -d           # postgres + redis
docker compose ps              # check health status
docker compose down            # stop (preserve data)
docker compose down -v         # stop and DELETE data

# GitHub
gh pr create --fill
gh run watch                   # view CI running in real time
gh pr checks                   # PR check status
```

## First-time environment setup

```bash
pnpm install                   # husky automatically installs hooks via the "prepare" script
cp .env.example .env           # then fill in the values
docker compose up -d
```