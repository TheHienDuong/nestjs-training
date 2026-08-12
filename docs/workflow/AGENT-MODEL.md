# 🤖 AGENT MODEL — Multi-Agent Collaborative Model

> This repo intentionally uses **multiple AI agents with clearly separated roles**, instead of one agent handling all tasks.
> This is not just "for fun": role separation is the only way to preserve both learning value and review value.

## Core Principles

> **No agent should write code and review its own code at the same time.**

The reason is exactly the same as why real teams don't let authors approve their own pull requests: the person who just built a solution has already "committed" to its underlying assumptions, making it very hard to spot flaws in those very assumptions. With AI, this effect is even stronger — models tend to defend the output they just generated.

The second principle, which is especially important for learners:

> **Agents do not do hands-on work for you.** If AI writes code for you, the only thing being trained is the AI.

---

## Role Division

There are only **2 roles**, not a fixed list of tools. The "Coder" role is **flexible** — whichever tool fills this role follows the same standard, with no separate rules for each individual tool. You will mostly use codex; switching to or adding other tools only requires changing the name in the command, no need to relearn rules.

### 🎓 Claude Code — Mentor · PM · Reviewer (fixed)

| Responsibilities                                                                           | Does not do                     |
| ------------------------------------------------------------------------------------------ | ------------------------------- |
| Create and assign tasks on Linear, write full task descriptions                            | Write hands-on code for you     |
| Teach lessons, read the latest documentation, provide examples, connect to prior knowledge | Merge pull requests for you     |
| Review PRs like a senior engineer, quiz to assess understanding                            | Review code it generated itself |
| Write lesson notes, ADRs, sync with Notion/Slack                                           |                                 |

**Why this role is fixed to Claude:** its large context window allows it to hold your entire roadmap, all notes, and your full learning history at the same time — exactly what a teacher needs. The PM role also requires **a single** source of truth for status tracking (see the MCP section below) — fixing one agent in this role is a requirement to avoid conflicts, not a preference.

### ⚙️ Coder — flexible role, follows the same standard no matter which tool fills it

Receives issues labeled `agent:codex` (or the corresponding label if you assign the role to another tool). **`SPEC.md` generated from the main Linear issue description is the official spec** — vague specs produce vague output, which is also a lesson in writing good tickets.

Rules — apply to **any tool** currently holding the Coder role, not just codex:

- Work on a **dedicated branch**, named `<tool name>/nes-XX-...` (`codex/...`, `opencode/...`, or any other tool name) — never commit directly to your personal `hien/...` lesson branch
- Read `AGENTS.md` (shared contract) + `docs/lessons/XX-*/SPEC.md` (spec for the relevant lesson) before starting work
- All output **must go through a PR** for Claude to review — no direct merges

**Primary tool:** codex — the default tool for the Coder role.

```bash
git checkout -b codex/nes-12-reference-solution
codex "Read AGENTS.md first. Implement per the spec in docs/lessons/02-controllers/SPEC.md.
       Only edit files in src/. Do not edit docs/ or .github/."
```

**Occasional use (not required):** when you want an additional perspective for comparison, assign the **same `SPEC.md`** to another tool (opencode, or any CLI agent you have available) on that tool's dedicated branch — the rules above apply exactly the same, no separate documentation needed for each tool. The goal is not to find a "better tool" but to realize: the same spec can generate multiple valid designs, and **you** are the one who decides which one to use.

**Most useful way to use this when learning:** do the hands-on work yourself first, _finish it completely_ before looking at the Coder agent's "reference solution" and comparing. The difference between the two versions is the most valuable lesson in that lesson.

---

## MCP: Only Claude Code connects to PM/knowledge tools

**Principle: Claude Code is the single-writer for Linear/Notion/Slack/Postman.** The Coder role — no matter which tool is filling it — **does not** configure these MCP servers, even though technically many CLI agents (codex, opencode...) support adding their own MCP servers via their own config files.

Reasons and considered alternatives: see [ADR-0004](../adr/0004-mcp-single-writer-for-coder-agent.md). Summary: multiple agents writing to Linear/Notion/Slack creates real race conditions (overlapping issue status changes, duplicate Slack notifications, overwritten Notion entries) — this is exactly the "multiple sources of truth" problem that [ADR-0002](../adr/0002-linear-as-source-of-truth.md) avoided at the system layer, and now avoids at the agent layer.

| Role             | Connects to Linear/Notion/Slack/Postman? | How to receive spec                  |
| ---------------- | ---------------------------------------- | ------------------------------------ |
| Claude Code (PM) | Yes — the only PM agent                  | Reads issues directly via Linear MCP |
| Coder (any tool) | No                                       | Reads `docs/lessons/XX-*/SPEC.md`    |

### What is SPEC.md

At the `/lesson-start` step, Claude Code copies the original Linear issue description into `docs/lessons/XX-ten-lesson/SPEC.md`. This is a **point-in-time snapshot** — similar to the role of `ROADMAP.md` for Linear — not the source of truth. If the issue changes later, only Claude Code is allowed to update the file; Coder agents cannot modify it on their own.

---

## Cheatsheet: Assigning work to the Coder

One single template, just rename the tool to whatever you are using that day. Always checkout a dedicated branch first, never work on your personal `hien/...` branch:

```bash
# Default: codex
git checkout -b codex/nes-12-reference-solution
codex "Read AGENTS.md and docs/lessons/02-controllers/SPEC.md first.
       Implement per the spec. Only modify files in src/ and test/."

# To add a counterargument perspective: change the branch prefix + use a different tool call command, the rules are exactly the same
git checkout -b opencode/nes-12-alt-solution
opencode run "Read AGENTS.md and docs/lessons/02-controllers/SPEC.md first.
              Implement per the spec. Only modify files in src/ and test/."
```

Then always open a separate PR for each branch for Claude Code to review — no direct merges, do not combine PRs with your hands-on branch.

---

## Shared Context

Multiple agents can only collaborate when they all read the same context source:

| Source          | Role                                                                                                                                                                          |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`AGENTS.md`** | Shared contract. All agents must read this before starting work. Open standard, supported by codex, opencode, and Claude.                                                     |
| **`CLAUDE.md`** | Instructions specific to Claude Code (workflow, role boundaries).                                                                                                             |
| **`docs/`**     | Long-term context: roadmap, workflow, ADRs, lesson notes.                                                                                                                     |
| **serena MCP**  | Navigate code by **symbol** instead of reading entire files — find definitions, find reference locations. Saves context and is more accurate than grep as the codebase grows. |
| **`/graphify`** | Build knowledge graph from notes + code. Enable after Phase 3, when you have enough notes for cross-document queries to be meaningful.                                        |

## File Boundaries (prevent agents from stepping on each other's work)

| Path                                            | Who can modify                                                                |
| ----------------------------------------------- | ----------------------------------------------------------------------------- |
| `src/**`, `test/**`                             | You (hands-on) · Coder agent (when explicitly assigned, on dedicated branch)  |
| `docs/lessons/**/SPEC.md`                       | Only Claude (snapshot from Linear) — Coder agents only read, no modifications |
| `docs/lessons/**`                               | Claude (draft) + you (add personal notes)                                     |
| `docs/adr/**`, `docs/workflow/**`               | Claude, with your approval via PR                                             |
| `.github/**`, `.husky/**`, `docker-compose.yml` | Claude                                                                        |
| `AGENTS.md`, `CLAUDE.md`                        | Claude, with your approval via PR                                             |

Any agent changing docs must update both vi/en versions (`main` in Vietnamese, `example/nestjs-training` in English) — see [bilingual-policy.md](../bilingual-policy.md). GitLab only accepts the EN version from `example/nestjs-training`, never the Vietnamese one.

## Agent Experiment Log

Every time you assign work to an agent, log one line to `docs/lessons/_agent-log.md`: what the task was, which agent was used, and what the good/bad results were. After the course, you will have real data to answer the very practical industry question: **what tasks should be delegated to AI, and what shouldn't.**

---

<!-- CO-OP TRANSLATOR DISCLAIMER START -->

**Disclaimer**:
This document has been translated using AI translation service [Co-op Translator](https://github.com/Azure/co-op-translator). While we strive for accuracy, please be aware that automated translations may contain errors or inaccuracies. The original document in its native language should be considered the authoritative source. For critical information, professional human translation is recommended. We are not liable for any misunderstandings or misinterpretations arising from the use of this translation.
<!-- CO-OP TRANSLATOR DISCLAIMER END -->
