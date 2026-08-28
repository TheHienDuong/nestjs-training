# Plan: Học L01 — Cấu trúc project & bootstrap (đúng chuẩn workflow 6 bước)

> **For Hermes:** Plan này là lộ trình học tập của USER (hands-on) — Hermes KHÔNG viết code thay user, chỉ điều phối + verify. Giảng dạy thuộc Claude Code (Mentor). Dispatch agent nào cũng phải qua cổng kiểm duyệt.

**Goal:** Hoàn thành lesson L01 (NES-2) theo đúng quy trình 6 bước trong `docs/workflow/WORKFLOW.md`, kèm quy tắc bilingual mới (lesson note viết 2 bản vi/en, GitLab chỉ nhận EN).

**Kiến trúc:** Linear là nguồn sự thật (issue NES-2 + sub-issue NES-30/31/32 đã tồn tại) → Claude Code dạy lý thuyết + review → User tự code hands-on → PR squash vào main → sync EN mirror → GitLab.

---

## Bối cảnh đã xác minh (2026-08-12)

1. Linear (qua Claude Code MCP): L00 ✅ Done. **L01 (NES-2) Backlog** — đã có scaffold note `docs/lessons/01-first-steps/README.md` nhưng **rỗng nội dung**, chưa branch, sub-issue NES-30/31/32 chưa mở.
2. ROADMAP: L01 = "Cấu trúc project & bootstrap (`main.ts`, platform adapter)" — docs: `/first-steps` + `/fundamentals/platform-agnosticism`.
3. Quy tắc bilingual mới (PR #18/#19 đã merge): lesson note phải có 2 bản — VN trên main, EN trên example; GitLab chỉ nhận EN (author `hienduong-agility`, không trailer).
4. Repo đang ở `main` 4787047, sạch, `pnpm verify` PASS, CI xanh.

---

## Phần 1 — Dọn dẹp 2 artifact (việc nhỏ, làm trước)

### Task 1: Xóa issue thừa NES-105 (Linear)

**Objective:** Dọn issue test "TEST: pipeline Fixes keyword (xóa sau)" — trạng thái Canceled, chính nó ghi "xóa sau".

**Steps:**

1. Claude Code dùng Linear MCP xóa issue NES-105 (hoặc move sang archive nếu Linear không cho xóa)
2. Xác nhận: issue không còn trong project

**Verification:** `claude -p "kiểm tra NES-105 còn không" --allowedTools mcp__linear --max-turns 5` → không còn.

### Task 2: Xóa thư mục rỗng `docs/lessons 2/`

**Objective:** Bỏ artifact thừa (thư mục tên có khoảng trắng, rỗng, không phải lesson thật).

**Steps:**

1. `rm -rf "docs/lessons 2"` (xác nhận rỗng trước khi xóa: `ls -la "docs/lessons 2/"`)
2. Commit: `chore: remove empty stray lessons directory` (author user + trailer Hermes) → push → PR vào main (nhỏ, có thể gộp vào PR của Task 3)

**Verification:** `git status` sạch, thư mục biến mất.

---

## Phần 2 — Lesson L01 (NES-2) theo 6 bước WORKFLOW

### Step 1 — Open Lesson · `/lesson-start L01` (Claude Code)

**Objective:** Mở lesson đúng chuẩn: đọc Linear issue, tạo branch, scaffold note, move In Progress.

**Steps:**

1. Claude Code chạy skill `/lesson-start L01`:
   - Đọc issue Linear NES-2 + sub-issue NES-30/31/32, tóm tắt mục tiêu tiếng Việt
   - Tạo branch theo đúng tên Linear: `hien/nes-2-...` (không tự đặt tên khác — sẽ phá automation)
   - Điền `docs/lessons/01-first-steps/README.md` từ template (tiêu đề, metadata, 🎯 Objectives — bỏ trống Theory/Hands-on/Quiz)
   - Move NES-2 sang **In Progress** → Slack tự nhận notification
2. **Bilingual:** tạo bản EN tương ứng `docs/lessons/01-first-steps/README.md` trên `example/nestjs-training` (hoặc ghi chú vào checklist để làm cuối lesson — đề xuất: làm sau Step 6 để tránh trùng công)

**Verification:** branch đúng tên `hien/nes-2-*`; issue In Progress trên Linear; lesson note có title + metadata + Objectives.

### Step 2 — Learn Theory · `/teach first-steps` (Claude Code)

**Objective:** Học lý thuyết — bắt buộc đọc docs MỚI từ web, không học từ bộ nhớ.

**Steps:**

1. Claude Code chạy skill `/teach` với chủ đề L01:
   - **Luôn fetch docs mới** từ `gh api repos/nestjs/docs.nestjs.com/contents/content/first-steps.md` + `fundamentals/platform-agnosticism.md` (docs.nestjs.com là Angular SPA — WebFetch chỉ lấy được title)
   - Giải thích tiếng Việt: `main.ts` bootstrap, platform adapter (Express/Fastify), cấu trúc thư mục, decorator `@Module`
   - Ví dụ chạy được + link đúng section
   - Kết nối kiến thức cũ: Express `app.listen()` ↔ Nest `NestFactory.create()`
   - Kết thúc 3–5 câu hỏi kiểm tra hiểu
2. User ghi chú vào lesson note (mục Theory) — **tự viết tay, không copy nguyên văn**

**Verification:** lesson note mục Theory có nội dung; user trả lời được câu hỏi quiz.

### Step 3 — Hands-on (USER tự code — KHÔNG agent nào viết code)

**Objective:** User tự tay thực hành — Claude chỉ gợi ý, chỉ lỗi, đặt câu hỏi ngược. **Tuyệt đối không cho code sẵn.**

**Steps:**

1. User tự thực hành theo bài: tạo project/chạy bootstrap, sửa `main.ts`, chạy `pnpm start:dev`, quan sát
2. Nếu cần "lời giải tham khảo": tag issue `agent:codex` + gán Coder agent (codex) làm branch riêng `codex/nes-2-...` — **chỉ sau khi user tự làm xong, để so sánh**
3. Mọi thắc mắc: hỏi Claude (gợi ý, không giải)

**Verification:** user tự chạy được app; hiểu từng dòng mình viết.

### Step 4 — Review · `/lesson-review` (Claude Code)

**Objective:** Review như senior: hỏi design choice, chỉ code không idiomatic, quiz xác nhận hiểu (không chỉ copy).

**Steps:**

1. Claude Code chạy skill `/lesson-review`: review code hands-on của user trên branch
2. Quiz: user phải trả lời đúng **vì sao**, không chỉ **làm sao** — chưa đúng thì chưa qua
3. Ghi kết quả vào mục Review của lesson note
4. **Bilingual:** cập nhật bản EN lesson note (nếu Step 1 chưa làm)

**Verification:** quiz pass; lesson note đủ Theory + Review; bản EN tương đương.

### Step 5 — Pull Request (User + Hermes hỗ trợ)

**Objective:** Merge hands-on vào main đúng chuẩn: CI xanh, squash, `Fixes NES-2`.

**Steps:**

1. `git push -u origin hien/nes-2-...` → `gh pr create --fill` (description **phải có** `Fixes NES-2` → Linear tự move Done sau merge)
2. Hermes verify: `pnpm verify` PASS, CI xanh (`gh pr checks --watch`)
3. Merge **squash** (1 lesson = 1 commit) — user hoặc Claude merge
4. **Bilingual:** sync bản EN lên `example/nestjs-training` (PR riêng hoặc gộp) → rồi push GitLab (author `hienduong-agility`, không trailer, message EN)

**Verification:** PR merged, `Fixes NES-2` hiện diện, Linear tự chuyển Done; diff 2 remote rỗng; GitLab sạch VN.

### Step 6 — Sync · `/sync-progress` (Claude Code)

**Objective:** Cập nhật ROADMAP + Notion hub + Slack digest.

**Steps:**

1. Claude Code chạy skill `/sync-progress`:
   - Cập nhật `docs/ROADMAP.md`: L01 ⬜ → ✅
   - Đẩy knowledge note lên Notion hub
   - Gửi learning digest tới channel `#nestjs-training` (Slack)
2. Viết retro phase (nếu kết thúc phase): theo `docs/templates/retro.md` → `docs/lessons/_retros/phase-1.md`

**Verification:** ROADMAP L01 ✅; Notion + Slack cập nhật; agent-log ghi 1 dòng.

---

## Phần 3 — Tiếp tục L02 → L04 (Phase 1) nếu L01 ổn

Sau L01 xong, lặp lại 6 bước cho:

- **L02 Controllers & Routing** (NES-3) — `/controllers`
- **L03 Providers & DI** (NES-4) — `/providers` + custom-providers + injection-scopes
- **L04 Modules + Hands-on CRUD Tasks in-memory** (NES-5) — `/modules`

Mỗi lesson: cùng quy trình 6 bước + bilingual (2 bản vi/en) + sync GitLab cuối phase.

---

## Verification tổng (sau mỗi lesson)

```bash
pnpm verify                          # gate chuẩn repo
gh pr checks <n> --watch             # CI xanh trước merge
git diff origin/example/nestjs-training gitlab/example/nestjs-training  # rỗng
python3 scan VN trên example         # 0 file tiếng Việt
git log gitlab/example/nestjs-training -1   # author hienduong-agility
```

## Rủi ro / Lưu ý

1. **Hands-on là của USER** — nếu agent (Claude/codex) viết code thay user, user không học được gì. Nhắc lại ở mỗi step.
2. **Bilingual tốn gấp đôi công** — lesson note dài → đề xuất: viết bản VN trước, dịch EN sau khi review xong (Step 4), tránh dịch 2 lần.
3. **`/teach` phải fetch docs mới** — không học từ bộ nhớ model (knowledge cutoff có thể cũ hơn NestJS 11).
4. **Branch phải đúng tên Linear** (`hien/nes-2-...`) — tên khác phá automation Linear↔GitHub.
5. **NES-105 + `docs/lessons 2/`** — dọn trước khi học (Phần 1) để repo sạch.
6. **Câu hỏi mở:** Step 1 có nên tạo bản EN lesson note ngay không, hay chờ Step 4 (sau khi có nội dung thật)? → Đề xuất chờ Step 4 (đỡ dịch 2 lần).

---

## Kết luận

Lộ trình: dọn 2 artifact → L01 (6 bước, NES-2) → L02–L04 (Phase 1) → retro phase. Mỗi lesson đúng chuẩn WORKFLOW + bilingual. Hermes điều phối + verify, Claude Code dạy + review, User tự code hands-on.
