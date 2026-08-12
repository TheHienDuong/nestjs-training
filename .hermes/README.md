# .hermes/ — Hermes Structure (reference documentation)

> This directory is Hermes's **working state** within the project. Only commit `.md` files (reference documentation, approved plans...); all other content is covered by `.gitignore` (`.hermes/*` + `!.hermes/*.md`).

## Context: Hermes in this project

Hermes acts as the **orchestrator** — the full contract is located at `/.hermes.md` (repo root). Hermes's configuration is **GLOBAL** at `~/.hermes/` (NOT stored within the project). This directory only contains:
- `README.md` — this file (reference)
- `plans/` — work plans (gitignored, not committed)

## `~/.hermes/` Structure (standard docs)
```
~/.hermes/
├── config.yaml     # Settings (model, terminal, TTS, compression, etc.)
├── .env            # API keys and secrets
├── auth.json       # OAuth provider credentials (Nous Portal, etc.)
├── SOUL.md         # Primary agent identity (slot #1 in system prompt)
├── memories/       # Persistent memory (MEMORY.md, USER.md)
├── skills/         # Agent-created skills (managed via the skill_manage tool)
├── cron/           # Scheduled jobs
├── sessions/       # Gateway sessions
└── logs/           # Logs (errors.log, gateway.log — secrets are auto-redacted)
```

**Golden rule:** secrets → `.env`; settings → `config.yaml`. Use `hermes config set KEY VAL` (automatically routes to the correct file) — **do not manually edit `config.yaml`** (incorrect indentation will break the entire gateway).## Enabled config on this machine (per docs standard)

| Key                         | Value                                      | Meaning                                                        |
| --------------------------- | ------------------------------------------ | -------------------------------------------------------------- |
| `approvals.mode`            | `manual`                                   | Prompts user before any risky command — moderation checkpoint  |
| `agent.verify_on_stop`      | `true`                                     | Rejects ending the turn if code is modified without verification evidence |
| `memory.write_approval`     | `true`                                     | All memory writes require user approval                        |
| `updates.pre_update_backup` | `quick`                                    | Takes a quick snapshot of config/auth/cron before each update  |
| `checkpoints.enabled`       | `true`                                     | Snapshots the filesystem before destructive operations (rollback supported) |
| `terminal.backend`          | `local`                                    | Runs commands on the physical machine (no sandbox)             |
| `model.default`             | `deepseek-v4-flash` (provider `opencode-go`) | Current primary model                                           |

## Context files — which files this project loadsPriority order (first-match-wins — **only 1 file is loaded**):
```
.hermes.md → AGENTS.md → CLAUDE.md → .cursorrules
```
This repo contains all 3 files `.hermes.md` / `AGENTS.md` / `CLAUDE.md` → Hermes loads **`.hermes.md`** (must be a super agent — item 0 requires reading AGENTS.md before dispatch).

## Commonly used commands
```bash
hermes config get <key>        # view the value of a key
hermes config set <key> <val>  # set the value (automatically routes to .env / config.yaml)
hermes config check            # check for missing options after update
hermes doctor                  # full health check
hermes proxy status            # status of OpenAI-compatible proxy (Nous Portal OAuth)
hermes setup tools             # enable/disable toolset
```

## Attribution commit (see details in `.hermes.md` item 9)
- Author = user's git config; includes trailer `Co-authored-by: Hermes <model> <259144110+hermes-agent[bot]@users.noreply.github.com>` (GitHub bot `hermes-agent[bot]` — icon + link).
- The trailer must be present in **both the commit message and PR body** (squash merge uses the title + body as the commit message).
- codex / Claude Code / opencode automatically add their own trailers — no intervention needed.