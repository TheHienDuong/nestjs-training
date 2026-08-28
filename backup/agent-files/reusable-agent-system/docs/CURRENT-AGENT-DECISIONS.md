# Current Agent Decisions

This file is an explicit current-state overlay for the archived historical
rules. It is not a replacement for the source documents until those documents
are reconciled in a dedicated governance change.

## Canonical decisions

- `agy` is the official counter-view / second-opinion agent.
- `opencode` is not the active counter-view agent.
- Hermes is the orchestrator and verifier, not the final reviewer or merger.
- Claude Code is Mentor/PM and may perform local review only when it did not
  author the change.
- Codex is the default Coder and does not review code.
- Copilot is the automated layer-1 reviewer/gatekeeper according to the active
  review workflow.
- The user is the sole lead reviewer and the only person who merges.

## Reconciliation required before reuse

Search the restored rule files for `opencode` and update active routing,
branch-name examples, and role tables to `agy` before using them as live agent
instructions. Do not rewrite historical ADR/plan records merely to remove old
references; preserve them as history and add a new superseding decision when
needed.
