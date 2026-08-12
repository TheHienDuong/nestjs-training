# L00 — Project Setup & Professional Workflow

|                |                                                     |
| -------------- | --------------------------------------------------- |
| **Phase**      | 0 — Setup & Professional Workflow                   |
| **Linear**     | NES-1                                               |
| **Branch**     | `lesson/00-setup`                                   |
| **Main Docs**  | [/first-steps](https://docs.nestjs.com/first-steps) |
| **Study Date** | 2026-08-10                                          |

---

## 🎯 Objectives

- [ ] Be able to explain what problem each tool in this repo solves — not just know that it exists
- [ ] Be able to run the full development loop: edit code → commit → push → CI → PR → merge
- [ ] Understand why there are multiple **quality gates** at different layers
- [ ] Be able to spin up PostgreSQL + Redis with `docker compose` without installing anything on your machine
- [ ] Know how to look up official NestJS documentation (and why Google/AI memory is not enough)

---

## 📚 Theory

This lesson does not cover any NestJS concepts. It answers a different question: **what makes a real backend project different from a folder that just holds code?**

The short answer: it's the **things surrounding the code**. And these things exist because each one was created to solve a real incident that happened before.

### 1. Why do we need a dedicated PM tool (Linear) instead of a TODO file?A `TODO.md` file has three issues that you only notice after a few weeks:
1. **No reliable status.** You only update it when you remember to, which means you almost never do.
2. **No connection to code.** You can't tell which task corresponds to which PR.
3. **No measurable metrics.** You don't know how much work you complete in a week, or how far off your estimates are.

Linear solves all three of these:

| Linear Concept | In this project                                                |
|----------------|----------------------------------------------------------------|
| **Initiative** | The entire "NestJS Mastery" course                             |
| **Project**    | One phase (Phase 1 — Foundations…)                             |
| **Issue**      | One lesson, with full description + Definition of Done         |
| **Sub-issue**  | The three steps in the lesson: Theory & note · Hands-on · Review & quiz |
| **Cycle**      | One week of learning — shows you your real **velocity**        |
| **Estimate**   | Estimate points → compared to actuals to practice estimation   |

**The best part, and also a key professional takeaway:** task statuses are updated **by git events**, not by someone manually clicking buttons.

```
Create branch  hien/nes-12-controllers   →  issue NES-12 automatically moves to In Progress
PR with the line  "Fixes NES-12"  is merged →  issue NES-12 automatically moves to Done
```This is why **branch names and PR descriptions are data, not decorative text**. Naming a branch incorrectly will silently break automation — there are no error messages, and this is the hardest type of error to detect.

> 📖 Reason for choosing Linear over Trello / GitHub Projects: [ADR-0002](../../adr/0002-linear-as-source-of-truth.md)

### 2. Why does Git only have one main branch (`main`)?

You may have heard of **Git Flow** with `main` + `develop` + `feature/*` + `release/*`. This repository intentionally **does not** use it.

We use **trunk-based development**: only `main` is the long-lived branch, each lesson gets its own branch that lives for a few days then disappears.

The reason: the longer a branch lives, the further it diverges from `main`, and the more painful merges become. Git Flow was created for the era of versioned software releases (2.1, 2.2… releases). Most web services today deploy multiple times a day, so trunk-based development is more common.

**Squash and merge** — each lesson leaves exactly one commit on `main`:

```bash
git log --oneline main
# a1b2c3d docs(lesson-02): controllers and routing
# e4f5g6h docs(lesson-01): NestJS project structure
# 7h8i9j0 chore: set up workflow, CI, docker and learning materials
```

`git log` reads out your exact learning path. If you keep every "wip", "fix typo" commit, you lose this property.

> 📖 [ADR-0003](../../adr/0003-trunk-based-one-lesson-one-pr.md)

### 3. Conventional Commits — why are you blocked when writing an incorrect commit message?

Try typing:

```bash
```git commit -m "update code"
# ✖ subject may not be empty / type may not be empty
# husky - commit-msg script failed (code 1)
```
The commit is **rejected right on your local machine**, before it even makes it into the git history.
```
Mandatory format:
```
<type>(<scope>): <description>

feat(tasks): add CRUD endpoints for tasks
docs(lesson-02): notes on controllers and routing
fix(auth): handle expired token cases
```
Why the strict requirements:
- **Git history is documentation.** `git log --oneline` reads like a changelog, not a list of vague entries like "update", "fix bug", "asdf".
- **The type tells you the nature of a commit at a glance** without needing to open the diff. When tracking down the root cause of a bug, `fix:` and `refactor:` are two very different suspects.
- **It enables automation.** With standardized types, you can automatically generate CHANGELOGs and calculate semantic versions via tooling later.
Why block at the **local hook** instead of in CI: if you push a commit message and want to correct it later, you have to rewrite history — which is far more costly than getting it right the first time.
### 4. Four layers of quality gates — why not just one?
| Layer           | Tool                           | Blocks what                            | Time taken |
| --------------- | ------------------------------ | -------------------------------------- | ---------- |
| 1. At commit time  | `lint-staged` (`pre-commit` hook) | Unformatted code / lint errors        | ~2 seconds     || 2. On commit  | `commitlint` (hook `commit-msg`)  | Non-compliant commit message           | ~1 second     |
| 3. On push/PR | GitHub Actions CI                 | Lint, format, test, build fail     | ~2 minutes     |
| 4. On merge   | Branch protection                 | Direct push to `main`, merge when CI is failing | immediately     |

The underlying principle: **the earlier you catch errors, the cheaper it is.**

Take the same missing semicolon error:
- Caught at layer 1 → takes 2 seconds, no one notices
- Caught at layer 3 → 2 minutes waiting for CI + a useless "fix lint" commit in the project history
- Caught during review → wastes half a day of another person's time
- Caught in production → wastes the entire team's evening

This is exactly why teams invest in hooks and CI: not because they like the process, but because it's **cheaper**.

Two notable details in this repo:
- `lint-staged` only runs on **staged files**, not the entire repo. Slow hooks get skipped with `--no-verify` — and a bypassed guard is as good as nothing.
- CI runs `eslint --max-warnings=0`, meaning **warnings also fail CI**. Unfixed warnings will accumulate into hundreds of lines of noise, eventually hiding truly important warnings.

> **A warning:** `git commit --no-verify` skips all hooks. Do not use it in this repo. The feeling of being "blocked" is the fastest way to learn.

### 5. What is CI and why is it important?**CI (Continuous Integration)** = every time you push, code is built and retested on a **completely clean machine**.

The problem it solves has a specific industry name: _**"it works on my machine"**_. The root cause is usually one of three things:

- You have a `.env` file that is not present in the repository
- You have installed a global package that is not listed in `package.json`
- You forgot to commit a new file

CI runs on a machine that only has exactly what is stored in git → any differences are exposed immediately.

Read `.github/workflows/ci.yml`, and note a few details:

```yaml
- run: pnpm install --frozen-lockfile
```

`--frozen-lockfile` = install **exactly** according to `pnpm-lock.yaml`, without automatically upgrading versions. If `package.json` and the lockfile are out of sync, the job will **fail** instead of silently installing a different version. This is the desired behavior: the build running on CI must be identical to the build running on your local machine.

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

Pushing a new commit to the same PR → cancels the previous run. No one cares about the results of the commit that has been replaced.

#### The first CI run of this repo was RED — and that is a lesson

The first PR failed right at the second step:

```
Error: No pnpm version specified.
Please specify one of these ways:
  - in GitHub Action config key "version"
  - in package.json key "packageManager"
````pnpm/action-setup` **does not automatically guess** the pnpm version. It reads the `packageManager` field in `package.json` — which the scaffold generated by `nest new` does not create. How to fix it:

```json
"packageManager": "pnpm@11.18.0"
```

What's worth noting: this error **cannot be detected on your local machine**, because your machine already has pnpm pre-installed. Only a clean environment will reveal that the repo hasn't told anyone which pnpm version it needs.

This is precisely **the value of CI, visible right on the first run**: it doesn't catch bugs in your logic, it uncovers the **implicit assumptions** you didn't know you were relying on.

The `packageManager` field is also the universal Node.js standard (Corepack reads it), so adding it locks the pnpm version for all users and all machines — serving the same purpose as `--frozen-lockfile`.

### 6. Why run the database with Docker instead of installing it directly on the machine?

`docker-compose.yml` declares two services: PostgreSQL 16 and Redis 7.

Four reasons:

1. **Can be completely cleaned up.** Run `docker compose down -v` and your machine returns to a state as if nothing was ever there.
2. **Fixed version.** You and CI use exactly Postgres 16, not "whatever version my machine has".
3. **No conflicts.** Multiple parallel projects each have their own separate database, with no risk of overwriting each other.
4. This is **how real teams set up development environments**. New team members only need to run `docker compose up`.

Two intentional details in the file:

```yaml
ports:
  - '${POSTGRES_PORT:-5433}:5432'
```Map to port **5433**, not 5432. If your machine already has a running PostgreSQL instance, it is occupying port 5432 — and the "port already in use" error is a very common error when first learning Docker. Therefore, the `DATABASE_URL` in `.env` must point to `5433`.

```yaml
healthcheck:
  test: ['CMD-SHELL', 'pg_isready -U postgres']
```

The healthcheck tells Docker that the container is **ready to accept queries**, not just "started". This difference is important: Postgres takes a few seconds to accept connections, and any app that starts during that window will crash due to `connection refused`.

### 7. `.env` and `.env.example` — two files, two purposes

| File           | Included in git? | Role                                              |
| -------------- | ------------- | ---------------------------------------------------- |
| `.env.example` | ✅ Yes         | **Documentation** — lists which environment variables the app needs, with dummy values |
| `.env`         | ❌ No          | **Secret** — real values, only exist on your local machine  |

```bash
cp .env.example .env   # then fill in the real values
```

> ⚠️ **Golden rule:** A secret that is committed is a secret **that has been exposed**. Deleting it in a later commit won't fix it — it still remains in the git history and in every clone. The correct way to handle this is to **revoke that secret** and create a new one.

This is one of the most common security mistakes made by new developers. There are even bots that scan GitHub for committed API keys.

### 8. ADR — record the **why**, not just the **what**`docs/adr/` contains **Architecture Decision Records**: each file documents one technical decision, the reasoning behind it, and the discarded alternatives.

Why is this needed? The hardest question when returning to a codebase after 6 months is not _"what does this code do?"_ — you can figure that out by reading the code. The hard question is _**"why was it done this way instead of another way?"**_

Code only records the **outcome** of a decision. It does not document the discarded alternatives, the constraints in place at the time, or the tradeoffs that were accepted. Without ADRs, the next person (even if it's you) will revert a correct decision because they don't know the reasoning behind it.

There's also a personal benefit for you: **writing an ADR forces you to articulate the reasoning behind your choice**. If you can't write an ADR for a decision, it's usually because you don't fully understand why you made that choice. This is one of the clearest differences between junior and senior engineers — it's not about knowing more, but about **knowing what tradeoffs you're making to get what you want**.

> 📖 [How to write ADRs + template](../../adr/README.md)

### 9. Multi-agent model — why separate roles?

This repo uses three agents with distinct roles:

| Agent           | Role                                      |
| --------------- | ---------------------------------------- |
| **Claude Code** | Mentor · PM · Reviewer                   |
| **codex**       | Coder (handles issues labeled `agent:codex`) |
| **opencode**    | Cross-check agent, starting from Phase 7  |

Two core principles:> **No agent can write code and review its own code at the same time.**

This is the same reason real teams don't let authors approve their own PRs: the person who just wrote a solution is already committed to its underlying assumptions, so it's very hard for them to spot flaws in those assumptions themselves.

> **Agents don't do hands-on work for you.**

If AI writes code for you, the only thing that gets trained is the AI. The most useful way to use codex is: **you finish the work yourself first**, then look at codex's "reference solution" and compare. The difference between the two versions is the most valuable insight in the lesson.

> 📖 [AGENT-MODEL.md](../../workflow/AGENT-MODEL.md)

### 10. Reference NestJS documentation correctly

`docs.nestjs.com` is an **Angular SPA**: its content is rendered via JavaScript. Fetching the HTML will only return the `<title>` tag, with no actual content. Any AI that fetches this page and then "explains" it to you is reciting from its memory, not from the documentation.

The original markdown source is hosted in the official upstream repo:

```bash
gh api "repos/nestjs/docs.nestjs.com/contents/content/controllers.md" \
  -H "Accept: application/vnd.github.raw"
```

Some file names **do not match** their corresponding URLs — know this in advance to avoid wasting time:

| Web URL                       | Markdown file                                  |
| ------------------------------ | ---------------------------------------------- |
| `/middleware`                  | `content/middlewares.md`                       || `/fundamentals/custom-providers`   | `content/fundamentals/dependency-injection.md` |
| `/fundamentals/injection-scopes`   | `content/fundamentals/provider-scopes.md`      |
| `/techniques/database`             | `content/techniques/sql.md`                    |
| `/security/encryption-and-hashing` | `content/security/encryption-hashing.md`       |
| `/faq/common-errors`               | `content/faq/errors.md`                        |

And always check the actual version instead of relying on the examples on the blog:

```bash
npm view @nestjs/config version
```

---

## 🔗 Connecting to prior knowledge

| In previous Express/Prisma projects                  | In this repository                                                     | What's the difference                                                                                      |
| --------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Run `node index.js` or `nodemon`           | `pnpm start:dev` (`nest start --watch`)                        | Nest CLI handles TypeScript compilation + file watching, no need for manual configuration                                        || `npm install`                                 | `pnpm install`                                                 | pnpm uses hard links so it's faster and saves disk space; the lockfile is different so **do not mix** the two package managers |
|-----------------------------------------------|----------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| Install PostgreSQL directly on the machine    | `docker compose up -d`                                         | Fixed version, fully removable, matches the CI environment                                                                      |
| Commit directly to `main`                     | Branch → PR → CI → squash merge                                | There is a place for review; `main` is always in a runnable state                                                               |
| Keep pending work in mind                      | A Linear issue has a Definition of Done                        | Status updates automatically based on git events                                                                                |
| Use Prisma as a singleton imported everywhere | _(L07)_ `PrismaService` is a **provider** in the DI container   | Nest manages the lifecycle — connects/disconnects at the right time                                                             |
| Hexagonal architecture: manually separate the domain from the infrastructure | Nest has a built-in DI container | Nest **comes with built-in** dependency inversion mechanisms that you previously had to build yourself |**Food for thought:** When implementing hexagonal architecture with Express, you have to write the dependency injection part yourself — you have to manually create interfaces for ports, build adapters, and wire everything together at the entry point. NestJS builds this system directly into the framework. By L25, when you refactor a module to follow the ports & adapters pattern, it will become very clear: **what you used to do manually is exactly what `@Module` + `@Injectable` does for you.**

---

## 💻 Key points in the repo after setup
```
docs/
  ROADMAP.md              # 8 phases, 26 lessons, links to docs for each lesson
  workflow/WORKFLOW.md    # 6-step process, conventions, Definition of Done
  workflow/AGENT-MODEL.md # Role assignment for Claude / codex / opencode
  adr/                    # 3 ADRs + template
  lessons/                # Vietnamese notes for each lesson (this file is L00)
  templates/              # Lesson note template + retro
.github/
  workflows/ci.yml        # lint → format → test → build
  pull_request_template.md
  dependabot.yml          # Bot that automatically opens PRs to upgrade dependencies every week
.claude/skills/           # 4 skills: lesson-start · teach · lesson-review · sync-progress
.husky/
  pre-commit              # lint-staged
  commit-msg              # commitlint
commitlint.config.mjs
docker-compose.yml        # postgres:16 + redis:7 (+ adminer, profile "tools")
.env.example
postman/README.md
AGENTS.md                 # Shared contract for all AI agents
CLAUDE.md                 # Specific instructions for Claude Code
```### A small change in `src/` worth noting

CI runs `eslint --max-warnings=0`, and the original scaffold from `nest new` has a warning:

```ts
// src/main.ts — before
bootstrap();

// after
void bootstrap();
```

`bootstrap()` is an `async` function, meaning it returns a `Promise`. If you call it without handling that Promise, the `@typescript-eslint/no-floating-promises` rule will warn: if an error occurs inside it, no one catches it, and Node.js will report an unhandled rejection.

`void` is a way to tell TypeScript: _"I know this is a Promise, and I intentionally don't wait for it."_ For `bootstrap()`, this makes sense — it's the entry point of the entire app, there's no code above it to `await`.

**A small but very real lesson:** the quality guard just caught a code issue generated by the official tool itself. That's exactly why we set up guards.

---

## 🛠 Hands-on

Run through the entire workflow to see how all the pieces fit together.

**1. Set up the environment**

```bash
pnpm install                  # husky automatically installs git hooks via the "prepare" script
cp .env.example .env
docker compose up -d
docker compose ps             # both services must be in (healthy) state
```

**2. Run the app**

```bash
pnpm start:dev
curl http://localhost:3000    # → Hello World!
```

**3. Try to break the guard (do it for real, to see it block you)**

```bash
# Try committing a non-standard commit message -> it must be REJECTED
echo "test" > /tmp/x && git add -A && git commit -m "update stuff"
```# Try a standard-compliant commit → it must be ACCEPTED
git commit -m "chore: test conventional commit"
```

**4. Run exactly what CI will run** — before pushing, so you don't have to wait to find out it failed

```bash
pnpm verify
```

**5. View the database manually** (optional)

```bash
docker compose --profile tools up -d
# open http://localhost:8080
# System: PostgreSQL · Server: postgres · User: postgres · Password: postgres
```

**6. Cleanup**

```bash
docker compose down           # preserve data
```

---

## ✅ Review & Quiz

Answer in your own words, don't copy from the section above.

1. **Why is the commit message blocked by the git hook on your local machine instead of being checked by CI?**
   → _(answer yourself)_

2. **How is `pnpm install --frozen-lockfile` on CI different from `pnpm install` on your local machine, and why does CI need the `--frozen-lockfile` version?**
   → _(answer yourself)_

3. **You rename a branch from `hien/nes-12-controllers` to `feature/controllers` for "readability". What will happen, and why is it hard to detect?**
   → _(answer yourself)_

4. **For the same formatting error, what is the cost difference between catching it in `lint-staged` and catching it in CI? What principle can be derived from this?**
   → _(answer yourself)_

5. **`docker-compose.yml` maps PostgreSQL to port 5433 instead of 5432. Why? If you ignore this detail, what error will you encounter?**
   → _(answer yourself)_

6. **You accidentally commit a `.env` file containing a real JWT secret, then commit another commit that deletes that file. Is the secret safe now? Why?**
   → _(answer yourself)_→ _(self-answer)_

**Connect to the next lesson:** L01 will deep dive into the 5 files generated by `nest new` in the `src/` directory. Before starting, try to guess on your own: what is the difference between `main.ts` and the `index.js` of an Express app?

---

## 🧠 Key points to remember

1. **Task status should be updated via git events, not manual clicks.** That's why branch names and PR descriptions are data, not decorative text.
2. **Catching errors early is cheaper** — this is the entire reason hooks, CI, and branch protection exist.
3. **A secret that is committed is a leaked secret.** You can't fix this by deleting the commit; you must revoke it and generate a new one.
4. **ADRs record the *why*, which code can never capture.** Being able to write an ADR is a sign that you truly understand your own decisions.
5. **AI should not do hands-on work for you, and it should not review its own code.** Both rules exist to protect value: one protects learning value, the other protects review value.

---

## 📎 Sources

- [NestJS — First Steps](https://docs.nestjs.com/first-steps)
- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
- [Trunk Based Development](https://trunkbaseddevelopment.com/)
- [Michael Nygard — Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [GitHub Actions — Workflow syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)- [Docker Compose — Compose file reference](https://docs.docker.com/reference/compose-file/)
- [Linear — GitHub integration](https://linear.app/docs/github)
- [husky](https://typicode.github.io/husky/) · [lint-staged](https://github.com/lint-staged/lint-staged) · [commitlint](https://commitlint.js.org/)
- Repo ADRs: [0001 Prisma](../../adr/0001-choose-prisma-as-orm.md) · [0002 Linear](../../adr/0002-linear-as-source-of-truth.md) · [0003 Trunk-based](../../adr/0003-trunk-based-one-lesson-one-pr.md)