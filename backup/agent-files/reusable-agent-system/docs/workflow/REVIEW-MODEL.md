# 🔎 REVIEW MODEL — Multi-Reviewer Load-Balancing Model

> **For every agent:** this file defines **who reviews what** in the repo. Read together with `AGENT-MODEL.md` + `docs/bilingual-policy.md`. Core rule: **no agent writes code and reviews its own code at the same time**; the reviewer must not be the same as the author; the Coder (codex) only writes code, **does not review**.

## Goals

- **Distribute review load** according to each agent's strengths — no single agent carries everything.
- **Save tokens:** the gatekeeper (Copilot) **only** approves large MRs; small PRs use a lighter reviewer matched to their type.
- **Transparency:** every reviewer has a documented **rulebook**; the user can read each agent's rules to verify.
- **Built-in failover:** when an agent hits its limit, someone else takes over — no blocked pipeline, no rubber-stamped merges.

## 1. Review matrix — who is best at reviewing what

| Agent                          | Role                                            | Best at                                                                                                             | Do not assign                                             | Cost                       |
| ------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------- |
| **Copilot CLI**                | **Gatekeeper** (approves MRs into main)         | Thorough, line-by-line review of large PRs; regressions/contract breaks; deep repo context                          | Reviewing individual small PRs (wastes tokens)            | High — **max 2 times/day** |
| **Claude Code**                | **Local reviewer** (logic/docs) / splits PRs    | Architecture, cross-file consistency, DI/service, docs/SPEC/ADR, security reasoning; memory keeps things consistent | Writing hands-on code; merging; reviewing PRs it authored | Medium                     |
| **Codex GitHub App connector** | **Code quality / Security (layer 1, every PR)** | DTO/validation, N+1, secrets, missing tests; fast scanning via `chatgpt-codex-connector[bot]`                       | Repo-level architecture                                   | Free                       |
| **agy** (counter-view)         | **Second opinion**                              | Counterargument perspective, catching what the primary reviewer missed; backup when overloaded                      | Deep architecture-level review                            | Low                        |
| **Hermes**                     | **Orchestrator / Verifier**                     | Coordination, routing to the right reviewer, running `pnpm verify`, verifying self-reports                          | Final review (verify + summarize only)                    | —                          |

> ⚠️ **`agy` = counter-view; `opencode` has been removed from the system (2026-08-20).** agy dispatches via a herdr pane (profile `coder-agy`, NO headroom wrap — runs bare).
>
> ⚠️ **The Codex GitHub App connector ≠ `codex` (the Coder):** the connector in the table above is an **automated GitHub App** (`chatgpt-codex-connector[bot]`, no dedicated workflow needed, does not write code, holds no dedicated branch) — different from `codex` acting as the **Coder role** (interactive agent, codes on branch `codex/nes-XX-...`). The Coder (codex, interactive role) is **never** assigned review work — not even its own PR or anyone else's; the Codex GitHub App connector is not bound by this restriction since it does not write code, it only analyzes diffs.
>
> ⚠️ **Author check before routing by type:** a PR **authored by Claude** (docs/ADR/infrastructure) → Claude **must NOT** be the reviewer for that PR, even if the content type matches "logic/docs". Route to **Hermes manual verify + direct user lead review** (small PR) or **Copilot gatekeeper** (if bundled into a large MR). Check the author FIRST, then pick by content type.

## 2. Pipeline (daily rhythm — SEQUENTIAL, respects the pane cap)

```
Large task → Claude SPLITS it into small PRs (each PR ≤ 20 FILES, 1 branch/PR)
  → (sequential, reusing ephemeral panes, cap of 2-3 worker panes) light review by type:
       Claude(logic/docs, pane) | agy(counter-view, when needed, pane)
       + Codex GitHub App connector(code quality, automated via the GitHub App — NOT via a pane, runs in parallel)
       + tests + action check (pnpm verify, CI scope ≤20)
  → end of day / whenever the user feels ready → bundle into 2 "large MRs" (collector branch mr/<date>-<seq>)
  → Gatekeeper does a thorough review (Copilot, max 2/day) → MR into main — only the user merges
  → weekend: codex security sweep across the whole project (user runs it)
```

> ⚠️ **The `mr/*` collector does NOT replace ADR-0005:** small PRs still open directly and merge into `main` per ADR-0005 first. `mr/*` is a **bundling layer AFTER that** (from commits already on `main`) so the Copilot gatekeeper can do one thorough review pass before "release" — it is not an alternative path. Details: [ADR-0008](../adr/0008-review-collector-mr.md).

**Hard rules:**

- **2 MRs/day is a CEILING, not a quota** — the user chooses the number (0-2) and the timing; overflow rolls to the next day in the order it was bundled.
- One small PR **≤ 20 FILES** (guard: no single file >~400 lines).
- The gatekeeper (Copilot) **only** reviews large MRs; small PRs **never** use Copilot.
- Operate **sequentially**, reusing ephemeral panes — **do not open N panes in parallel** (cap of 2-3, ADR-0006).

## 3. Budget & where state is stored

| Reviewer        | Budget/day                                                            | When the cap is hit                    |
| --------------- | --------------------------------------------------------------------- | -------------------------------------- |
| Copilot         | 2 reviews (2 large MRs)                                               | stop calling; MR delayed to next day   |
| Claude          | 3-4 small-PR reviews + PR splitting                                   | hand off to agy + Hermes manual verify |
| Codex connector | 4-5 reviews/day (connector rate limit) + weekend sweep (user runs it) | Hermes manual verify                   |
| agy             | flexible (cheap)                                                      | —                                      |

- Counters are stored in **hermes kanban** (the single task-state source) + the herdr-agent-state plugin. Do NOT write a separate registry/daemon.
- **Resets at midnight Vietnam time.** Hermes reads the counter before every dispatch to pick the reviewer + enforce the ceiling.

## 4. Failover matrix (by role)

| Agent out           | Replacement                                                                                                               | Degrade                                         | Recovery                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------ |
| **Copilot**         | **Claude** (deep gatekeeper) → **Codex connector** (thorough scan) → **manual user** (Hermes prepares a checklist + diff) | drop to 1 MR/day or delay 1 day                 | reset → resume Copilot         |
| **Claude**          | **agy** (counter-view, NOT the primary reviewer) + **Hermes manual verify**                                               | small PRs wait, or the user reviews temporarily | reset → Claude takes back over |
| **Codex connector** | **Hermes manual verify** (RAW diff + `pnpm verify`)                                                                       | weekend sweep is postponed (user runs it later) | rolled into next weekend       |
| **agy**             | **Hermes verifies by hand**                                                                                               | drop the counter-view layer temporarily         | —                              |

Principle: never **block** the pipeline; an MR into main **requires at least 1 serious reviewer** (Copilot or Claude deep) — no rubber-stamped merges; log a queue when limits are hit, **do not spam prompts**.

## 5. Real auto-review mechanisms (2 layers, no overlap)

1. **Codex GitHub App connector** (`chatgpt-codex-connector[bot]`): reviews automatically on **every PR** at open/sync (a GitHub App, no dedicated CI workflow needed) = a free auto-review layer, matching the "Codex code-quality" role. It reads AGENTS.md/CLAUDE.md and uses P0/P1/P2 severity when reviewing. **No dedicated workflow file needed.**
2. **Copilot gatekeeper:** kept separate — **dispatched interactively via herdr** (profile `reviewer-copilot`), **applies ONLY to `mr/*` branches** (collectors) before merging into main. Does not conflict with the Codex GitHub App connector.

## 6. Review rulebook per agent (visible to the user)

Hermes' dispatch prompt for review = `[rulebook] + [diff] + [request for a verdict + P0/P1/P2 issues]`. **The verdict returned = an FS-sentinel JSON** (nonce + verdict + issues) — NOT text-matching (to avoid the false positive from ADR-0006).

| Reviewer                                    | Rulebook                                                                                                                                                                         |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Claude** (logic/docs)                     | Controllers only handle HTTP; business logic lives in services; constructor DI; error handling + transactions; cross-file consistency; SPEC/lesson accuracy; no over-engineering |
| **Codex connector** (code-quality/security) | **Link to `AGENTS.md` → "Code Review Rules"** (single source of truth, do not copy)                                                                                              |
| **Copilot** (gatekeeper)                    | Thorough full-diff review; regressions/contract breaks; merge-readiness + green CI; final security check before main                                                             |
| **agy** (counter-view)                      | Alternative designs; missed edge cases; a perspective different from the primary reviewer                                                                                        |
| **Hermes** (verify)                         | RAW git diff + `pnpm verify` + cross-check against self-reports (don't trust the agent's word)                                                                                   |

## 7. Final decision maker

- **User (Hien Duong)** = lead reviewer + **only the user merges**. No agent merges.
- **Mandatory code-owner approval before merge (2026-08-20):** `@hienduong-agilityio` (`.github/CODEOWNERS`) — an additional gate on GitHub, does **not** change merge rights (still only the user merges).
- Related ADRs: [ADR-0007](../adr/0007-claude-reviewer-local-multi-reviewer.md) (Claude takes on the Reviewer local role), [ADR-0008](../adr/0008-review-collector-mr.md) (the `mr/*` collector does not replace ADR-0005).
