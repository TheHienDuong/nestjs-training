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

- [ ] Be able to explain what problem each tool in this repo **solves** — not just know that it exists
- [ ] Be able to run the full development loop: edit code → commit → push → CI → PR → merge
- [ ] Understand why there are multiple **quality gates** at different layers
- [ ] Be able to spin up PostgreSQL + Redis using `docker compose` without installing anything on your machine
- [ ] Know how to look up official NestJS documentation (and why Google/AI memory is not enough)

---

## 📚 Theory

This lesson has no NestJS concepts. It answers a different question: **what makes a real backend project different from a folder containing code?**

Short answer: the **things around the code**. And those things exist because each one was born from a past incident.

### 1. Why do we need a dedicated PM tool (Linear) instead of a TODO file?

A `TODO.md` file has three problems you only notice after a few weeks:

1. **No reliable status.** You only update it when you remember, which means you almost never update it.
2. **Cannot be linked to code.** You don't know which task corresponds to which PR.
3. **Nothing is measurable.** You don't know how much you got done in a week, or how far off your estimates were.

Linear solves all three:

| Linear Concept | In this project                                                        |
| -------------- | ---------------------------------------------------------------------- |
| **Initiative** | The entire "NestJS Mastery" course                                     |
| **Project**    | A phase (Phase 1 — Foundations…)                                       |
| **Issue**      | A lesson, with full description + Definition of Done                   |
| **Sub-issue**  | The three steps in a lesson: Theory & notes · Hands-on · Review & quiz |
| **Cycle**      | A study week — shows your actual **velocity**                          |
| **Estimate**   | Estimated points → compared to actual to practice estimation           |

**The best part, and also a key professional lesson:** task status moves **triggered by git events**, not by someone clicking a button.

```
Create branch  hien/nes-12-controllers   →  issue NES-12 automatically moves to In Progress
PR with the line  "Fixes NES-12"  gets merged →  issue NES-12 automatically moves to Done
```

This is why **branch names and PR descriptions are data, not decorative text**. Name a branch wrong and the automation silently stops working — no error messages, and this is the hardest type of error to detect.

> 📖 Reason for choosing Linear over Trello / GitHub Projects: [ADR-0002](../../adr/0002-linear-lam-nguon-su-that.md)

### 2. Why does Git only have one main branch (`main`)?

You may have heard of **Git Flow** with `main` + `develop` + `feature/*` + `release/*`. This repo intentionally **does not** use it.

We use **trunk-based development**: only `main` is the long-lived branch, each lesson gets its own branch that lives for a few days then disappears.

Reason: the longer a branch lives, the further it gets from `main`, and the more painful the merge. Git Flow was created for the era of versioned software releases (2.1, 2.2…). Most web services today deploy multiple times a day, so trunk-based is more common.

**Squash and merge** — each lesson leaves exactly one commit on `main`:

```bash
git log --oneline main
# a1b2c3d docs(lesson-02): controllers and routing
# e4f5g6h docs(lesson-01): NestJS project structure
# 7h8i9j0 chore: setup workflow, CI, docker and learning materials
```

`git log` tells the story of your learning journey. If you keep every "wip", "fix typo" commit, you lose this property.

> 📖 [ADR-0003](../../adr/0003-trunk-based-mot-lesson-mot-pr.md)

### 3. Conventional Commits — why are you blocked when you write a wrong commit message?

Try typing:

```bash
git commit -m "update code"
# ✖ subject may not be empty / type may not be empty
# husky - commit-msg script failed (code 1)
```

The commit is **rejected right on your machine**, before it even enters the git history.

Required format:

```
<type>(<scope>): <description>

feat(tasks): add CRUD endpoints for tasks
docs(lesson-02): note about controllers and routing
fix(auth): handle expired token case
```

Why the strict requirements:

- **Git history is documentation.** `git log --oneline` reads like a changelog, not a list of "update", "fix bug", "asdf".
- **The type tells you the nature of a commit at a glance** without opening the diff. When tracking down a bug, `fix:` and `refactor:` are two very different types of suspects.
- **It enables automation.** With standard types, you can later generate CHANGELOGs and calculate semantic versions automatically.

Why block at the **local hook** instead of CI: if a message is already pushed and you want to fix it, you have to rewrite history — which is much more expensive than writing it correctly the first time.

### 4. Four quality gate layers — why not just one?

| Layer         | Tool                              | Blocks what                                  | Time cost  |
| ------------- | --------------------------------- | -------------------------------------------- | ---------- |
| 1. On commit  | `lint-staged` (hook `pre-commit`) | Unformatted code / lint errors               | ~2 seconds |
| 2. On commit  | `commitlint` (hook `commit-msg`)  | Non-standard commit message                  | ~1 second  |
| 3. On push/PR | GitHub Actions CI                 | Lint, format, test, build failures           | ~2 minutes |
| 4. On merge   | Branch protection                 | Direct push to `main`, merge while CI is red | instant    |

The underlying principle: **the earlier you catch an error, the cheaper it is.**

For the same missing semicolon error:

- Caught at layer 1 → takes 2 seconds, no one notices
- Caught at layer 3 → takes 2 minutes waiting for CI + a useless "fix lint" commit in history
- Caught at review → takes half a day of someone else's time
- Caught at production → takes an entire evening of the whole team

This is exactly why teams invest in hooks and CI: not because they like the process, but because it's **cheaper**.

Two notable details in this repo:

- `lint-staged` only runs on **staged files**, not the entire repo. Because a slow hook will be skipped with `--no-verify` — and a gate that is skipped is as good as no gate at all.
- CI runs `eslint --max-warnings=0`, meaning **even warnings make CI fail**. Warnings that no one fixes will accumulate into hundreds of lines of noise, hiding the truly important warnings.

> **A warning:** `git commit --no-verify` skips all hooks. Do not use it in this repo. The feeling of "being blocked" is the fastest way to learn.

### 5. What is CI and why is it important?

**CI (Continuous Integration)** = every time you push, the code is built and tested again on **a completely clean machine**.

The problem it solves has a common name in the industry: _**"but it works on my machine"**_. The usual causes are one of three things:

- You have a `.env` file that the repo does not have
- You installed a global package that is not listed in `package.json`
- You forgot to commit a new file

CI runs on a machine that only has exactly what is in git → any differences show up immediately.

Read `.github/workflows/ci.yml`, note a few details:

```yaml
- run: pnpm install --frozen-lockfile
```

`--frozen-lockfile` = installs **exactly** according to `pnpm-lock.yaml`, without auto-upgrading versions. If `package.json` and the lockfile are out of sync, the job **fails** instead of silently installing a different version. This is exactly what you want: the version running on CI must be identical to the version running on your machine.

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

Push a new commit to the same PR → cancels the old run. No one cares about the result of a commit that has been replaced.

#### The first CI run of this repo failed — and that is a lesson

The first PR fails right at the second step:

```
Error: No pnpm version specified.
Please specify one of these ways:
  - in GitHub Action config key "version"
  - in package.json key "packageManager"
```

`pnpm/action-setup` **does not guess** the pnpm version. It reads the `packageManager` field in `package.json` — which the `nest new` scaffold does not generate. The fix:

```json
"packageManager": "pnpm@11.18.0"
```

Notable point: this error **cannot be detected on your machine**, because you already have pnpm installed. Only a clean environment reveals that the repo has not told anyone which pnpm version it needs.

This is exactly **the value of CI, visible from the very first run**: it does not look for bugs in your logic, it finds the **hidden assumptions** you didn't know you were relying on.

The `packageManager` field is also a common Node.js standard (Corepack reads it), so adding it pins the pnpm version for everyone and every machine — the same goal as `--frozen-lockfile`.

### 6. Why run databases with Docker instead of installing them on your machine?

`docker-compose.yml` declares two services: PostgreSQL 16 and Redis 7.

Four reasons:

1. **Can be fully cleaned up.** Run `docker compose down -v` and your machine is back to as if nothing was ever there.
2. **Fixed version.** You and CI use exactly Postgres 16, not "whatever version my machine has".
3. **No conflicts.** Multiple parallel projects each have their own database, no overlapping.
4. This is **how real teams set up dev environments**. A new team member only needs to run `docker compose up`.

Two intentional details in the file:

```yaml
ports:
  - '${POSTGRES_PORT:-5433}:5432'
```

It maps to port **5433**, not 5432. If you already have a PostgreSQL instance running on your machine, it is holding port 5432 — and the "port already in use" error is very common when first learning Docker. That's why the `DATABASE_URL` in `.env` must point to `5433`.

```yaml
healthcheck:
  test: ['CMD-SHELL', 'pg_isready -U postgres']
```

The healthcheck tells Docker the container is **ready to accept queries**, not just "started". This difference is important: Postgres takes a few seconds to accept connections, and any app that starts during that window will crash with `connection refused`.

### 7. `.env` and `.env.example` — two files, two purposes

| File           | In git? | Role                                                                      |
| -------------- | ------- | ------------------------------------------------------------------------- |
| `.env.example` | ✅ yes  | **Documentation** — lists which variables the app needs, with fake values |
| `.env`         | ❌ no   | **Secret** — real values, only ever exists on your machine                |

```bash
cp .env.example .env   # then fill in the actual value
```

> ⚠️ **Golden rule:** a secret that is committed is a secret **that is already exposed**. Deleting it in a later commit does not fix it — it still exists in the git history and every clone. The correct way to handle it is to **revoke that secret** and create a new one.

This is one of the most common security mistakes new devs make. There are even bots that scan GitHub for committed API keys.

### 8. ADR — record **why**, not just **what**

`docs/adr/` contains **Architecture Decision Records**: each file documents one technical decision + the reasoning + the alternatives that were rejected.

Why we need them: the hardest question when returning to a codebase after 6 months is not _"what does this code do?"_ — you can tell that by reading the code. The hard question is _**"why was it done this way instead of that way?"**_

Code only records the **outcome** of a decision. It does not document discarded options, constraints at the time, or accepted tradeoffs. Without an ADR, future developers (including your future self) will reverse a correct decision because they don't know the reasoning behind it.

There's an added value for you here: **writing an ADR forces you to articulate the reason for your choice**. If you can't write an ADR for a decision, it's usually because you don't truly understand why you made that choice. This is one of the clearest differences between junior and senior developers — it's not about knowing more, but about **knowing exactly what tradeoffs you're making and what you're getting in return**.

> 📖 [How to write ADRs + template](../../adr/README.md)

### 9. Multi-agent model — why separate roles?

This repo uses three agents with distinct roles:

| Agent           | Role                                         |
| --------------- | -------------------------------------------- |
| **Claude Code** | Mentor · PM · Reviewer                       |
| **codex**       | Coder (handles issues labeled `agent:codex`) |
| **opencode**    | Cross-check agent, starting from Phase 7     |

Two core rules:

> **No agent writes code and reviews its own code at the same time.**

This is the same reason real teams don't let authors approve their own PRs: someone who just built a solution is already committed to its underlying assumptions, so it's very hard for them to spot flaws in those assumptions themselves.

> **Agents will not do hands-on work for you.**

If AI writes code for you, the only one getting trained is the AI. The most effective way to use codex: **complete the task yourself first**, then look at codex's "reference solution" and compare. The difference between the two versions is the most valuable lesson in this lesson.

> 📖 [AGENT-MODEL.md](../../workflow/AGENT-MODEL.md)

### 10. Reference NestJS documentation correctly

`docs.nestjs.com` is an **Angular SPA**: its content is rendered via JavaScript. Fetching its HTML will only return the `<title>` tag, with no actual content. Any AI that fetches this page then "explains" it to you is speaking from memory, not from the official documentation.

The original markdown source is located in the official upstream repo:

```bash
gh api "repos/nestjs/docs.nestjs.com/contents/content/controllers.md" \
  -H "Accept: application/vnd.github.raw"
```

Some filenames **do not match** their URLs — know this in advance to avoid wasting time:

| Web URL                            | Markdown file                                  |
| ---------------------------------- | ---------------------------------------------- |
| `/middleware`                      | `content/middlewares.md`                       |
| `/fundamentals/custom-providers`   | `content/fundamentals/dependency-injection.md` |
| `/fundamentals/injection-scopes`   | `content/fundamentals/provider-scopes.md`      |
| `/techniques/database`             | `content/techniques/sql.md`                    |
| `/security/encryption-and-hashing` | `content/security/encryption-hashing.md`       |
| `/faq/common-errors`               | `content/faq/errors.md`                        |

And always check the actual version instead of relying on examples from blog posts:

```bash
npm view @nestjs/config version
```

---

## 🔗 Connect to prior knowledge

| In previous Express/Prisma projects                                  | In this repo                                                  | What's different                                                                                                               |
| -------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Run `node index.js` or `nodemon`                                     | `pnpm start:dev` (`nest start --watch`)                       | Nest CLI handles TypeScript compilation + watch, no manual configuration required                                              |
| `npm install`                                                        | `pnpm install`                                                | pnpm uses hard links so it's faster and saves disk space; the lockfile is different so **do not mix** the two package managers |
| Install PostgreSQL directly on your machine                          | `docker compose up -d`                                        | Fixed version, fully removable, matches the CI environment                                                                     |
| Commit directly to `main`                                            | Branch → PR → CI → squash merge                               | There is a place for review; `main` is always in a working state                                                               |
| Track pending work in your head                                      | Linear issue with Definition of Done                          | Status updates automatically based on git events                                                                               |
| Use Prisma as a singleton imported everywhere                        | _(L07)_ `PrismaService` is a **provider** in the DI container | Nest manages the lifecycle — connects and disconnects at the appropriate times                                                 |
| Hexagonal architecture: manually separate domain from infrastructure | Nest has a built-in DI container                              | Nest **comes with** built-in dependency inversion that you previously had to build yourself                                    |

**Food for thought:** when implementing hexagonal architecture with Express, you have to write the dependency injection logic yourself — create interfaces for ports, build adapters, wire everything up manually at the entry point. NestJS builds this system directly into the framework. By L25, you will refactor a module to follow the ports & adapters pattern and see very clearly: **what you used to build by hand is exactly what `@Module` + `@Injectable` do for you now.**

---

## 💻Key points in the repo after setup

```
docs/
  ROADMAP.md              # 8 phases, 26 lessons, doc links per lesson
  workflow/WORKFLOW.md    # 6-step process, conventions, Definition of Done
  workflow/AGENT-MODEL.md # role split between Claude / codex / opencode
  adr/                    # 3 ADRs + template
  lessons/                # Vietnamese notes for each lesson (this file is L00)
  templates/              # lesson note + retro templates
.github/
  workflows/ci.yml        # lint → format → test → build
  pull_request_template.md
  dependabot.yml          # bot that opens a dependency-bump PR weekly
.claude/skills/           # 4 skills: lesson-start · teach · lesson-review · sync-progress
.husky/
  pre-commit              # lint-staged
  commit-msg              # commitlint
commitlint.config.mjs
docker-compose.yml        # postgres:16 + redis:7 (+ adminer, profile "tools")
.env.example
postman/README.md
AGENTS.md                 # shared contract for all AI agents
CLAUDE.md                 # instructions specific to Claude Code
```

### A small but noteworthy change in `src/`

CI runs `eslint --max-warnings=0`, and the default scaffold generated by `nest new` has one warning:

```ts
// src/main.ts — before
bootstrap();

// after
void bootstrap();
```

`bootstrap()` is an `async` function, meaning it returns a `Promise`. If you call it without handling that Promise, the `@typescript-eslint/no-floating-promises` rule will warn you: if an error occurs inside it, no one will catch it, and Node.js will throw an unhandled rejection error.

`void` is a way to tell TypeScript: _"I know this is a Promise, and I intentionally am not awaiting it."_ For `bootstrap()`, this makes sense — it's the entry point of the entire app, there is no higher-level code to `await` it.

**A small but very real lesson:** the quality gate just caught a problem in code generated by the official tool itself. That's exactly why we set up quality gates.

---

## 🛠 Hands-on

Run through the entire workflow to see all the pieces fit together.

**1. Set up the environment**

```bash
pnpm install                  # Husky automatically installs Git hooks via the "prepare" script
cp .env.example .env
docker compose up -d
docker compose ps             # Both services must be in the (healthy) state
```

**2. Run the app**

```bash
pnpm start:dev
curl http://localhost:3000    # → Hello World!
```

**3. Try breaking the quality gate (do it for real, to see it block you)**

```bash
# Try a non-compliant commit message -> it must be REJECTED
echo "test" > /tmp/x && git add -A && git commit -m "update stuff"

# Try a standard-compliant commit message -> it must be ACCEPTED
git commit -m "chore: try conventional commit"
```

**4. Run exactly what CI will run** — before pushing, so you don't have to wait to see failures (red builds)

```bash
pnpm verify
```

**5. View the database directly** (optional)

```bash
docker compose --profile tools up -d
# Open http://localhost:8080
# System: PostgreSQL · Server: postgres · User: postgres · Password: postgres
```

**6. Clean up**

```bash
docker compose down           # keep data
```

---

## ✅ Review & Quiz

Answer in your own words, don't copy from the section above.

1. **Why are commit messages blocked by the local git hook instead of being checked by CI?**
   → _(answer yourself)_

2. **How is `pnpm install --frozen-lockfile` on CI different from `pnpm install` on your local machine, and why does CI need the `--frozen-lockfile` version?**
   → _(answer yourself)_

3. **You rename your branch from `hien/nes-12-controllers` to `feature/controllers` for "readability". What will happen, and why is this hard to detect?**
   → _(answer yourself)_

4. **For the same formatting error, what's the cost difference between catching it in `lint-staged` vs catching it in CI? What principle can you derive from this?**
   → _(answer yourself)_

5. **`docker-compose.yml` maps PostgreSQL to port 5433 instead of 5432. Why? What error will you encounter if you overlook this detail?**
   → _(answer yourself)_

6. **You accidentally commit a `.env` file containing your real JWT secret, then commit another commit that deletes that file. Is the secret safe now? Why?**
   → _(answer yourself)_

**Lead-in to the next lesson:** L01 will deep dive into the 5 files in `src/` generated by `nest new`. Before starting, try to guess on your own: how is `main.ts` different from the `index.js` of an Express app?

---

## 🧠 Key takeaways

1. **Task status should be updated via git events, not manual clicks.** That's why branch names and PR descriptions are data, not decorative text.
2. **Catching errors early is always cheaper** — that's the entire reason hooks, CI, and branch protection exist.
3. **A secret that gets committed is a compromised secret.** You can't fix this by committing a deletion; you have to revoke it and generate a new one.
4. **ADRs document the _why_, which code can never capture.** Being able to write an ADR is a sign that you truly understand your own decision.
5. **AI should not do hands-on work for you, and it should not review its own code.** Both rules exist to protect value: one protects learning value, the other protects review value.

---

## 📎 Sources

- [NestJS — First Steps](https://docs.nestjs.com/first-steps)
- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
- [Trunk Based Development](https://trunkbaseddevelopment.com/)
- [Michael Nygard — Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [GitHub Actions — Workflow syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Docker Compose — Compose file reference](https://docs.docker.com/reference/compose-file/)
- [Linear — GitHub integration](https://linear.app/docs/github)
- [husky](https://typicode.github.io/husky/) · [lint-staged](https://github.com/lint-staged/lint-staged) · [commitlint](https://commitlint.js.org/)
- Repo ADRs: [0001 Prisma](../../adr/0001-chon-prisma-lam-orm.md) · [0002 Linear](../../adr/0002-linear-lam-nguon-su-that.md) · [0003 Trunk-based](../../adr/0003-trunk-based-mot-lesson-mot-pr.md)

---

<!-- CO-OP TRANSLATOR DISCLAIMER START -->

**Disclaimer**:
This document has been translated using AI translation service [Co-op Translator](https://github.com/Azure/co-op-translator). While we strive for accuracy, please be aware that automated translations may contain errors or inaccuracies. The original document in its native language should be considered the authoritative source. For critical information, professional human translation is recommended. We are not liable for any misunderstandings or misinterpretations arising from the use of this translation.
<!-- CO-OP TRANSLATOR DISCLAIMER END -->
