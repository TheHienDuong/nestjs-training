# ADR-0006: Dispatch via the Herdr PTY-Pane Bridge

- **Status:** Proposed
- **Date:** 2026-08-14
- **Decision maker:** Hien Duong

## Context

1. **2026-08-11** — `.hermes.md` (PR #12) specified that Hermes dispatches via exec/print-mode (`codex exec`, `claude -p`), forbidding proxy wrapping and forbidding writing a custom registry/daemon.
2. **2026-08-13** — the "Kanban team" L01/NES-2 run failed: macOS TCC blocked Hermes's python binary from reading `~/Documents` (denied `SystemPolicyDocumentsFolder`) → the task's `dir:` workspace failed with EPERM/ENOENT (recorded in `docs/lessons/_agent-log.md`). The workaround noted in that same log: _"Hermes drives CLIs inside a terminal context"_ — an agent running inside a terminal pane inherits the terminal app's TCC grant.
3. **2026-08-14** — real testing confirmed:
   - `pane wait-output --match` false positive: it matched the very command line echoed into the pane → returned "done" after 0.117s instead of 2s, with `matched_line` being the prompt line containing the sentinel string → terminal-based completion detection is unsafe.
   - The FS sentinel worked correctly: the agent wrote a JSON file, the poll picked it up after ~3s, and the payload contained a real `git rev-parse HEAD`.
   - Pane drift: the copilot pane died on its own between two snapshots (agent idle → empty shell) → a static label/pane id cannot be trusted.

## Decision

Hermes dispatches agents via the **Herdr PTY-pane bridge** as a second dispatch method (alongside exec/print-mode for small tasks):

1. **Kanban is the single task-state source** (native `hermes kanban` — create/claim/complete); do not write a separate custom registry/daemon.
2. **One task = one worktree + one ephemeral pane**: `herdr worktree create` (auto-creates a workspace/tab/pane with cwd = the worktree) → `herdr agent start <name> --kind <agent> --pane <id>` → the real agent CLI runs inside the pane, inheriting the TCC grant, visible and interruptible by a human.
3. **Completion is decided by the FS sentinel**: the agent must write `<worktree>/.hermes/runs/NES-XX.json` (a per-task nonce + `git rev-parse HEAD` + result); Hermes polls that file — **never parses terminal output**, `pane wait-output --match` with a string that appears in the prompt is forbidden, and `herdr agent wait` is never used as the done verdict (it does not track turns).
4. **Independent verify is mandatory**: RAW `git diff` + `pnpm verify`, a dedicated PR into main, Copilot CLI layer-1 review, **only the user merges** — ADR-0005 unchanged.
5. **Forbidden**: changing an agent's backend/model via a proxy without asking the user; writing a custom dispatch script/daemon/registry.

## Alternatives considered

| Option                                                    | Pros                                                                                                                                                                      | Cons                                                                                                                                             | Why not chosen                                         |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| Exec/print-mode (`codex exec`, `claude -p`)               | No new infrastructure needed; scriptable                                                                                                                                  | The agent runs headless — the human can't see it or intervene on approvals; still hits the TCC issue when the worker is a python binary          | Kept for small tasks, not the primary method           |
| Headless kanban worker (isolated workspace)               | Full state lifecycle, swarm graph                                                                                                                                         | **TCC blocks reading `~/Documents`** (a proven real failure on 2026-08-13); the worker is invisible                                              | Already a proven blocker; needs a root TCC grant first |
| **Herdr PTY-pane bridge** _(chosen)_                      | TCC-safe (the pane inherits the terminal's grant); visible to the human & manually approvable; ephemeral avoids context pollution; the FS sentinel avoids false positives | Manual guardrails needed (dynamic resolve, pane cap); claude/codex state is heuristic — only Hermes reports state accurately via lifecycle hooks | —                                                      |
| A custom registry/daemon dispatcher (`~/.hermes/agents/`) | High customization control                                                                                                                                                | Violates the 2026-08-11 decision; maintenance overhead; duplicates native kanban functionality                                                   | Already rejected on 2026-08-11, not being revived      |

## Consequences

**Positive**

- The agent runs inside a terminal pane → correctly routes around the TCC blocker that killed the 2026-08-13 kanban attempt.
- The human sees all activity and can intervene on approvals directly inside the pane.
- One ephemeral agent per task → no context pollution between lessons.

**Cost paid**

- Manual guardrails: dynamically resolve the target with `herdr agent list` before every dispatch (pane drift has actually happened), cap of 2-3 worker panes.
- The state of claude/codex/copilot is heuristic (regex + OSC title) — only Hermes reports state accurately (the `herdr-agent-state` plugin, real lifecycle hooks).
- Additional configuration needed: a root TCC grant for python@3.14 (a proper fix for future workers), and re-scoping the `rtk-rewrite` plugin (verify reads the RAW diff — a denylist for `git diff`/`cat`/`pnpm verify` + rewrite logging).

**Follow-up needed**

- Review `.hermes.md` §5.1/§6/§7 + the "Herdr bridge" section once this ADR is Accepted.
- Run one real E2E task through the hybrid flow (kanban claim → herdr exec → sentinel → PR → user merge) before scaling up to multiple workers.
- Package the `herdr-orchestration` skill once the E2E run passes.
