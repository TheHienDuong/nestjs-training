# 🤖 AGENT MODEL — Multi-agent collaboration model

> This repository intentionally uses **multiple AI agents with distinct roles** instead of one agent doing everything.
> This is not "just for fun": separating roles is the only way to preserve learning and review value.

## Core principles

> **No agent may both write code and review its own code.**

The reason is exactly why real teams do not let authors approve their own PRs: someone who has just written a solution is already "committed" to its assumptions, making flaws in those assumptions difficult to see. With AI, the effect is stronger — the model tends to defend the output it just generated.

The second principle, important for the learner:

> **Agents do not do the hands-on work for the learner.** If AI writes the code for you, the only thing being trained is the AI.

---

## Roles

### 🎓 Claude Code — Mentor · PM · Reviewer

| Does                                                                   | Does not                        |
| ---------------------------------------------------------------------- | ------------------------------- |
| Create and break down Linear tasks with complete descriptions          | Write hands-on code for you     |
| Teach, read the latest docs, provide examples, connect prior knowledge | Merge PRs for you               |
| Review PRs like a senior and quiz understanding                        | Review code it generated itself |
| Write lesson notes and ADRs, synchronize Notion/Slack                  |                                 |

**Why Claude holds the mentor role:** its large context window lets it understand the roadmap + all notes + your learning history at once — exactly what a teacher needs.

### ⚙️ codex — Coder

Receives issues labeled `agent:codex`. **The Linear description is the spec** — if the spec is vague, the output will be vague, which is also a lesson in writing good tickets.

```bash
# Assign work: open a terminal in the repository directory and check out a separate branch first
git checkout -b codex/nes-12-reference-solution
codex "Read AGENTS.md first. Implement according to the spec in docs/lessons/02-controllers/SPEC.md.
       Only edit files in src/. Do not edit docs/ or .github/."
```

Mandatory constraints:

- Work on a **separate branch** (`codex/...`), never commit directly to your lesson branch
- Output **always goes through a PR** for Claude to review
- Must read `AGENTS.md` first — this file is the shared contract for every agent

**The most useful learning approach:** complete the hands-on work yourself first, and _only afterward_ view and compare codex's "reference solution". The differences between the two versions are the most valuable lesson.

### 🧪 opencode — Comparison agent

Use from Phase 7 onward. Assign **the same task** to codex and opencode, then compare how the two models approach it. The goal is not to find "which model is better" but to recognize that one spec can produce multiple valid designs, and **you** decide which one to choose.

---

## Shared context

Multiple agents can collaborate only when they read the same context source:

| Source          | Role                                                                                                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`AGENTS.md`** | Shared contract. Every agent must read it before working. An open standard supported by codex, opencode, and Claude.                                              |
| **`CLAUDE.md`** | Instructions specific to Claude Code (workflow and role boundaries).                                                                                              |
| **`docs/`**     | Long-term context: roadmap, workflow, ADRs, and lesson notes.                                                                                                     |
| **serena MCP**  | Navigate code by **symbol** instead of reading entire files — find definitions and references. Saves context and is more precise than grep as the codebase grows. |
| **`/graphify`** | Build a knowledge graph from notes + code. Enable it after Phase 3, when there are enough notes for cross-document queries to be meaningful.                      |

## File boundaries (prevent agents from interfering with one another)

| Path                                            | Who may edit                                      |
| ----------------------------------------------- | ------------------------------------------------- |
| `src/**`, `test/**`                             | You (hands-on) · codex (when explicitly assigned) |
| `docs/lessons/**`                               | Claude (drafts) + you (add personal notes)        |
| `docs/adr/**`, `docs/workflow/**`               | Claude, with your review through a PR             |
| `.github/**`, `.husky/**`, `docker-compose.yml` | Claude                                            |
| `AGENTS.md`, `CLAUDE.md`                        | Claude, with your review through a PR             |

## Agent experiment log

Whenever work is assigned to an agent, record one line in `docs/lessons/_agent-log.md`: what the task was, which agent handled it, and where the result was good or poor. After the course, you will have real data to answer a practical professional question: **which work should be assigned to AI and which should not.**
