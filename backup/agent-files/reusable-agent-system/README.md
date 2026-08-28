# Reusable Agent System Backup

This directory is a version-controlled snapshot of the project files that define
how agents understand and operate in the NestJS training repository.

## Included

- Root contracts: `.hermes.md`, `AGENTS.md`, and `CLAUDE.md`.
- Project Claude Code skills under `.claude/skills/`.
- Safe Codex project MCP configuration: `.codex/config.toml`.
- Hermes project reference: `.hermes/README.md`.
- Agent/workflow rules under `docs/workflow/`.
- Bilingual policy and agent-related ADRs.

The source-relative paths are preserved below this directory so that a future
restore can be reviewed and applied deliberately rather than copied blindly.

## Current agent decision

`agy` is the official counter-view agent, as decided by the user. Some included
files are historical snapshots and still contain older `opencode` references.
Those historical references are intentionally preserved. Before applying this
backup to another project, use `docs/CURRENT-AGENT-DECISIONS.md` as the current
override and reconcile the source rules first.

## Portability classification

### Portable with review

- `AGENTS.md` patterns for agent boundaries, verification, and PR discipline.
- `.claude/skills/*.md` workflow patterns.
- `docs/workflow/AGENT-MODEL.md`, `REVIEW-MODEL.md`, and `WORKFLOW.md` concepts.
- ADR reasoning about source of truth, MCP write boundaries, and review separation.

### Project-specific

- NestJS lesson workflow and Task Management API context.
- Linear identifiers and branch conventions.
- GitHub/GitLab bilingual mirror policy.
- `.codex/config.toml` Linear MCP URL and repository-specific paths.
- Absolute paths, user names, repository names, and model choices.

Do not copy project-specific values into another project without changing them.

## Intentionally excluded

Never commit or restore these from this backup:

- `.env`, OAuth tokens, API keys, or credential files.
- `.claude/settings.local.json`.
- `.claude/.headroom_wrap_marker.json`.
- `.codex/hooks.json`.
- `.hermes/runs/`, `.hermes/tmp/`, caches, logs, PIDs, or generated output.

## Integrity check

From the repository root:

```bash
cd backup/agent-files/reusable-agent-system
shasum -a 256 -c MANIFEST.sha256
```
