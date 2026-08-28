# Plan: GitLab English Mirror — Sync GitHub → GitLab (branch `example/nestjs-training`)

> **For Hermes:** plan này triển khai theo từng task; tool chính là `scripts/translate_english.py` (script Python, không cần dependency ngoài stdlib). Không cần subagent.

**Goal:** Đưa toàn bộ thay đổi mới từ `origin/main` (GitHub — nơi làm việc chính, tiếng Việt) sang `gitlab` remote, branch `example/nestjs-training`, tuân thủ rule công ty: **English-only tuyệt đối** (nội dung file, comment, tên file, commit message), commit author = `hienduong-agility`. Đồng thời xây tool chuyển đổi tiếng Việt → tiếng Anh dùng được lặp lại sau mỗi lesson.

**Architecture:** Script dịch thuật `scripts/translate_english.py` gọi OpenAI-compatible endpoint (`hermes proxy` → Nous Portal, sẵn sàng, không cần API key riêng; override được bằng `LLM_BASE_URL`/`LLM_API_KEY` cho CI sau này). Sync theo cơ chế **delta**: diff `origin/main` vs `gitlab/example/nestjs-training` → chỉ dịch phần thay đổi → commit English (author `hienduong-agility`) → push.

**Tech stack:** Python 3 stdlib (`/opt/homebrew/bin/python3.13` — máy có sẵn), urllib (không cần pip install), git CLI, `hermes proxy` làm backend LLM.

---

## Hiện trạng (đã khảo sát 2026-08-11)

| Hạng mục                                      | Kết quả                                                                                                                                                                                                                                                                                 |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitLab đã có branch `example/nestjs-training` | ✅ CÓ — bản English cũ (base commit `3877e5c` + merge `1d71730`), đã đổi tên ADR-0001→`0001-choose-prisma-as-orm.md`, 0002→`linear-as-source-of-truth`, 0003→`trunk-based-one-lesson-one-pr`                                                                                            |
| Bản GitLab cũ còn tiếng Việt                  | ⚠️ 2 file: `docs/ROADMAP.md`, `docs/lessons/00-setup/README.md` (lần sync trước bỏ sót)                                                                                                                                                                                                 |
| Delta origin/main → gitlab                    | ~40 entry: M (đổi nội dung), D (thiếu trên gitlab: `.hermes.md`, `.hermes/README.md`, `.nvmrc`, `Makefile`, `docs/workflow/WORKFLOW.md`, `docs/templates/lesson-note.md`, `docs/lessons/01-first-steps/README.md`, **ADR-0004, ADR-0005** — chưa có bản English), rename 0001/0002/0003 |
| Tiếng Việt trong repo origin/main             | 31 file, ~1336 dòng — **toàn bộ là docs/config/markdown**; `src/**` code SẠCH (không comment tiếng Việt)                                                                                                                                                                                |
| Tên file tiếng Việt (có dấu)                  | 0 file. NHƯNG 2 tên file mới thiếu bản English chứa từ Việt không dấu: `0004-mcp-single-writer-cho-coder-agent.md`, `0005-coder-agent-mo-pr-rieng-vao-main.md`                                                                                                                          |
| Backend dịch                                  | `hermes proxy` → Nous Portal READY (OpenAI-compatible, local)                                                                                                                                                                                                                           |
| Identity                                      | git config global: `Hien The Duong <hien.duong@asnet.com.vn>`; GitLab URL: `git@gitlab.asoft-python.com:hien.duong/nodejs-training.git` (user `hien.duong`)                                                                                                                             |
| Branch local                                  | `change/english-gitlab` + `example/nestjs-training` đã tồn tại (lần sync trước)                                                                                                                                                                                                         |

---

## Công cụ: `scripts/translate_english.py` (Problem 2 — tool chuyển đổi)

Giao diện CLI:

```bash
python3 scripts/translate_english.py --scan            # rà tiếng Việt: nội dung + tên file (exit 0 = sạch)
python3 scripts/translate_english.py --translate <files...>   # dịch file ra stdout/tệp (dry-run an toàn)
python3 scripts/translate_english.py --rename <map.json>      # đổi tên + cập nhật mọi tham chiếu
python3 scripts/translate_english.py --sync           # end-to-end: delta → dịch → commit → push gitlab
```

Cấu trúc module (1 file, ~300 dòng, stdlib):

1. **`--scan`** — regex tiếng Việt `[\u00C0-\u1EF9]` trên: (a) nội dung các file text (`.md .ts .js .json .yml .yaml .mjs .sh .env .example .txt`), (b) tên file (bắt cả từ Việt không dấu qua danh sách từ khóa: `cho, lam, mot, rieng, nguon, su that, mo, chon...` + báo cáo). Output: danh sách file + số dòng. Exit 0 = không còn tiếng Việt.
2. **`--translate`** — gọi LLM qua `LLM_BASE_URL` (mặc định `hermes proxy`, lấy từ `hermes proxy status`), `LLM_MODEL` (mặc định `deepseek-v4-flash`), `LLM_API_KEY` (mặc định rỗng — proxy không cần). Prompt dịch:
   > "Translate the following text from Vietnamese to English. Preserve markdown structure, code blocks, URLs, file paths, technical terms (provider, guard, interceptor, pipe, DI, decorator...). Output only the translated text. Do not translate code identifiers or string values inside code fences.\n\n{text}"
   - File `.md`/`.yml`/`.json`/`.env`: dịch toàn bộ nội dung (giữ key YAML/JSON, giá trị comment dịch).
   - File code `.ts`/`.js`/`.sh`: chỉ dịch COMMENT (giữ code y nguyên) — chuẩn bị cho tương lai khi lesson thêm comment tiếng Việt vào src/.
   - Chunk theo dòng nếu file > ~3000 ký tự (tránh timeout).
3. **`--rename <map.json>`** — `{"old_path": "new_path"}`: `git mv` + quét toàn repo thay mọi tham chiếu (link markdown `](old)`, path trong docs) bằng `new_path`. Kèm `scripts/rename_map.json` mặc định.
4. **`--sync`** — thuật toán:
   a. `git fetch origin main gitlab` → baseline = `gitlab/example/nestjs-training` (đã fetch sẵn)
   b. `git diff --name-status origin/main gitlab/example/nestjs-training` → phân loại: M (dịch lại nếu còn VN), D (file mới cần tạo English), R (rename map)
   c. Tạo working tree English: copy origin/main → dịch các file cần → áp rename map (ADR-0004/0005 + tham chiếu trong `docs/adr/README.md`, `AGENT-MODEL.md`, `AGENTS.md`, `WORKFLOW.md`) → xử lý 2 file cũ còn VN (ROADMAP, 00-setup)
   d. `git diff --no-index` so sánh với gitlab branch (dry-run trước, `--commit` mới commit)
   e. Commit: message English (lấy subject của commit origin gốc → dịch nếu cần), author `hienduong-agility <hien.duong@asnet.com.vn>` (override per-commit bằng `git -c`)
   f. Push: `git push gitlab HEAD:example/nestjs-training`
5. **Dry-run mặc định**: mọi chế độ ghi (commit/push) cần cờ `--commit` — an toàn, review diff trước.

## Bước thực hiện

### Task 1: Viết `scripts/translate_english.py` (scan + translate)

- File: `scripts/translate_english.py`
- Test: `--scan` trên origin/main → khớp kết quả khảo sát (31 file, ~1336 dòng)
- Test dịch thử 1 file mẫu (vd `docs/templates/retro.md`) → review chất lượng bản dịch

### Task 2: Viết `scripts/rename_map.json`

- `docs/adr/0004-mcp-single-writer-cho-coder-agent.md` → `0004-mcp-single-writer-for-coder-agent.md`
- `docs/adr/0005-coder-agent-mo-pr-rieng-vao-main.md` → `0005-coder-agent-opens-pr-to-main.md`
- Kiểm tra mọi tham chiếu 2 tên cũ trong repo (grep) → liệt kê các file cần update

### Task 3: Bootstrap sync (chạy thử)

- `--sync` (dry-run) → review diff → `--commit` → push `gitlab example/nestjs-training`
- Expected: ~15-20 file được dịch/tạo mới, ~2 file retranslate, rename 2 ADR

### Task 4: Verify toàn diện

- `--scan` trên branch gitlab (sau push): **0 file tiếng Việt, 0 tên file tiếng Việt**
- `git log gitlab/example/nestjs-training -1` → author `hienduong-agility`, message English
- Kiểm tra link nội bộ: `docs/adr/README.md` trỏ đúng 5 ADR mới, cross-ref ADR-0005 trong AGENT-MODEL/AGENTS
- `pnpm verify` trên bản English (code không đổi → phải pass)
- Kiểm tra trên GitLab web: commit hiện dưới account `hienduong-agility` (nếu email khác → điều chỉnh 1 lần)

### Task 5: Tiện ích hoá

- Thêm script vào `package.json`: `"sync:gitlab": "python3 scripts/translate_english.py --sync --commit"`
- Ghi runbook ngắn vào `.hermes/README.md` (cách sync sau mỗi lesson)
- (Phase 2, tùy chọn) GitHub Action `sync-gitlab.yml`: trigger push main → chạy tool với secrets `LLM_API_KEY` + GitLab token/SSH

## Verification (Definition of Done)

- [ ] `--scan` trên gitlab branch = 0 tiếng Việt (nội dung + tên file)
- [ ] Commit mới trên gitlab: author `hienduong-agility`, message tiếng Anh
- [ ] `pnpm verify` pass trên bản English
- [ ] Toàn bộ file thiếu trên gitlab đã có (diff origin/main vs gitlab không còn D ngoài lịch sử rename)
- [ ] Link nội bộ sau rename không vỡ

## Rủi ro / câu hỏi mở

1. **Email GitLab của `hienduong-agility`** — giả định `hien.duong@asnet.com.vn` (khớp git config global; trên GitHub map tới `hienduong-agilityio`). GitLab attribute commit theo email → verify sau push đầu tiên; sai thì đổi 1 lần trong script.
2. **Chất lượng dịch LLM** — dry-run + review trước khi push lần đầu; từ điển thuật ngữ (provider, guard...) nằm trong prompt.
3. **Lịch sử GitLab cũ** — giữ nguyên (không rewrite); chỉ thêm commit sync mới. Nếu công ty yêu cầu author đúng trên CẢ lịch sử cũ → phương án riêng (filter-branch, tốn công) — hỏi user.
4. **`hermes proxy` bearer expiry** — proxy tự refresh; nếu lỗi: `hermes proxy` restart. Có fallback `LLM_API_KEY` trực tiếp.
5. **pnpm-lock.yaml / .nvmrc / Makefile** — không chứa tiếng Việt → sync nguyên trạng, không dịch.
6. **Cost**: ~20-40K tokens qua Nous Portal cho lần đầu — không đáng kể.

## Quyết định cần user chốt

1. **Phạm vi lần đầu**: (a) Delta-sync từ bản GitLab cũ (nhanh, giữ bản dịch cũ đã OK) — khuyến nghị · (b) Dịch lại toàn bộ từ đầu (sạch nhưng tốn thêm ~30 file)
2. **Tool đặt đâu**: (a) Trong repo `scripts/` (commit vào origin, tái sử dụng, transparent) — khuyến nghị · (b) Ngoài repo (`~/bin`) để repo sạch tool nội bộ
3. **Tự động hoá**: (a) Sync thủ công `pnpm sync:gitlab` sau mỗi lesson — khuyến nghị bắt đầu · (b) + GitHub Action (cần thêm secrets LLM + GitLab)
4. **Lịch sử cũ trên GitLab**: (a) Giữ nguyên, chỉ thêm commit mới — khuyến nghị · (b) Rewrite toàn bộ history về author đúng (tốn công hơn)
