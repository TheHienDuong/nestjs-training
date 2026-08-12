# ADR-0003: Trunk-based development — one lesson per PR, squash merge

- **Status:** Accepted (decision #5 is replaced by [ADR-0005](0005-coder-agent-opens-pr-to-main.md))
- **Date:** 2026-08-10
- **Decision maker:** Hien Duong

## Context

We need to select a branching strategy. Three common models:

- **Git Flow** — `main` + `develop` + `feature/*` + `release/*` + `hotfix/*`
- **GitHub Flow** — `main` + short-lived branches, continuous merge
- **Trunk-based** — `main` is the trunk, branches are very short-lived (under a few days)

Constraints: single contributor, each lesson is an independent unit of work and must be **reviewed before merging into `main`** (because review is part of the learning process, not a procedural step).

The repository also has specific technical requirements: Linear requires one PR per issue to automatically transition status, and the `main` history should be readable as a learning timeline.

## Decision

1. **Trunk-based:** only `main` is the long-lived branch. No `develop`.
2. **One lesson = one branch = one PR.** Branch names are taken from Linear (`hien/nes-XX-...`).
3. **Squash and merge** — each lesson leaves exactly one commit on `main`.
4. **Branch protection on `main`:** prohibit direct pushes, require PRs, require green CI.
5. Agent branches (`codex/...`) are merged into the **lesson branch**, not directly into `main`.

## Considered Alternatives| Option                            | Pros                                                                                                             | Cons                                                                                          | Reason for not selecting                             |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------- |
| **Trunk-based + squash** _(selected)_ | `main` is always runnable; clean history — `git log` correctly reflects the learning roadmap; short branches so there are no major conflicts | Loses detailed commits within lessons after squash                                            | —                                             |
| **Git Flow**                         | Standard for software with multiple parallel releases                                                              | Too many branches for a single person; `develop` + `main` does not solve any problem in this context             | Overhead that delivers no value                || **Commit straight to `main`** | Fastest | No PR → no review → completely missing step 4 of the workflow; Linear won't automatically change status | Misses out on the highest-value learning part
| **Merge commit instead of squash** | Retains all detailed commits | `main` history is cluttered with "wip", "fix typo" commits | Prioritizes `main` being readable like documentation

## Consequences

**Positive**
- `git log --oneline` on `main` is a direct record of your learning journey: each line represents one lesson.
- Branch protection creates a real barrier — you will be _blocked_ when you make a mistake, and the experience of being blocked teaches you faster than reading the rules.
- Short-lived branches mean you almost never have to deal with complex merge conflicts — this is precisely why large teams switch to trunk-based development.

**Costs**
- Squash merges erase detailed commits within lessons. Accept this: the trial-and-error process inside a lesson is recorded in the **lesson note**, which is more useful than git history.
- Branch protection means even you cannot push to `main`. You will find this inconvenient at times — this is intentional, and it is also the reality at every company.

**Next steps**- Enable branch protection after the first PR has been merged (you need at least one CI run to select the required status check).
- Since I'm working alone, do **not** enable "require approval from others" — you will end up blocking yourself. The safeguard here is _green CI_ + the `/lesson-review` step.