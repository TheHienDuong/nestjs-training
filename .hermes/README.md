# .hermes/ — Hermes Structure (Reference Document)

> This directory is Hermes' **working state** in the project. Only commit `.md` files (reference documents, approved plans...); the rest is included in `.gitignore` (`.hermes/*` + `!.hermes/*.md`).

## Context: Hermes in this Project

Hermes acts as the **orchestrator** — its full contract is located at `/.hermes.md` (repo root). Hermes' configuration is **GLOBAL** at `~/.hermes/` (NOT stored in the project). This directory only contains:

- `README.md` — this file (reference)
- `plans/` — work plans (gitignored, not committed)

## Structure of `~/.hermes/` (standard docs)

```
~/.hermes/
├── config.yaml     # Settings (model, terminal, TTS, compression, etc.)
├── .env            # API keys and secrets
├── auth.json       # OAuth provider credentials (Nous Portal, etc.)
├── SOUL.md         # Primary agent identity (slot #1 in system prompt)
├── memories/       # Persistent memory (MEMORY.md, USER.md)
├── skills/         # Agent-created skills (managed via skill_manage tool)
├── cron/           # Scheduled jobs
├── sessions/       # Gateway sessions
└── logs/           # Logs (errors.log, gateway.log — secrets auto-redacted)
```

**Golden rule:** secrets go in `.env`; settings go in `config.yaml`. Use `hermes config set KEY VAL` (automatically routes to the correct file) — **do not manually edit `config.yaml`** (incorrect indentation will break the entire gateway).

## Enabled config on this machine (per standard docs)

| Key                         | Value                                      | Meaning                                                        |
| --------------------------- | -------------------------------------------- | -------------------------------------------------------------- |
| `approvals.mode`            | `manual`                                     | Ask the user before any risky command — approval gate               |
| `agent.verify_on_stop`      | `true`                                       | Reject ending the turn if code is modified without verification proof  |
| `memory.write_approval`     | `true`                                       | All memory writes must be approved by the user                            |
| `updates.pre_update_backup` | `quick`                                      | Snapshot config/auth/cron before every update                 |
| `checkpoints.enabled`       | `true`                                       | Snapshot filesystem before destructive operations (rollback supported) |
| `terminal.backend`          | `local`                                      | Run commands on the real machine (no sandbox)                        |
| `model.default`             | `deepseek-v4-flash` (provider `opencode-go`) | Current main model                                           |

## Context files — which files this project loads

Priority order (first-match-wins — **only 1 file is loaded**):

```
.hermes.md → AGENTS.md → CLAUDE.md → .cursorrules
```

This repo has all 3 files `.hermes.md` / `AGENTS.md` / `CLAUDE.md` → Hermes loads **`.hermes.md`** (must be the superset — section 0 requires reading AGENTS.md before dispatching).

## Common commands

```bash
hermes config get <key>        # Get the value of a key
hermes config set <key> <val>  # Set the value (automatically routes to .env / config.yaml)
hermes config check            # Check for missing options after update
hermes doctor                  # Comprehensive health check
hermes proxy status            # Status of OpenAI-compatible proxy (Nous Portal OAuth)
hermes setup tools             # Enable/disable toolset
```

## Attribution commit (see details in `.hermes.md` section 9)

- Author = user's git config; includes trailer `Co-authored-by: Hermes <model> <259144110+hermes-agent[bot]@users.noreply.github.com>` (GitHub bot `hermes-agent[bot]` — icon + link).
- Trailer must be present in **both commit message and PR body** (squash merge uses title+body as the commit message).
- codex / Claude Code / opencode automatically add their own trailers — no intervention needed.

---

<!-- CO-OP TRANSLATOR DISCLAIMER START -->
**Disclaimer**:
This document has been translated using AI translation service [Co-op Translator](https://github.com/Azure/co-op-translator). While we strive for accuracy, please be aware that automated translations may contain errors or inaccuracies. The original document in its native language should be considered the authoritative source. For critical information, professional human translation is recommended. We are not liable for any misunderstandings or misinterpretations arising from the use of this translation.
<!-- CO-OP TRANSLATOR DISCLAIMER END -->