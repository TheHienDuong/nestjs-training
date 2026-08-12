# ADR-0003: Trunk-based development — one lesson, one PR, squash merge

- **Status:** Accepted (decision #5 is superseded by [ADR-0005](0005-coder-agent-opens-pr-to-main.md))
- **Date:** 2026-08-10
- **Decision maker:** Hien Duong

## Context

We need to select a branching strategy. Three common models:

- **Git Flow** — `main` + `develop` + `feature/*` + `release/*` + `hotfix/*`
- **GitHub Flow** — `main` + short-lived branches, continuous merging
- **Trunk-based** — `main` is the trunk, branches are very short-lived (less than a few days)

Constraint: single contributor, each lesson is an independent unit of work that must be **reviewed before merging into `main`** (because review is part of the learning process, not a bureaucratic step).

The repo also has specific technical requirements: Linear needs one PR per issue to automatically transition status, and the `main` history should be readable as a learning timeline.

## Decision

1. **Trunk-based:** only `main` is a long-lived branch. There is no `develop`.
2. **One lesson = one branch = one PR.** Branch names are taken from Linear (`hien/nes-XX-...`).
3. **Squash and merge** — each lesson leaves exactly one commit on `main`.
4. **Branch protection on `main`:** direct push is forbidden, PRs are mandatory, green CI is mandatory.
5. Agent branches (`codex/...`) merge into the **lesson branch**, not directly into `main`.

## Considered Alternatives

| Alternative                           | Pros                                                                                                                               | Cons                                                                                                     | Reason for not selecting                            |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **Trunk-based + squash** _(selected)_ | `main` is always runnable; clean history — `git log` shows the correct learning path; short branches mean no large merge conflicts | Lose detailed commits within the lesson after squash                                                     | —                                                   |
| **Git Flow**                          | Standard for software with multiple parallel releases                                                                              | Too many branches for a single contributor; `develop` + `main` don't solve any problems here             | Overhead doesn't bring any benefits                 |
| **Commit directly to `main`**         | Fastest                                                                                                                            | No PR → no review → completely lose step 4 of the workflow; Linear can't automatically transition status | Lose the most valuable part of the learning process |
| **Merge commit instead of squash**    | Retains all detailed commits                                                                                                       | `main` history is cluttered with "wip", "fix typo" commits                                               | Prioritize `main` being readable as documentation   |

## Consequences

**Positive**

- `git log --oneline` on `main` is exactly the record of the learning path: one line per lesson.
- Branch protection creates a real barrier — you will _be blocked_ when you make a mistake, and the feeling of being blocked teaches faster than reading rules.
- Short-lived branches mean you almost never have to handle complex merge conflicts — this is exactly why large teams switch to trunk-based development.

**Trade-offs**

- Squashing loses detailed commits within a lesson. Accepted trade-off: the trial-and-error process within a lesson is recorded in the **lesson note**, which is more useful than git history.
- Branch protection means even you can't push directly to `main`. You will find it inconvenient at times — that is intentional, and it's also the reality at every company.

**Next Steps**

- Enable branch protection after the first PR is merged (you need at least one CI run to select the required status check).
- Since you are working alone, **do not** enable "require approval from others" — that would block yourself. The barrier here is _green CI_ + the `/lesson-review` step.

---

<!-- CO-OP TRANSLATOR DISCLAIMER START -->

**Disclaimer**:
This document has been translated using AI translation service [Co-op Translator](https://github.com/Azure/co-op-translator). While we strive for accuracy, please be aware that automated translations may contain errors or inaccuracies. The original document in its native language should be considered the authoritative source. For critical information, professional human translation is recommended. We are not liable for any misunderstandings or misinterpretations arising from the use of this translation.
<!-- CO-OP TRANSLATOR DISCLAIMER END -->
