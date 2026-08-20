# ADR-0007: Claude Code Takes Back the Local Reviewer Role (Multi-Reviewer Load-Balancing Model)

- **Status:** Proposed
- **Date:** 2026-08-19
- **Decision maker:** Hien Duong

## Context

On 2026-08-13 (PR #24 "governance-workflow-reviewmerge"): the decision was made for Claude Code to **drop the code-reviewer role** → remaining only Mentor · PM. At that time, layer-1 code review = Copilot CLI (automated, on GitHub), lead review + merge = the user. The reasoning at the time: separate the "teacher" from the "person typing up reviews," to avoid Claude taking on too much.

On 2026-08-19: the user decided to build a **multi-reviewer load-balancing model** (see `docs/workflow/REVIEW-MODEL.md`): no single agent should carry the entire review workload; each agent reviews what it's best at; save tokens (Copilot only approves large MRs). The resulting role analysis exposed a gap:

- **Local review** (reading + reviewing the Coder agent's code before merging via a dedicated PR) needs a role with **long context** (roadmap + all notes + full learning history) and **architectural reasoning** — exactly Claude Code's strength.
- Claude is also the one who **splits large tasks into small PRs** (it has memory, knows what's already been done), so having it review those same PRs afterward is a natural continuation.
- The Coder agent (codex) **must not review** — per the core principle "no agent writes code and reviews its own code at the same time" (AGENT-MODEL.md), and to avoid waste.

## Decision

1. **Claude Code takes on the Local Reviewer role** — reviewing the Coder agent's (codex) code **before merge** in the small-PR flow, and acting as **failover #1 for the Copilot gatekeeper** (large-MR review) when Copilot hits its limit.
2. **codex (Coder) DOES NOT review code/PRs** — code only; no reviewing its own just-created PR or anyone else's. This rule applies to **`codex` in the interactive Coder role** (branch `codex/nes-XX-...`) — it does not apply to the **Codex GitHub App connector** (`chatgpt-codex-connector[bot]`, an automated GitHub App), since that connector does not write code, it only analyzes diffs (see `docs/workflow/REVIEW-MODEL.md`). **agy** (the counter-view role, replacing `opencode` as of 2026-08-20) is also not the primary reviewer — see `docs/workflow/REVIEW-MODEL.md`.
3. **Copilot CLI keeps the automated gatekeeper role** (layer-1 review, on GitHub) for large MRs; **the user remains the lead reviewer + only the user merges** (unchanged).
4. The 2026-08-13 decision (PR #24) to have Claude drop the code-reviewer role is **superseded starting from this ADR**.

## Alternatives considered

| Option                                            | Pros                                                                                             | Cons                                                                                                        | Why not chosen                         |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Keep Claude = Mentor · PM only (as of 2026-08-13) | Doesn't reverse the earlier decision                                                             | Missing a local reviewer; Copilot/Codex/agy carry everything → overload + token cost                        | Conflicts with the multi-reviewer goal |
| **Claude as Local Reviewer** _(chosen)_           | Balances the load; leverages memory + large context; a natural continuation of splitting the PRs | Adds workload to Claude; requires re-syncing the old rules                                                  | —                                      |
| Codex as local reviewer                           | Strong at code quality                                                                           | The Coder role would violate "no agent writes and reviews its own code"; already decided codex is code-only | Violates the core principle            |

## Consequences

**Positive:** review load is distributed by each agent's strengths; Claude's local review stays consistent thanks to memory; the per-agent rulebook is transparent enough for the user to verify.

**Cost paid:** Claude takes on additional review responsibility (extra workload); the old rules stating "Claude does not review" must be updated (`AGENT-MODEL.md`, `.hermes.md`, `CLAUDE.md`).

**Follow-up needed:** write `docs/workflow/REVIEW-MODEL.md`; update `AGENT-MODEL.md`/`.hermes.md`/`CLAUDE.md` to match; update the ADR list table (`README.md`); EN mirror to `example/nestjs-training` (bilingual).
