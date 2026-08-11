# .hermes/ — Cấu trúc Hermes (tài liệu tham khảo)

> Thư mục này là **trạng thái làm việc của Hermes** trong project. Chỉ commit các file `.md` (tài liệu tham khảo, plan đã duyệt...); phần còn lại nằm trong `.gitignore` (`.hermes/*` + `!.hermes/*.md`).

## Bối cảnh: Hermes trong project này

Hermes đóng vai **orchestrator** — hợp đồng đầy đủ nằm ở `/.hermes.md` (root repo). Cấu hình của Hermes là **GLOBAL** ở `~/.hermes/` (KHÔNG nằm trong project). Thư mục này chỉ chứa:

- `README.md` — file này (tham khảo)
- `plans/` — kế hoạch làm việc (gitignored, không commit)

## Cấu trúc `~/.hermes/` (chuẩn docs)

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

**Quy tắc vàng:** secret → `.env`; setting → `config.yaml`. Dùng `hermes config set KEY VAL` (tự route đúng file) — **không sửa tay config.yaml** (sai indent là hỏng cả gateway).

## Config đã bật trên máy này (theo chuẩn docs)

| Key                         | Giá trị                                      | Ý nghĩa                                                        |
| --------------------------- | -------------------------------------------- | -------------------------------------------------------------- |
| `approvals.mode`            | `manual`                                     | Hỏi user trước mọi lệnh rủi ro — cổng kiểm duyệt               |
| `agent.verify_on_stop`      | `true`                                       | Từ chối kết thúc turn nếu sửa code mà thiếu bằng chứng verify  |
| `memory.write_approval`     | `true`                                       | Mọi ghi memory phải được user duyệt                            |
| `updates.pre_update_backup` | `quick`                                      | Snapshot config/auth/cron trước mỗi lần update                 |
| `checkpoints.enabled`       | `true`                                       | Snapshot filesystem trước thao tác destructive (rollback được) |
| `terminal.backend`          | `local`                                      | Chạy lệnh trên máy thật (không sandbox)                        |
| `model.default`             | `deepseek-v4-flash` (provider `opencode-go`) | Model chính hiện tại                                           |

## Context files — project này nạp file nào

Thứ tự ưu tiên (first-match-wins — **chỉ 1 file được nạp**):

```
.hermes.md → AGENTS.md → CLAUDE.md → .cursorrules
```

Repo này có cả 3 file `.hermes.md` / `AGENTS.md` / `CLAUDE.md` → Hermes nạp **`.hermes.md`** (phải là siêu tập — mục 0 bắt buộc đọc AGENTS.md trước khi dispatch).

## Lệnh hay dùng

```bash
hermes config get <key>        # xem giá trị một key
hermes config set <key> <val>  # đặt giá trị (tự route .env / config.yaml)
hermes config check            # kiểm tra thiếu option sau update
hermes doctor                  # health check toàn diện
hermes proxy status            # trạng thái proxy OpenAI-compatible (Nous Portal OAuth)
hermes setup tools             # bật/tắt toolset
```

## Attribution commit (xem chi tiết `.hermes.md` mục 9)

- Author = git config của user; kèm trailer `Co-authored-by: Hermes <model> <259144110+hermes-agent[bot]@users.noreply.github.com>` (bot GitHub `hermes-agent[bot]` — icon + link).
- Trailer phải có trong **cả commit message và PR body** (squash merge dùng title+body làm commit message).
- codex / Claude Code / opencode tự thêm trailer của chúng — không cần can thiệp.
