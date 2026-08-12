# 🤖 AGENT MODEL — Multi-agent collaborative model

> This repo intentionally uses **multiple AI agents with clearly separated roles**, rather than a single agent handling all tasks.
> This is not just "for fun": role separation is the only way to preserve both learning value and review value.

## Core Principles

> **No agent both writes code and reviews its own code.**

The reason is exactly the same as why real teams do not let authors approve their own PRs: someone who has just built a solution is already "committed" to its underlying assumptions, so it is very hard for them to spot gaps in those very assumptions. With AI, this effect is even stronger — the model will tend to defend the output it just generated.

> **The second principle, which is especially important for learners:**
> **Agents do not perform hands-on work for you.** If AI writes code on your behalf, the only thing being trained is the AI.

---

## Role Assignment

There are only **2 roles**, not a fixed set of tools. The "Coder" role is **flexible** — any tool that fills this role follows the same standard, no need for separate rules for each tool. You primarily use Codex; occasionally swapping or adding other tools only requires renaming in the command, no need to relearn rules.

### 🎓 Claude Code — Mentor · PM · Reviewer (fixed)

| Does | Does not do |
| ---- | ----------- |
| ------------------------------------------------------------- | ---------------------------------- || Create & assign tasks on Linear, write full descriptions          | Write hands-on code for you        |
| Teach lessons, read the latest docs, provide examples, connect to prior knowledge | Merge PRs for you                  |
| Review PRs like a senior, run quizzes to check understanding                      | Automatically review code it generates itself |
| Write lesson notes, ADRs, sync with Notion/Slack                   |                                    |

**Why this role is fixed to Claude:** Its large context window lets it hold your entire roadmap, all notes, and your full learning history at the same time — exactly what a teacher needs. The PM role also requires **one** single source of truth for status tracking (see the MCP section below) — fixing one agent to this role is a requirement to avoid conflicts, not a preference.

### ⚙️ Coder — flexible role, follows the same standard no matter which tool is assigned to it

Takes issues labeled `agent:codex` (or the corresponding label if you assign it to a different tool). **The `SPEC.md` generated from the official Linear description is the spec** — vague specs produce vague output, which is also a lesson in writing good tickets.

Rules — apply to **any tool** holding the Coder role, not just codex:
- Work on a **dedicated branch**, named `<tool name>/nes-XX-...` (`codex/...`, `opencode/...`, or other tool names) — never commit directly to your `hien/...` lesson branch
- Read `AGENTS.md` (shared contract) + `docs/lessons/XX-*/SPEC.md` (the spec for the correct lesson) before starting work- Output **must always go through a PR** for Claude to review — do not merge directly

**Use primarily:** codex — the default tool for the Coder role.

```bash
git checkout -b codex/nes-12-reference-solution
codex "Read AGENTS.md first. Implement according to the spec in docs/lessons/02-controllers/SPEC.md. Only modify files in src/. Do not modify docs/ and .github/."
```

**Use occasionally (not required):** when you want to add an additional perspective for cross-comparison, assign the **same `SPEC.md`** to another tool (opencode, or any other CLI agent you have available) on that tool's dedicated branch — the above rules apply exactly the same, no separate documentation is needed for each tool. The goal is not to find "which tool is better" but to realize: the same spec can generate multiple valid designs, and **you** are the one who decides which one to choose.

**Most useful way to use when learning:** do the hands-on work yourself first, _only after you are fully finished_ check the Coder agent's "reference solution" and compare. The difference between the two versions is the most valuable lesson in that lesson.

---

## MCP: only Claude Code connects to PM/knowledge tools

**Principle: Claude Code is the single-writer for Linear/Notion/Slack/Postman.** The Coder role — regardless of which tool is currently filling that role — **does not** configure these MCP servers, even though technically many CLI agents (codex, opencode...) support adding their own dedicated MCP servers via their own config files.Rationale and considered options: see [ADR-0004](../adr/0004-mcp-single-writer-for-coder-agent.md). Summary: multiple agents writing to Linear/Notion/Slack simultaneously cause real race conditions (overlapping issue status updates, duplicate Slack notifications, Notion data overwrites) — this is exactly the "multiple sources of truth" problem that [ADR-0002](../adr/0002-linear-as-source-of-truth.md) avoided at the system layer, and is now being avoided again at the agent layer.

| Role                     | Connects to Linear/Notion/Slack/Postman? | How to receive spec                  |
| ----------------------- | -------------------------------- | ------------------------------- |
| Claude Code (PM)        | Yes — sole PM agent           | Reads issues directly via Linear MCP  |
| Coder (any tool) | No                            | Reads `docs/lessons/XX-*/SPEC.md` |

### What is SPEC.md

At the `/lesson-start` step, Claude Code copies the full Linear issue description into `docs/lessons/XX-ten-lesson/SPEC.md`. This is a **point-in-time snapshot** — similar to the role of `ROADMAP.md` for Linear — it is not the source of truth. If the issue is updated later, only Claude Code is allowed to update the file; Coder agents cannot modify it on their own.

---

## Cheatsheet: Assigning work to Coder

Use a single standard template, rename the tool based on what you are using that day. Always checkout a separate branch first, never work directly on your own `hien/...` branch:

```bash
# Default: codex
git checkout -b codex/nes-12-reference-solution
``````codex "Read AGENTS.md and docs/lessons/02-controllers/SPEC.md first.
       Implement according to the spec. Only modify files in src/ and test/."

# Want to add an alternative viewpoint: change branch prefix + use a different tool invocation command, exact same rules
git checkout -b opencode/nes-12-alt-solution
opencode run "Read AGENTS.md and docs/lessons/02-controllers/SPEC.md first.
              Implement according to the spec. Only modify files in src/ and test/."
```

Then always open a separate PR for each branch for Claude Code to review — do not merge directly, do not combine into a single PR with your own hands-on branch.

---

## Shared Context

Many agents can only collaborate when they all read the same context source:

| Source           | Role                                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`AGENTS.md`** | Common contract. All agents must read it before starting work. Open standard, supported by codex/opencode/Claude.                                                     |
| **`CLAUDE.md`** | Instructions specific to Claude Code (workflow, role boundaries).                                                                                            || **`docs/`**     | Long-term context: roadmap, workflow, ADR, lesson notes.                                                                                                 |
| **serena MCP**  | Navigate code by **symbol** instead of reading entire files — find definitions, find reference locations. Saves context and is more accurate than grep as the codebase grows. |
| **`/graphify`** | Build knowledge graph from notes + code. Enable after Phase 3, when there are enough notes for cross-document queries to be meaningful.                                  |

## File boundaries (prevent agents from stepping on each other's toes)

| Path                                       | Who may modify                                                        |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| `src/**`, `test/**`                        | You (hands-on) · Coder agent (when explicitly assigned, separate branch) |
| `docs/lessons/**/SPEC.md`                  | Only Claude (synced from Linear) — Coder agent is read-only, no edits allowed |
| `docs/lessons/**`                          | Claude (drafting) + you (add personal notes)                            |
| `docs/adr/**`, `docs/workflow/**`          | Claude (requires your review via PR)                                    || `.github/**`, `.husky/**`, `docker-compose.yml` | Claude                                                             |
| `AGENTS.md`, `CLAUDE.md`                        | Claude, with you reviewing the PR                                       |

## Agent Testing Log

Every time you assign a task to an agent, add a line to `docs/lessons/_agent-log.md`: what the task was, which agent was used, and what the good and bad results were, and in which areas. After the course, you will have real data to answer a very practical industry question: **what tasks should be delegated to AI, and what tasks should not.**