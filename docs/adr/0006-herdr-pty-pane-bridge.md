# ADR-0006: Dispatch qua Herdr PTY-pane bridge

- **Trạng thái:** Proposed
- **Ngày:** 2026-08-14
- **Người quyết định:** Hien Duong

## Bối cảnh

1. **2026-08-11** — `.hermes.md` (PR #12) quy định Hermes dispatch bằng exec/print-mode (`codex exec`, `claude -p`), cấm wrap proxy, cấm tự viết registry/daemon.
2. **2026-08-13** — lần chạy "Kanban team" L01/NES-2 fail: macOS TCC chặn binary python của Hermes đọc `~/Documents` (deny `SystemPolicyDocumentsFolder`) → task dùng `dir:` workspace fail EPERM/ENOENT (ghi trong `docs/lessons/_agent-log.md`). Workaround ghi trong chính log đó: _"Hermes điều khiển CLI trong terminal context"_ — agent chạy trong pane của terminal thừa hưởng TCC grant của terminal app.
3. **2026-08-14** — test thật xác nhận:
   - `pane wait-output --match` false positive: match vào chính dòng lệnh được echo ra pane → trả "done" sau 0.117s thay vì 2s, `matched_line` = dòng prompt chứa sentinel → terminal-based completion detection không an toàn.
   - FS sentinel chạy đúng: agent ghi file JSON, poll thấy sau ~3s, payload có `git rev-parse HEAD` thật.
   - Pane drift: pane copilot tự chết giữa 2 lần snapshot (agent idle → shell trống) → label/pane id tĩnh không đáng tin.

## Quyết định

Hermes dispatch agent qua **Herdr PTY-pane bridge** làm cách dispatch thứ hai (bên cạnh exec/print-mode cho task nhỏ):

1. **Kanban là task state duy nhất** (`hermes kanban` native — create/claim/complete); không tự viết registry/daemon riêng.
2. **Mỗi task = 1 worktree + 1 pane ephemeral**: `herdr worktree create` (tự tạo workspace/tab/pane với cwd = worktree) → `herdr agent start <name> --kind <agent> --pane <id>` → agent CLI thật chạy trong pane, thừa hưởng TCC grant, người thấy và can thiệp được.
3. **Completion phán quyết bằng FS sentinel**: agent bắt buộc ghi `<worktree>/.hermes/runs/NES-XX.json` (nonce theo task + `git rev-parse HEAD` + kết quả); Hermes poll file — **không parse terminal output**, cấm `pane wait-output --match` với chuỗi có trong prompt, không dùng `herdr agent wait` làm phán quyết done (không track turns).
4. **Verify độc lập bắt buộc**: `git diff` RAW + `pnpm verify`, PR riêng vào main, Copilot CLI review lớp 1, **chỉ user merge** — ADR-0005 giữ nguyên.
5. **Cấm**: đổi backend/model của agent qua proxy mà không hỏi user; tự viết script/daemon/registry dispatch riêng.

## Các phương án đã cân nhắc

| Phương án                                            | Ưu                                                                                                                                           | Nhược                                                                                                                          | Vì sao không chọn                              |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| Exec/print-mode (`codex exec`, `claude -p`)          | Không cần hạ tầng mới; script hóa được                                                                                                       | Agent chạy headless — người không thấy, không can thiệp approval; vẫn dính TCC khi worker là binary python                     | Giữ cho task nhỏ, không phải cách chính        |
| Kanban worker headless (isolated workspace)          | State lifecycle đầy đủ, swarm graph                                                                                                          | **TCC chặn đọc `~/Documents`** (đã fail thật 2026-08-13); worker vô hình                                                       | Blocker đã chứng minh; cần TCC grant gốc trước |
| **Herdr PTY-pane bridge** _(đã chọn)_                | TCC-safe (pane thừa hưởng grant terminal); người thấy & bấm approve tay; ephemeral chống context pollution; FS sentinel chống false positive | Guardrail thủ công (resolve động, cap pane); state của claude/codex là heuristic — chỉ Hermes báo chính xác qua lifecycle hook | —                                              |
| Registry/daemon dispatch riêng (`~/.hermes/agents/`) | Kiểm soát tùy biến cao                                                                                                                       | Vi phạm quyết định 2026-08-11; tốn bảo trì; trùng chức năng kanban native                                                      | Đã bị loại 2026-08-11, không hồi sinh          |

## Hệ quả

**Tích cực**

- Agent chạy trong pane terminal → đi vòng đúng blocker TCC đã giết lần thử kanban 2026-08-13.
- Người thấy toàn bộ hoạt động và can thiệp approval trực tiếp trong pane.
- Ephemeral agent per task → hết context pollution giữa các lesson.

**Cái giá phải trả**

- Guardrail thủ công: resolve target động bằng `herdr agent list` trước mỗi dispatch (pane drift đã xảy ra thật), cap 2–3 worker pane.
- State của claude/codex/copilot là heuristic (regex + OSC title) — chỉ Hermes báo state chính xác (plugin `herdr-agent-state`, lifecycle hook thật).
- Cần cấu hình thêm: TCC grant gốc cho python@3.14 (fix gốc cho worker tương lai), plugin `rtk-rewrite` scope lại (verify đọc diff RAW — denylist `git diff`/`cat`/`pnpm verify` + log rewrite).

**Cần làm tiếp**

- Rà soát `.hermes.md` §5.1/§6/§7 + mục "Herdr bridge" sau khi ADR này Accepted.
- Chạy 1 task E2E thật qua luồng hybrid (kanban claim → herdr exec → sentinel → PR → user merge) trước khi nhân rộng nhiều worker.
- Đóng gói skill `herdr-orchestration` sau khi E2E pass.
