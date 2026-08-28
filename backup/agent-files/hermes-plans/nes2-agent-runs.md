# 🤖 Agent Run Log — NES-2 (L01)

> Log các lần chạy agent trong work plan kanban: **prompt đầy đủ đã gửi** + kết quả + verify headroom/rtk.
> File gitignored (`.hermes/plans/`) — dùng để trace lại từng lần giao việc.

---

## Run 1 — T6: codex đánh giá 3 đề xuất kỹ thuật

**Task:** `t_8d714b5e` · **Agent:** codex (deepseek-v4-pro) · **Ngày:** 2026-08-13

**Lệnh chạy (wrapped):**

```bash
headroom wrap codex --no-context-tool -- exec "PHAN TICH CHI DOC — KHONG sua file, khong commit. Repo NestJS branch L01. Doc package.json + tsconfig.json. Danh gia 3 de xuat: (1) tsconfig bat strict:true (hien chi strictNullChecks), (2) ts-jest version khong khop Jest 30 (kiem tra version hien tai), (3) script verify chay tuan tu nen tach song song. Moi de xuat: anh huong, rui ro, co pha pnpm verify khong, khuyen nghi ap dung ngay / hoan / bo. 8-12 dong tieng Viet."
```

**Kết quả (tóm tắt codex):**

1. `strict: true` — tăng phát hiện lỗi kiểu, hợp mục tiêu học; **rủi ro**: các strict check khác có thể phá build/test; 2 cờ đang ghi `false` vẫn không tự bật → **khuyến nghị HOÃN**, bật từng cờ theo lesson
2. ts-jest — lockfile cài Jest `30.4.2` + ts-jest `29.4.12` — major không đồng bộ → **khuyến nghị ÁP DỤNG NGAY** (đồng bộ hoặc hạ Jest về 29)
3. verify script — codex khẳng định "package.json **không có script verify**" → **❌ SAI**: script tồn tại ở dòng 23 (eslint --max-warnings=0 && prettier --check && jest && build) — đã chạy PASS. Nguyên nhân nghi: rtk read (intelligent filtering) lọc/tóm tắt làm mất phần `scripts` → agent kết luận sai. **Bài học: với file config nhỏ, đọc thẳng chính xác hơn rtk-filtered.**

**Verify headroom/rtk:**

- ✅ Headroom: baseline `api_requests: 0` → sau run `2`, `requests_compressed: 1` — codex đã đi qua proxy
- ⚠️ rtk `cli_filtering_tokens_avoided: None` — KHÔNG active vì tôi dùng `--no-context-tool` (bỏ flag này ở các run sau để rtk setup đầy đủ)
- ⚠️ Pitfall rtk distortion phát hiện (xem mục 3 ở trên)

**Trạng thái:** completed trên kanban (`hermes kanban complete t_8d714b5e`)

---

## Run 2 — Verify wrap 4 tool qua headroom (2026-08-13)

**Mục đích:** user yêu cầu kiểm tra claude/codex/opencode/copilot đều wrap qua headroom chính xác (chạy model đã config, không phức tạp).

| Tool        | Lệnh chạy                                                                       | Kết quả                                       | Headroom stats                   |
| ----------- | ------------------------------------------------------------------------------- | --------------------------------------------- | -------------------------------- |
| claude      | `headroom wrap claude -- -p "OK" --max-turns 1`                                 | ✅ `OK`                                       | api_requests 4→6, compressed 2→3 |
| codex       | `headroom wrap codex -- exec "OK"`                                              | ✅ `OK` (7,199 tokens)                        | (tính chung)                     |
| opencode    | `HEADROOM_OPENCODE_PLUGIN_PATH=/nonexistent headroom wrap opencode -- run "OK"` | ✅ `OK`                                       | (tính chung)                     |
| copilot     | `echo "Say OK" \| headroom wrap copilot -- --model gpt-5 -p "OK"`               | ❌ `400 The requested model is not supported` | —                                |
| copilot (2) | `... --model claude-sonnet-4-20250514 -p "OK"`                                  | ❌ `400 The requested model is not supported` | —                                |

**Kết luận:**

- ✅ claude / codex / opencode — wrap headroom HOẠT ĐỘNG (stats tăng, trả OK)
- ❌ copilot — wrap qua headroom bị chặn: cần **`headroom copilot-auth login`** (OAuth browser, user tự làm 1 lần). Copilot standalone (gh auth) vẫn chạy bình thường — wrap chỉ là lớp tối ưu chờ login
- ⚠️ rtk `cli_filtering_tokens_avoided: None` — rtk context tool được wrap setup (thấy "Setting up rtk for OpenCode") nhưng metric chỉ hiện khi agent thực sự chạy file/shell ops (prompt "OK" không kích hoạt) — sẽ thấy trên task thật

**Trạng thái:** hoàn tất verify; copilot chờ user login.

---

## Run 3 — T4: dịch note L01 → EN qua claude wrapped (2026-08-13)

**Task:** `t_e3f85dc5` · **Agent:** claude (headroom wrap) · **Model:** mặc định config

**Lệnh:**

```bash
cat docs/lessons/01-first-steps/README.md | headroom wrap claude -- -p "Translate this Vietnamese NestJS lesson note into professional technical English. Keep ALL markdown structure, tables, links, and code blocks exactly..." --max-turns 8
```

(lần đầu fail: `--max-turns 2` quá ít → "Reached max turns"; sửa thành 8)

**Kết quả:**

- ✅ Bản EN: 17,484 chars, **0 ký tự tiếng Việt** → `.hermes/plans/l01-readme.en.md` (attached t_e3f85dc5, 17,661 bytes)
- ✅ **Headroom: api_requests 6 → 34 · compressed 23 · tokens_removed 24,748** — task thật đi qua proxy + nén thật
- ⚠️ Chưa commit lên branch `example/nestjs-training` — chờ main PR merge (tránh làm 2 lần khi note thay đổi)

**Trạng thái:** completed.

---

## Run 4 — T9: copilot review layer-1 PR #27 qua headroom wrap (2026-08-13)

**Task:** `t_d6f1c290` · **Agent:** copilot (GitHub Copilot CLI, wrapped) · **PR:** [#27](https://github.com/TheHienDuong/nestjs-training/pull/27)

**Lệnh chạy (wrapped):**

```bash
gh pr diff 27 > /tmp/pr27.diff
cat /tmp/pr27.diff | headroom wrap copilot --subscription -- --model gpt-4.1 -p 'Review this PR (docs-only) as senior reviewer. Checklist: ... VERDICT: APPROVE hoac REQUEST_CHANGES; COMMENTS: ...'
```

**Kết quả:**

- ✅ **VERDICT: APPROVE** — "Markdown integrity: All files are valid, well-structured Markdown"
- Copilot chạy tool thật: `git --no-pager diff --name-only origin/main...HEAD | grep '^docs/'` (4 files) + read README.md
- Comment post: https://github.com/TheHienDuong/nestjs-training/pull/27#issuecomment-5288985459
- Duration 12s · Tokens ↑ 63.0k (45.3k cached)

**Verify headroom:**

- ⚠️ Lần 1 (BYOK): `--model claude-sonnet-4-20250514` → `400 The requested model is not supported` (stats không tăng)
- ✅ Lần 2 (`--subscription --model gpt-4.1`): chạy sạch, dùng gói Copilot subscription — KHÔNG cần BYOK key. **Bài học: copilot wrap dùng `--subscription` mode, không dùng BYOK provider.**

**Trạng thái:** completed. Chờ Claude review chính + CI xanh → squash merge (chỉ user merge).

---

## Run 4 — (trống)
