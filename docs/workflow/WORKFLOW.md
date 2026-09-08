# 🔄 WORKFLOW — Project Workflow

> This is the repo's "rulebook". Every lesson goes through exactly the 7 steps below.
> Dual purpose: **learn NestJS** and **learn how a real backend team operates**.

## Tool Map

```
                    ┌─────────────────────────────┐
                    │  LINEAR  (source of truth)  │
                    │  Initiative → Project →     │
                    │  Issue → Sub-issue          │
                    └──────┬───────────────┬──────┘
        GitHub integration │               │ Slack integration
     (automatic — GitHub   │               │  (automatic)
      PR merge only, see   │               │
      note below)          │               │
                    ┌──────▼──────┐  ┌─────▼────────────┐
                    │   GITHUB    │  │ #nestjs-training │
                    │ (`github`)  │  │  issue notices   │
                    │ backup/PR   │  │  learning digest │
                    │ mirror · CI │  └──────────────────┘
                    │ Actions ·   │
                    │ Codex App · │
                    │ Copilot     │
                    └──────┬──────┘
                           │ explicit backup/PR mirror push
                           ▼
                    ┌─────────────┐
                    │   GITLAB    │  ← `origin` — primary dev repo,
                    │ (`origin`)  │    merge-of-record (target state,
                    │ clean code/ │    auth/permissions pending verification)
                    │ config only │
                    └──────┬──────┘
                           │ manual Linear fallback after GitLab MR merge
                           ▼
                    ┌─────────────┐
                    │   LINEAR    │  ← Hermes manually transitions status +
                    │  (update)   │    adds evidence comment (see note below)
                    └─────────────┘

              ┌──────────────────────────┐
              │  docs/lessons/*.md       │  ← Vietnamese notes, reviewed via PR
              │  NOTION hub              │    on GitHub (governance/docs stay
              └──────────────────────────┘    on GitHub only, never pushed to GitLab)
```

> **Linear automation note:** the "GitHub integration (automatic)" arrow above only fires on a **GitHub PR merge** (`Fixes NES-XX`). It does **not** fire on a GitLab MR merge — there is no confirmed Linear↔GitLab integration. When GitLab MR is the merge-of-record, Hermes must manually verify the GitLab MR merged, then update the Linear issue status + add an evidence comment itself. See `.hermes.md` §5.5.e.

**Foundational principle:** prioritize native integration over manual sync. Linear communicates with GitHub and Slack natively; the agent handles only tasks that the integration cannot perform (write notes, consolidate Notion, compile learning digests, and — until GitLab↔Linear integration exists — the manual Linear fallback above).

---

## Lesson Lifecycle (7 steps)

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

**Learning review** (teaching, not pre-merge code review): Claude quizzes and reviews with you like a senior mentor — asks questions about design choices, points out non-idiomatic code, and quizzes you to confirm you understand (not just copy). Results are recorded in the _Review_ section of the lesson note.

### Code review & merge

Separate from the learning review above — this is the approval gate before code enters `main`. **GitLab MR is the merge-of-record** (target state — GitLab MR auth/permissions are currently unresolved; until verified, the GitHub PR + squash-merge flow below remains the actually-operational path):

1. **Claude Code** reviews the Coder agent's code locally (before any PR/MR is opened).
2. Push the branch to **GitHub** (`github` remote) and open the mirror PR so **GitHub Actions**, the **Codex GitHub App connector** (`chatgpt-codex-connector[bot]`, automatic on every PR, no dedicated workflow), and — for large MRs (`mr/*`) — the **Copilot gatekeeper** (max 2/day, see [REVIEW-MODEL.md](REVIEW-MODEL.md)) can review.
3. Push clean code/config to **GitLab** (`origin` remote) and open/update the GitLab MR (`Fixes NES-XX` in the description) — after each verified commit or verified change-set, not only at milestones.
4. **User (lead reviewer)** reviews the code again and decides whether to merge — the PR/MR also needs the mandatory approval of code owner `@hienduong-agilityio` (`.github/CODEOWNERS`, enforced on the GitHub mirror).
5. **Only the user merges — on GitLab, once GitLab MR auth is verified.** No agent merges, not even Claude Code. After the GitLab MR merges, Hermes manually verifies the merge and updates Linear (`Fixes NES-XX` auto-close only fires on a GitHub PR merge, not a GitLab MR — see the Tool Map note above).

### Step 5 — Pull Request / Merge Request

```bash
git push -u github <branch>       # GitHub — backup/PR mirror (review layer)
gh pr create --fill

git push -u origin <branch>       # GitLab — primary repo, merge-of-record (target state)
# GitLab MR creation: pending — MR auth/permissions not yet verified
```

- The PR/MR description **must include** the line `Fixes NES-XX`. On GitHub, merging auto-moves the Linear issue to **Done**; on GitLab, this does not happen automatically — Hermes updates Linear manually after verifying the merge (see Tool Map note above).
- CI must be passing before merging (the `main` branch has GitHub Rulesets protection enabled and verified active; an equivalent GitLab-side protection is not yet confirmed)
- Merge using **Squash and merge** to keep history clean: one lesson = one commit — **only the user merges** (no agent merges)

### Step 6 — Sync · `/sync-progress`

Update `docs/ROADMAP.md`, push knowledge notes to the Notion hub, send learning digests to the `#nestjs-training` channel.

### Step 7 — Tag the lesson · `pnpm lesson --tag <NN>`

After the PR has been merged into `main`, run `pnpm lesson --tag <NN>` to create the git tag `lesson/NN` marking that lesson's exact commit. Thanks to this tag, `pnpm lesson <NN>` afterward can show the exact file map and let you read code lesson by lesson.

---

## Conventions

### Branch

Use a **descriptive branch name** in the format `<type>/nes-XX-<short-description>` (e.g. `hien/nes-12-controllers-and-routing` for hands-on lesson work, `codex/nes-12-reference-solution` or `agy/nes-12-alt-solution` for agent work, `docs/nes-126-...`, `chore/...`, `feat/...` for non-lesson governance/practice-track branches) — the `nes-XX` segment ties the branch back to its Linear issue for humans reading the history, but naming it this way does **not** by itself trigger any Linear automation.

The `Fixes NES-XX` line remains **required** in the GitLab MR description and/or the GitHub PR description (whichever is applicable per the merge-of-record state in "Code review & merge" above) — that line, not the branch name, is what Linear's automation reads on a **GitHub PR merge**. A GitLab MR merge does not trigger this automation at all (see the Tool Map note above); Hermes must update Linear manually in that case.

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

### Bilingual (2 versions)

Lesson notes are written in Vietnamese on `main`, then an English version is created on branch `example/nestjs-training`. **Both versions stay on GitHub** — GitLab (`origin`) does not receive docs/governance at all, only clean application code/config (`README.md` is the sole Markdown exception). Details: [bilingual-policy.md](../bilingual-policy.md).

### Definition of Done — a lesson is only considered complete when all 7 criteria are met

- [ ] Lesson note is fully written, with complete **Prior Knowledge Connections** and **Sources** sections
- [ ] Hands-on runs successfully (`pnpm start:dev` + test the API via Postman)
- [ ] Tests for the newly written code pass (`pnpm test`)
- [ ] Pass the quiz from the review step — understand _why_, not just _how_
- [ ] PR has passing CI and has been merged into `main`
- [ ] The 2 versions (vi/en) do not drift in content
- [ ] The EN version is clean, no Vietnamese characters left

---

## Mandatory workspace cleanup after a task (Herdr)

> Applies to tasks dispatched via Herdr — the Coder (codex) or agy runs in its own worktree/pane (see [AGENT-MODEL.md](AGENT-MODEL.md)). Full details + guardrails live in `.hermes.md` (sections "Mandatory cleanup" and "Herdr bridge") — this is the summary for readers of the workflow.

**9-step flow (Herdr bridge)** — cleanup is the **mandatory last step**, not optional housekeeping:

1. `hermes kanban create/claim` — task state (the single source of truth)
2. `herdr worktree create --cwd <repo> --branch codex/nes-XX-... --label NES-XX --json` — automatically creates a workspace + tab + dedicated pane for the task
3. `herdr agent start <name> --kind codex --pane <pane_id>` — ephemeral agent, one per task
4. `herdr agent prompt <pane_id> "<task> + write results to <worktree>/.hermes/runs/NES-XX.json"`
5. Poll the result JSON file — the sole verdict, don't trust `pane wait-output`/`agent wait`
6. Independent verification: `git diff` raw + `pnpm verify` — don't trust the agent's self-report
7. Open a dedicated PR (`Fixes NES-XX`) → Claude Code local review → Codex GitHub App connector review → user lead review + merge
8. `hermes kanban complete`
9. **Mandatory cleanup** — immediately after the PR is squash-merged (or the user signals the task is cancelled): resolve the target dynamically with `herdr agent list` (don't reuse old ids/labels), check `git status` + PR/issue state, then `herdr worktree remove --workspace <id> --force` + `git branch -D <branch>`. Don't leave dead worktrees/panes behind.

**Safety exceptions — never delete if:**

- It is the `main` worktree or the user's currently open/active worktree.
- It is a lesson/coder/reviewer worktree that is **active** (task not closed, waiting for review/CI).
- The worktree still has **uncommitted changes**.
- The branch still has an **open PR**.
- The pane is still **running** or is needed for something else.

**Remote branch:** do **not** delete by default — only delete the local branch. Only delete the remote if the user explicitly requests it.

**If blocked:** report the exact reason (uncommitted changes / open PR / running pane) in the chat, don't force the deletion, retry cleanup once the blocking condition is resolved.

---

## Automated Quality Gates

| Quality Gate                      | Runs where                                                                         | Blocks what                                         |
| --------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------- |
| `lint-staged` (pre-commit)        | Your machine                                                                       | Unformatted / lint-error code                       |
| `commitlint` (commit-msg)         | Your machine                                                                       | Commit messages that don't follow the convention    |
| GitHub Actions CI                 | On GitHub                                                                          | Lint / test / build failures                        |
| Branch protection                 | On GitHub (verified active via Rulesets); GitLab-side equivalent not yet confirmed | Direct pushes to `main`, merging when CI is failing |
| Coverage threshold (from Phase 5) | CI                                                                                 | Coverage dropping below the threshold               |
| Dependabot                        | On GitHub                                                                          | Outdated dependencies (opens weekly PRs)            |

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
