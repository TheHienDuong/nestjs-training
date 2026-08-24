# 🤖 AGENT MODEL — Multi-agent coordination model

> This repo deliberately uses **multiple AI agents with separate roles**, instead of one agent doing everything.
> This isn't "for fun": splitting roles is the only way to preserve both the learning value and the review value.

## Core principle

> **No agent both writes code and reviews its own code.**

The reason is the same as why a real team doesn't let an author approve their own PR: whoever wrote a solution has already "committed" to its assumptions, making it very hard to spot the flaws in those same assumptions. With AI the effect is even stronger — a model tends to defend the output it just produced.

The second principle, important for the learner:

> **Agents do not do the hands-on work for you.** If AI writes the code for you, the only thing that gets trained is the AI.

---

## Role split

Only **2 roles**, not a fixed list of tools. The "Coder" role is **flexible** — whichever tool fills that role follows the same mold, no need for tool-specific rules. You mainly use codex; occasionally swapping in or adding another tool just means changing the name in the command, not relearning the rules.

### 🎓 Claude Code — Mentor · PM · Reviewer local (fixed)

| Does                                                                   | Does not do                                             |
| ---------------------------------------------------------------------- | ------------------------------------------------------- |
| Create & split tasks on Linear, write full descriptions                | Write hands-on code for you                             |
| Teach, read the latest docs, give examples, connect to prior knowledge | Review code it generated itself                         |
| Quiz to check understanding (learning review)                          | Merge PRs for you — **only the user merges**            |
| **Review the Coder agent's code before merge (local review)**          | Write code/tests in `src/`, `test/` for the Coder agent |
| Write lesson notes, ADR, generate/update SPEC.md, sync Notion/Slack    |                                                         |

**Local review is Claude Code's responsibility** — when the Coder agent (codex) opens a PR, Claude Code reviews that code before the user decides whether to merge. The Coder agent **does not** review PRs itself (whether its own or someone else's) — this follows exactly the core principle above: no agent both writes and reviews its own code, and a reviewer must not be the same party as the author.

**Exception when Claude is the author:** if a PR (docs/ADR/infrastructure) was created by Claude itself, Claude **does not** review that PR — it routes to Hermes for manual verification + direct user lead review (details: `docs/workflow/REVIEW-MODEL.md`).

**Why this role is fixed on Claude:** its large context window lets it hold the whole roadmap + all your notes + your learning history at once — exactly what a mentor needs. The PM role also needs **one** single place of record (see the MCP section below) — fixing one agent to this role is a requirement to avoid conflicts, not a preference.

### 🔎 Codex GitHub App connector — Code-quality reviewer, layer 1 (automatic on EVERY PR)

The GitHub App connector (`chatgpt-codex-connector[bot]`, the actual bot commenting on PRs on GitHub), automatic when a PR opens/syncs/reopens — no dedicated CI workflow, no background process, no daemon, no merging. This is the **automated review layer on GitHub for every PR** (including small ones); **local review** (reading/reviewing the Coder agent's code before merge) is **Claude Code's** responsibility, described above. The **Codex GitHub App connector** is a separate connector/bot — **not** the `codex` holding the Coder role, so it is not bound by the "Coder does not review" rule.

### 🚪 Copilot CLI — Gatekeeper for large MRs (dispatched via herdr, NOT automatic)

Only used for the collector branch `mr/*` (max 2 times/day), dispatched interactively via herdr — **does not** run automatically on every PR, **not** used for small PRs. Details: `docs/workflow/REVIEW-MODEL.md`.

### 🧑‍💻 User (Hien Duong, `@TheHienDuong`) — Lead reviewer + merge

Reviews the code again after Claude Code's local review + the Codex GitHub App connector (and the Copilot gatekeeper for large MRs), and makes the final call on whether to merge. **Only the user merges** — no agent merges, even one granted broad authority. A PR also needs the mandatory approval of code owner `@hienduong-agilityio` (`.github/CODEOWNERS`, 2026-08-20) before the merge button becomes available.

### ⚙️ Coder — a flexible role, follows the same mold whichever tool holds it

Takes an issue labeled `agent:codex` (or the matching label if you assign another tool). **The `SPEC.md` generated from the Linear description IS the spec** — a vague spec produces vague output, which is also a lesson about how to write good tickets.

Rules — apply to **any tool** holding the Coder role, not just codex:

- Work on a **dedicated branch**, named `<tool name>/nes-XX-...` (`codex/...`, or another tool's name) — never commit straight to your `hien/...` lesson branch
- Read `AGENTS.md` (the general contract) + `docs/lessons/XX-*/SPEC.md` (the spec for the exact lesson) before working
- Output **always goes through a PR** — Claude Code local review → Codex GitHub App connector review (layer 1, automated, every PR) → user lead review — never merge directly, no agent merges. Large MRs (`mr/*`) add a Copilot gatekeeper before the user merges
- ⛔ **DOES NOT review code/PRs** — the Coder role only **codes**; it does not review (whether the PR it just created or someone else's). The local reviewer is Claude Code, the final reviewer is the user.

**Mainly used:** codex — the default tool for the Coder role.

```bash
git checkout -b codex/nes-12-reference-solution
codex "Read AGENTS.md first. Implement according to the spec in docs/lessons/02-controllers/SPEC.md.
       Only touch files in src/. Do not touch docs/ or .github/."
```

**The most useful way to use this when learning:** do the hands-on work yourself first, and only _after_ finishing look at the Coder agent's "reference solution" to compare. The difference between the two is the most valuable lesson in that lesson.

### 🔀 agy — Counter-view (NOT a Coder, 2026-08-20)

Replaces `opencode` (removed from the system). Used when you want an additional perspective to compare against an existing PR/design — **not an official Coder role**, not mandatory, not the primary reviewer. Runs via a **herdr pane** (profile `coder-agy`), **NOT wrapped by headroom** — the CLI runs bare:

```bash
# Edit files itself to compare (dedicated branch agy/nes-XX-...)
git checkout -b agy/nes-12-alt-solution
agy -p "Read AGENTS.md and docs/lessons/02-controllers/SPEC.md first. Implement per the spec." \
  --model <model> --output-format text --mode accept-edits

# Only want a perspective/plan, without editing code
agy -p "Assess the design in PR #NN, point out edge cases it misses" \
  --model <model> --output-format text --mode plan
```

The goal isn't to find "which tool is better" but to recognize that the same spec/PR can have multiple valid perspectives, and **you** are the one who decides which to pick.

---

## MCP: Linear open to the coder agent, Notion/Slack/Postman connected only by Claude Code

**Principle: Claude Code is the single-writer for Notion/Slack/Postman; Linear is open to both Claude (PM) and the coder agent.** The coder agent (codex) is configured with the Linear MCP so it can read/create/track its own tasks. The Coder role — whichever tool holds it — still **does not** configure an MCP connection to Notion/Slack/Postman, even though technically many CLI agents (codex, etc.) support adding their own MCP server via their own config file.

Reasoning and alternatives considered: see [ADR-0004](../adr/0004-mcp-single-writer-for-coder-agent.md) (amended). Summary: multiple agents writing to Notion/Slack at once creates a real race condition (Slack gets duplicate notifications, Notion gets overwritten) — exactly the "multiple sources of truth" problem that [ADR-0002](../adr/0002-linear-as-source-of-truth.md) avoided at the system level, now avoided again at the agent level. For Linear, the boundary is no longer kept by "only one agent has an MCP connection" but by a rule: the coder does not touch issues under Claude's review/PM cycle (does not change the status of an issue Claude created or is currently processing).

| Role             | Connects to Linear/Notion/Slack/Postman?               | How it gets the spec                                                              |
| ---------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Claude Code (PM) | Yes — Linear + Notion/Slack/Postman                    | Reads the issue directly via the Linear MCP                                       |
| Coder (codex)    | Linear: Yes (its own tasks) — Notion/Slack/Postman: No | SPEC.md for learning tasks; reads/creates/tracks its own tasks via the Linear MCP |

### What is SPEC.md

At the `/lesson-start` step, Claude Code copies the Linear issue's description verbatim into `docs/lessons/XX-lesson-name/SPEC.md`. This is a **snapshot at a point in time** — the same role `ROADMAP.md` plays relative to Linear — not the source of truth. If the issue changes afterward, only Claude Code updates this file; the Coder agent does not edit it itself.

---

## Cheatsheet: assigning work to the Coder

One single mold, swap the tool name for whatever you're using that day. Always check out a dedicated branch first, never work on your `hien/...` branch:

```bash
# Default: codex
git checkout -b codex/nes-12-reference-solution
codex "Read AGENTS.md and docs/lessons/02-controllers/SPEC.md first.
       Implement per the spec. Only touch files in src/ and test/."

# Want an additional counter-view: agy (not a Coder, not wrapped by headroom — see the agy section above)
git checkout -b agy/nes-12-alt-solution
agy -p "Read AGENTS.md and docs/lessons/02-controllers/SPEC.md first.
        Implement per the spec. Only touch files in src/ and test/." \
  --model <model> --output-format text --mode accept-edits
```

Afterward, always open a dedicated PR for each branch — Claude Code local review → Codex GitHub App connector review (layer 1, automated, every PR) → user lead review + merge — never merge directly, never combine with your hands-on branch's PR.

---

## Shared context

Multiple agents can only collaborate when they all read from the same context source:

| Source          | Role                                                                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`AGENTS.md`** | The general contract. Every agent must read it before working. An open standard supported by codex/agy/Claude alike.                                                |
| **`CLAUDE.md`** | Instructions specific to Claude Code (workflow, role boundaries).                                                                                                   |
| **`docs/`**     | Long-lived context: roadmap, workflow, ADR, lesson notes.                                                                                                           |
| **serena MCP**  | Navigates code by **symbol** instead of reading whole files — find definitions, find references. Saves context and is more precise than grep as the codebase grows. |
| **`/graphify`** | Builds a knowledge graph from notes + code. Enabled once Phase 3 is reached, once there are enough notes for "cross-document questions" to be meaningful.           |

## File boundaries (avoiding agents stepping on each other)

| Path                                            | Who may edit it                                                                                 |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/**`, `test/**`                             | You (hands-on) · Coder agent (when explicitly assigned, dedicated branch)                       |
| `docs/lessons/**/SPEC.md`                       | Only Claude (a snapshot from Linear) — the Coder the the agent only reads it and never edits it |
| `docs/lessons/**`                               | Claude (writes) + you (adds personal notes)                                                     |
| `docs/adr/**`, `docs/workflow/**`               | Claude, with your approval via PR                                                               |
| `.github/**`, `.husky/**`, `docker-compose.yml` | Claude                                                                                          |
| `AGENTS.md`, `CLAUDE.md`                        | Claude, with your approval via PR                                                               |

> `.github/CODEOWNERS` also falls under `.github/**` → only **Claude Code** creates/edits it, committed with the `Co-authored-by: Claude <noreply@anthropic.com>` trailer. If the Coder agent (codex) generates a change under `.github/**`, it must be recreated through Claude Code before merge — it is not accepted as-is.

## Agent experiment log

Every time you assign work to an agent, log one line in `docs/lessons/_agent-log.md`: what task, which agent, what went well/badly. After the course you'll have real data to answer a very practical question in the field: **which work should be handed to AI, and which shouldn't.**

Every agent that changes docs must update both vi/en versions (`main` Vietnamese, `example/nestjs-training` English) — see [bilingual-policy.md](../bilingual-policy.md). GitLab only accepts the EN version from `example/nestjs-training`, never the Vietnamese one.
