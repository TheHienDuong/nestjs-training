# ADR-0003: Trunk-based development — one lesson per PR, squash merge

- **Status:** Accepted
- **Date:** 2026-08-10
- **Decision maker:** Hien Duong

## Context

A branching strategy must be selected. Three common models:

- **Git Flow** — `main` + `develop` + `feature/*` + `release/*` + `hotfix/*`
- **GitHub Flow** — `main` + short-lived branches, merged continuously
- **Trunk-based** — `main` is the trunk, with very short-lived branches (under a few days)

Constraint: one person is working, each lesson is an independent unit of work, and it must be **reviewed before entering `main`** (because review is part of learning, not a formality).

The repository also needs a specific technical condition: Linear needs one PR per issue to transition status automatically, and the `main` history should read like a learning timeline.

## Decision

1. **Trunk-based:** only `main` is a long-lived branch. There is no `develop`.
2. **One lesson = one branch = one PR.** The branch name comes from Linear (`hien/nes-XX-...`).
3. **Squash and merge** — each lesson leaves exactly one commit on `main`.
4. **Branch protection on `main`:** direct pushes are prohibited, a PR is required, and CI must pass.
5. An agent branch (`codex/...`) merges into the **lesson branch**, not directly into `main`.

## Options considered

| Option                              | Advantages                                                                                                                         | Disadvantages                                                                                           | Why it was not chosen                              |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| **Trunk-based + squash** _(chosen)_ | `main` always works; clean history — `git log` reads exactly like the learning roadmap; short-lived branches avoid large conflicts | Detailed commits within a lesson are lost after squashing                                               | —                                                  |
| **Git Flow**                        | Suitable for software with multiple parallel releases                                                                              | Too many branches for one person; `develop` + `main` solves no problem here                             | Overhead with no benefit                           |
| **Commit directly to `main`**       | Fastest                                                                                                                            | No PR → no review → workflow step 4 is completely lost; Linear does not transition status automatically | Loses the part with the greatest learning value    |
| **Merge commit instead of squash**  | Retains every detailed commit                                                                                                      | The `main` history includes "wip" and "fix typo" commits                                                | Prioritize making `main` readable as documentation |

## Consequences

**Positive**

- `git log --oneline` on `main` is the learning roadmap record itself: one lesson per line.
- Branch protection creates a real guardrail — you will be _blocked_ when doing something wrong, and being blocked teaches faster than reading rules.
- Short-lived branches mean complex merge conflicts are rarely handled — exactly why large teams move to trunk-based development.

**Trade-offs**

- Squashing loses detailed commits within a lesson. Accepted: the exploration process within a lesson is recorded in the **lesson note**, where it is more useful than in git history.
- Branch protection means you also cannot push to `main`. It will sometimes feel inconvenient — that is intentional and is also the reality at every company.

**Follow-up work**

- Enable branch protection after the first PR has merged (CI must run at least once so the required status check can be selected).
- Because this is a solo project, **do not** enable "require approval from another person" — it would block the learner. The guardrail here is _passing CI_ + the `/lesson-review` step.
