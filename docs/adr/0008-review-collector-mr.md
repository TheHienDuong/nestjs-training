# ADR-0008: The `mr/*` Collector Branch Is a Post-Merge Bundling Layer, Not a Replacement for ADR-0005

- **Status:** Proposed
- **Date:** 2026-08-20
- **Decision maker:** Hien Duong

## Context

`docs/workflow/REVIEW-MODEL.md` (the multi-reviewer model, PR #44/#45) describes a pipeline: small PRs are split and lightly reviewed by type, then "bundled into 2 large MRs" on a collector branch `mr/<date>-<seq>` for the Copilot gatekeeper to review thoroughly before merging into `main`.

[ADR-0005](0005-coder-agent-opens-pr-to-main.md) (Accepted) had already decided: the Coder agent **opens separate PRs directly into `main`** — each small PR merges independently, with no bundling into an intermediate branch. The Codex review on PR #45 pointed out a real conflict: if small PRs already follow ADR-0005 (merged directly into `main`), there is nothing left to "bundle" into `mr/*`; if small PRs instead target `mr/*` directly, that violates ADR-0005. ADR-0007 only supersedes the reviewer-role decision and does not touch ADR-0005 — so a dedicated ADR is needed to clarify the boundary.

## Decision

1. **Small PRs still follow ADR-0005 exactly:** open a separate PR, target `main`, go through review (Claude local review → Codex GitHub App connector automated → user lead review), and merge directly into `main` once the user approves. The target branch never changes to `mr/*`.
2. **`mr/*` is a POST-MERGE AUDIT bundling layer, not a pre-merge gate:** at the end of the day (or whenever the user feels it's needed), Hermes creates branch `mr/<date>-<seq>` **from commits already on `main`** (already merged per ADR-0005), so the Copilot gatekeeper can do one thorough, consolidated review pass before those changes are considered officially "released" (a post-merge quality gate — it does not block code from entering `main`).
3. If the Copilot gatekeeper finds an issue during the `mr/*` audit, it is fixed with a new PR (following ADR-0005 as usual) — **never by directly reverting on `mr/*`**.
4. `mr/*` is capped at 2 times/day (per `REVIEW-MODEL.md` §2/§3) — this is a ceiling on the number of audit passes, not a ceiling on how many small PRs may merge in a day.

## Alternatives considered

| Option                                                                                                | Pros                                                                       | Cons                                                                                                                | Why not chosen                                          |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Small PRs target `mr/*` directly (pre-merge gate)                                                     | Copilot reviews before entering `main`, blocks issues early                | Violates ADR-0005 (the Coder must open PRs directly to `main`); reverses an already-Accepted decision unnecessarily | Violates an Accepted ADR                                |
| **`mr/*` as a POST-merge audit (chosen)**                                                             | Keeps ADR-0005 intact; Copilot still provides periodic consolidated review | Issues found during the audit must be fixed via a new PR, not blocked in real time                                  | —                                                       |
| Drop the `mr/*` collector entirely, rely only on the Codex GitHub App connector + Claude local review | Simplest, no dedicated ADR needed                                          | Loses the consolidated/thorough review layer Copilot provides for large batches of changes                          | The user wants to keep Copilot as a periodic gatekeeper |

## Consequences

**Positive:** resolves the ADR-0005 vs `mr/*` conflict; small PRs still merge quickly into `main` without waiting on Copilot; Copilot still serves as a periodic gatekeeper (post-merge), matching the "save tokens, only gate large work" intent.

**Cost paid:** an issue the Copilot audit finds is already on `main` — it cannot be "blocked" like a real gate, only fixed via a follow-up PR; audit findings must be logged in `docs/lessons/_agent-log.md` so they aren't lost.

**Follow-up needed:** update `docs/workflow/REVIEW-MODEL.md`'s pipeline to match (done), add the ADR-0008 row to `docs/adr/README.md` (done), and observe the first `mr/*` audit to see whether the "bundle from commits already on main" mechanism needs tooling or can stay manual.
