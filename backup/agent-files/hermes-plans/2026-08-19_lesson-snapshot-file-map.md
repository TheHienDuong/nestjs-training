# Lesson Snapshot — File Map + Code Viewer cho mọi lesson

> **For Hermes:** plan này được user duyệt trước khi thực thi. Không dispatch agent ngoài phạm vi.

**Goal:** Với mỗi lesson, user có thể (1) biết chính xác lesson đó tạo ra/sửa những file nào, (2) đọc từng file code ở đúng trạng thái lúc học lesson đó, kèm hiểu từng dòng qua teaching comments, (3) xem lại bất kỳ lesson nào sau khi kết thúc khóa học — tất cả bằng 1 lệnh `pnpm lesson`, không cần duy trì bảng tay.

**Architecture:** Git vốn đã là nguồn sự thật (mỗi lesson = squash commit trên main, ADR-0003). Ta chỉ thêm (a) git tag `lesson/NN` đánh dấu commit cuối của lesson, (b) 1 script zero-dependency `scripts/lesson.mjs` đọc git để in file map + nội dung file tại tag, (c) 1 bảng File Map nhỏ trong lesson note (cho người thích đọc docs) + quy ước header comment trong code.

**Tech Stack:** Node ≥20 (stdlib: `node:child_process`, `node:fs`, `node:path` — **không thêm dependency nào**), git CLI, markdown.

---

## Context & giả định (đã verify)

- Mỗi lesson = 1+ squash commit trên `main` (ADR-0003). L01: `a6af6c27` (#29 users module) → `ce5bc573` (#27 docs) → `0bd93b33` (#30 agent-log). L00 (setup/infra): kết thúc ở `53c2e7e4` (#25).
- PR #33 (codex reference L02) + #34 (lesson note L02) **đang OPEN, chưa merge** → commit L02 chưa có trên main. Tag `lesson/02` sẽ tạo SAU khi user merge (hoặc tạm trỏ branch `codex/nes-3-l02-controllers-routing` để xem thử — script chỉ đọc tag, không quan tâm tag trỏ đâu).
- Scope verify hiện tại (package.json `verify`): eslint `{src,apps,libs,test}/**/*.ts` + prettier check `src/**/*.ts` `test/**/*.ts` `docs/**/*.md` `*.md` `*.json` `*.yml` `*.mjs`. → `scripts/lesson.mjs` **không nằm** trong prettier/eslint scope (chỉ `*.mjs` ở root mới bị check) → script không phá verify. `docs/**/*.md` có trong scope → mọi md sửa phải prettier-clean.
- `.prettierignore` hiện không chặn `scripts/` — không cần sửa (script không nằm trong scope check).
- Lesson note tồn tại: `docs/lessons/00-setup/README.md`, `docs/lessons/01-first-steps/README.md`, `docs/lessons/02-controllers/README.md` (437 dòng).

---

## Thay đổi đề xuất (tổng quan)

| #   | Thành phần                 | File                                                                                                                                    | Vai trò                                                  |
| --- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 1   | Git tags                   | (git) `lesson/00`, `lesson/01`, sau này `lesson/NN`                                                                                     | Đánh dấu commit cuối mỗi lesson                          |
| 2   | Script viewer              | `scripts/lesson.mjs` + `package.json` (thêm script `lesson`)                                                                            | In file map + đọc code có số dòng                        |
| 3   | File Map trong lesson note | `docs/templates/lesson-note.md` (template), `docs/lessons/01-first-steps/README.md`, `docs/lessons/02-controllers/README.md` (backfill) | Bảng nhỏ cho người thích đọc docs                        |
| 4   | Quy ước vận hành           | `docs/workflow/WORKFLOW.md`, `AGENTS.md`, `CLAUDE.md`                                                                                   | Bước "tag lesson khi xong" + quy ước header comment code |

**Phân vai đề xuất (user chốt khi duyệt plan):** Hermes thực thi toàn bộ (script + tags + docs mechanical) — tiền lệ PR #12 (.hermes.md) Hermes tự làm tooling/docs. Nếu user muốn đúng routing tuyệt đối, phần docs (templates/lesson notes/WORKFLOW/AGENTS.md) chuyển Claude Code dispatch riêng. Hands-on code của user: không đụng.

---

## Tasks

### Task 1: Viết `scripts/lesson.mjs` (script viewer)

**Objective:** CLI zero-dependency đọc git tags, in file map & nội dung file theo lesson.

**Files:**

- Create: `scripts/lesson.mjs`

**Cú pháp:**

```bash
node scripts/lesson.mjs                 # liệt kê mọi lesson (tag + slug + commit subject)
node scripts/lesson.mjs <NN>            # file map lesson NN: diff stat vs lesson trước, phân loại mới/sửa, đường dẫn lesson note
node scripts/lesson.mjs <NN> <path>     # in nội dung file tại tag lesson/NN, có số dòng (vd: node scripts/lesson.mjs 02 src/tasks/tasks.controller.ts)
node scripts/lesson.mjs --diff <A> <B>  # diff stat giữa 2 lesson
node scripts/lesson.mjs --tag <NN>      # tạo lightweight tag lesson/NN tại HEAD (chỉ cho phép khi HEAD = main, tag chưa tồn tại)
node scripts/lesson.mjs --note <NN>     # in đường dẫn lesson note của lesson NN
```

**Logic quan trọng (bắt buộc trong code):**

- Không dùng dependency nào; `execFileSync('git', [...])` với `stdio: 'pipe'`; in UTF-8 (`{ encoding: 'utf8' }`).
- Slug lesson lấy từ thư mục `docs/lessons/` (pattern `<NN>-<slug>/`), fallback = subject commit của tag.
- Diff base của lesson đầu (không có tag trước): `git rev-list --max-parents=0 HEAD` (root commit).
- File map phân loại bằng prefix: `src/` → 🟦 code · `*.spec.ts` hoặc `test/` → 🧪 test · `docs/` → 📄 docs · còn lại ⚙️ misc. Tách "File mới" (`--diff-filter=A --name-only`) vs "File sửa" (`--diff-filter=M --name-only`).
- In nội dung file: `git show lesson/<NN>:<path>` + đánh số dòng (`String(lineNo).padStart(4) + '| ' + line`).
- `--tag`: kiểm tra `git branch --show-current` == `main` (nếu không → báo lỗi, trừ `--force`), kiểm tra tag chưa tồn tại (`git tag -l lesson/<NN>`), tạo `git tag lesson/<NN>` (lightweight). In ra `git log -1 --format=%h %s` của tag mới.
- Exit code ≠ 0 + message rõ khi: lesson không tồn tại, tag thiếu (gợi ý `node scripts/lesson.mjs --tag <NN>`), path không có trong tag.

**Verify (manual, sau khi Task 2 tạo tag):**

```bash
node scripts/lesson.mjs              # liệt kê: 00-setup, 01-first-steps, 02-controllers (02 hiện "chưa có tag")
node scripts/lesson.mjs 01           # file map L01: users module + docs lesson-01 + agent-log
node scripts/lesson.mjs 01 src/users/users.controller.ts   # in code có số dòng
node scripts/lesson.mjs --diff 00 01 # diff stat giữa 2 lesson
```

### Task 2: Tạo git tags `lesson/00` và `lesson/01`

**Objective:** Đánh dấu commit cuối của L00 và L01 trên main.

**Steps:**

1. `git tag lesson/00 53c2e7e4` (commit cuối phase setup — #25)
2. `git tag lesson/01 0bd93b33` (commit cuối L01 trên main — #30)
3. Verify: `git tag -l 'lesson/*'` → 2 tags; `git diff --stat lesson/00..lesson/01` phải gồm đúng: `src/users/*` (5 file) + `src/app.module.ts` + docs lesson-01 + agent-log line.
4. `node scripts/lesson.mjs 01` chạy đúng như kỳ vọng (Task 1 verify).

> Tag `lesson/02`: tạo sau khi user merge PR #33 + #34 (mục Follow-up). Muốn xem thử trước: `git tag lesson/02 codex/nes-3-l02-controllers-routing` — script chạy được ngay, sau merge tag lại trên main.

### Task 3: Thêm mục "🗂 File Map" vào template lesson note

**Objective:** Lesson mới nào cũng có sẵn khung File Map.

**Files:**

- Modify: `docs/templates/lesson-note.md`

**Nội dung chèn** (ngay sau bảng metadata, trước `## 🎯 Mục tiêu`):

```markdown
## 🗂 File map lesson này

> Bản đồ chính xác nhất + đọc từng file code (kèm số dòng): chạy `pnpm lesson <NN>`.
> Bảng này là bản tóm tắt để đọc nhanh; cập nhật khi lesson xong.

| File | Vai trò (lý thuyết/ref/hands-on) | Tạo ở lesson | Trạng thái |
| ---- | -------------------------------- | ------------ | ---------- |
| ...  | ...                              | L00          | Mới / Sửa  |
```

### Task 4: Backfill File Map cho L01 + L02

**Objective:** 2 lesson đang có được bảng file map ngay.

**Files:**

- Modify: `docs/lessons/01-first-steps/README.md`
- Modify: `docs/lessons/02-controllers/README.md`

**Nội dung L01** (file thực tế từ diff `lesson/00..lesson/01`):

| File                                    | Vai trò                   | Tạo ở | Trạng thái |
| --------------------------------------- | ------------------------- | ----- | ---------- |
| `src/users/users.module.ts`             | Ref — module              | L01   | Mới        |
| `src/users/users.controller.ts`         | Ref — controller          | L01   | Mới        |
| `src/users/users.service.ts`            | Ref — service             | L01   | Mới        |
| `src/users/dto/create-user.dto.ts`      | Ref — DTO                 | L01   | Mới        |
| `src/users/users.controller.spec.ts`    | Ref — unit test           | L01   | Mới        |
| `src/app.module.ts`                     | Ref — đăng ký UsersModule | L00   | Sửa        |
| `docs/lessons/01-first-steps/README.md` | Lesson note               | L01   | Mới        |

**Nội dung L02** (từ diff PR #33 + #34 — verify lại khi merge):

| File                                    | Vai trò                              | Tạo ở | Trạng thái  |
| --------------------------------------- | ------------------------------------ | ----- | ----------- |
| `src/tasks/tasks.controller.ts`         | Ref — controller (teaching comments) | L02   | Mới         |
| `src/tasks/tasks.service.ts`            | Ref — service                        | L02   | Mới         |
| `src/tasks/tasks.module.ts`             | Ref — module                         | L02   | Mới         |
| `src/tasks/dto/create-task.dto.ts`      | Ref — DTO                            | L02   | Mới         |
| `src/tasks/dto/update-task.dto.ts`      | Ref — DTO                            | L02   | Mới         |
| `src/tasks/tasks.controller.spec.ts`    | Ref — unit test                      | L02   | Mới         |
| `test/tasks.e2e-spec.ts`                | Ref — e2e test                       | L02   | Mới         |
| `src/app.module.ts`                     | Ref — đăng ký TasksModule            | L00   | Sửa (lần 2) |
| `docs/lessons/02-controllers/README.md` | Lesson note                          | L02   | Mới         |

> Mỗi bảng kèm 1 dòng: "Xem đầy đủ + đọc code từng dòng: `pnpm lesson 01` / `pnpm lesson 02`".

### Task 5: Cập nhật quy ước vận hành (WORKFLOW + AGENTS/CLAUDE)

**Objective:** Lesson sau tự động có tag + header comment chuẩn.

**Files:**

- Modify: `docs/workflow/WORKFLOW.md` — thêm bước cuối (sau bước verify lesson): `pnpm lesson --tag <NN>` để đánh dấu commit lesson.
- Modify: `AGENTS.md` + `CLAUDE.md` — thêm quy ước 2 dòng:
  1. File reference code mới phải có header comment: `// [NES-X · lesson NN] <vai trò file>` (vd `// [NES-3 · lesson 02] Reference — controller, teaching comments inline`).
  2. Mỗi lesson khi xong: chạy `pnpm lesson --tag <NN>`.

**Verify:** prettier check docs (`pnpm exec prettier --check "docs/**/*.md" "*.md"`) phải PASS.

### Task 6: Verify toàn bộ

**Commands:**

```bash
pnpm verify                          # lint + prettier + test + build — phải xanh
pnpm exec prettier --check "docs/**/*.md" "*.md" "*.json"   # md/json mới phải clean
node scripts/lesson.mjs              # liệt kê lesson
node scripts/lesson.mjs 01           # file map L01
node scripts/lesson.mjs 01 src/users/users.controller.ts    # code có số dòng
node scripts/lesson.mjs --diff 00 01
node scripts/lesson.mjs --tag 01     # phải BÁO LỖI: tag đã tồn tại
node scripts/lesson.mjs 99           # phải BÁO LỖI: lesson không tồn tại
```

**Expected:** tất cả PASS; script trả lỗi rõ ràng cho case sai.

### Task 7: Commit + PR (không merge)

**Steps:**

1. Branch mới: `git checkout -b hien/nes-3-lesson-snapshot` (từ main).
2. Commit theo Conventional Commits, author = git config user (không override), kèm trailer:
   `Co-authored-by: Hermes <deepseek-v4-flash> <259144110+hermes-agent[bot]@users.noreply.github.com>`
   (nếu có phần do Claude Code soạn: thêm trailer Claude tương ứng).
3. Push branch → `gh pr create` (body: mô tả 3 thành phần + `@TheHienDuong` + trailer Hermes; PR này là misc tooling/docs nên **không cần** `Fixes NES-XX` — tiền lệ PR #13/#32; nếu muốn track Linear thì tạo task nhỏ).
4. Báo user danh sách chờ review. **KHÔNG merge** — chỉ user merge.

### Follow-up (sau khi user merge PR #33 + #34)

- `git tag lesson/02 <commit-merge>` trên main → `node scripts/lesson.mjs 02` chạy thử → xác nhận file map L02 đúng diff PR #33/#34 → cập nhật lại bảng File Map L02 nếu diff lệch (dự kiến không lệch).
- Ghi 1 dòng vào `docs/lessons/_agent-log.md` (chỉ khi user báo đã merge, đúng luồng).

---

## Files sẽ thay đổi (tổng hợp)

- Create: `scripts/lesson.mjs`
- Modify: `package.json` (thêm script `"lesson": "node scripts/lesson.mjs"`)
- Modify: `docs/templates/lesson-note.md`, `docs/lessons/01-first-steps/README.md`, `docs/lessons/02-controllers/README.md`
- Modify: `docs/workflow/WORKFLOW.md`, `AGENTS.md`, `CLAUDE.md`
- Git: tags `lesson/00`, `lesson/01` (+ `lesson/02` follow-up)

## Tests / Validation

- `pnpm verify` xanh (gate bắt buộc trước khi mở PR)
- Manual script tests (Task 6) — cả happy path lẫn error path
- File map L01/L02 khớp 1:1 với `git diff` thực tế

## Risks & open questions

1. **PR #33/#34 chưa merge** → tag `lesson/02` tạm thời trỏ branch codex (xem thử) hoặc chờ merge xong (chính thức). Không block phần còn lại.
2. **Phân vai:** Hermes tự làm toàn bộ vs dispatch Claude Code cho phần docs (đúng routing "lesson note → Claude"). → User chốt khi duyệt plan.
3. **`--tag` yêu cầu HEAD = main** — tránh tag nhầm lên branch lesson; nếu user muốn tag preview branch thì dùng git tay (ghi trong hướng dẫn).
4. **ROADMAP.md lỗi thời** (L01 🟦, L02 ⬜) — ngoài phạm vi plan này; xử lý riêng sau khi merge PR #33/#34 (đề xuất: Claude chạy /sync-progress).
5. Script không nằm trong prettier/eslint scope → không phá `pnpm verify`; nhưng nếu sau này đổi scope phải nhớ thêm `scripts/` vào `.prettierignore` hoặc format.
