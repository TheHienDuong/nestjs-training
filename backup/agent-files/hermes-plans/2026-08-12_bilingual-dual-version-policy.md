# Plan: Quy tắc "2 phiên bản vi/en" + Dọn hiện trạng sync GitLab

> **For Hermes:** Plan này thuộc quyền hạn orchestration của Hermes. Thực thi theo cổng kiểm duyệt: Hermes đề xuất → user duyệt → dispatch đúng agent (docs/workflow → Claude Code; sync GitLab → theo luồng thủ công đã duyệt). KHÔNG tạo script chạy ngầm, KHÔNG tự merge.

**Goal:** Thiết lập quy tắc bền vững để mọi agent trong learning project tự hiểu "luôn có 2 phiên bản tài liệu (vi/en), luôn tạo đủ 2 bản, luôn giống nhau; GitLab chỉ nhận bản EN với author `hienduong-agility`" — đồng thời sửa các lỗi hiện trạng phát hiện khi khảo sát.

**Kiến trúc (hiện trạng, giữ nguyên):**

- `main` (GitHub) = bản tiếng Việt — nguồn sự thật của nội dung
- `example/nestjs-training` (GitHub) = bản tiếng Anh — dịch từ main
- `example/nestjs-training` (GitLab) = bản sao EN của GitHub example — **chỉ nhận EN, author `hienduong-agility`, không Co-authored-by trailer**
- Code `src/` + `test/` giống hệt giữa 2 bản (chỉ docs/config khác ngôn ngữ)

---

## Bối cảnh / dữ kiện đã xác minh (2026-08-12)

1. `git diff origin/example/nestjs-training gitlab/example/nestjs-training` → khác đúng 2 file: `AGENTS.md` (53 insertions/67 deletions), `CLAUDE.md`. Phần còn lại GIỐNG HỆT.
2. Bản GitLab (80bcca4d) bị lỗi markdown do dịch tự động:
   - `CLAUDE.md`: ` ```bash```bash `; `## Claude's Role: Mentor · PM · Reviewer**Do:**`
   - `AGENTS.md`: ` `````` `; `pnpm format.- tsconfig.json`; bullet `-` dính dòng
3. Bản GitHub example (36b63fac) format sạch hơn (đã qua prettier) → **dùng làm nguồn chuẩn cho GitLab**.
4. `main` hiện hơn GitLab EN **13 commits** (chưa sync: dependabot bumps, Makefile, .nvmrc, ADR-0005, .hermes.md, prettier fix #13, agent docs...). GitLab sync từ main cũ → cần cập nhật.
5. GitLab EN: 0 file tiếng Việt ✅, author sync = `hienduong-agility` ✅, code src/test giống main ✅.
6. Worktree sync tồn tại tại `.cache/gitlab-sync/worktree` (branch `sync/gitlab-mirror`, ahead 1 so với GitLab).
7. Script `translate_english.py` đã MẤT (chưa từng commit). **User KHÔNG muốn tạo script chạy ngầm** → mọi bước dịch/sync làm thủ công, minh bạch trong chat.

---

## Phần A — Dọn hiện trạng (tiền đề bắt buộc)

### Task A1: Đồng bộ nội dung EN chuẩn (GitHub example → GitLab)

**Objective:** GitLab EN có AGENTS.md/CLAUDE.md đúng format như GitHub example.

**Files:**

- Sync từ `origin/example/nestjs-training` (36b63fac) → `gitlab/example/nestjs-training`

**Steps:**

1. Trong worktree sync: `git checkout origin/example/nestjs-training -- AGENTS.md CLAUDE.md`
2. Verify: `git diff origin/example/nestjs-training gitlab/example/nestjs-training` → rỗng (không còn khác biệt)
3. Verify markdown: mở 2 file, đảm bảo code fence ` ``` ` đúng, không còn ` `````` ` hay heading dính
4. Commit: `git -c user.name="hienduong-agility" -c user.email="hien.duong@asnet.com.vn" commit -m "fix: repair markdown in AGENTS.md and CLAUDE.md"` — **KHÔNG trailer**
5. Chưa push — chờ duyệt cả gói ở cuối

**Verification:** `git diff origin/example/nestjs-training gitlab/example/nestjs-training` trả về rỗng; scan VN = 0.

### Task A2: Cập nhật 13 commits mới từ main vào bản EN (GitHub example)

**Objective:** Bản EN không còn thiếu nội dung mới của main (dependabot, Makefile, .nvmrc, ADR-0005, .hermes.md, prettier format...).

**Files:**

- Toàn bộ tree của `main` → dịch các file mới/thay đổi sang EN trên `example/nestjs-training`

**Steps:**

1. Liệt kê các file đổi giữa main cũ (điểm sync trước) và main hiện tại: `git diff <sync-point> origin/main --name-only`
2. Với từng file docs/config mới có tiếng Việt: dịch thủ công sang EN (giữ structure, code fence, YAML keys; code src/test copy nguyên trạng)
3. ADR mới (ADR-0005 đã có bản EN? kiểm tra) — rename theo map chuẩn `0005-coder-agent-opens-pr-to-main.md`
4. Cập nhật link tham chiếu trong docs (nếu rename)
5. Re-scan: `python3` scan regex `[\u00C0-\u1EF9]` → **0 file tiếng Việt** trên example
6. Commit EN, author `hienduong-agility`, message mô tả sync
7. Chưa push — chờ duyệt

**Verification:** scan VN = 0; `pnpm verify` vẫn pass (code không đổi); diff nội dung docs EN vs VN chỉ khác ngôn ngữ.

### Task A3: Sync GitHub example → GitLab (đưa cả 2 nhánh về giống nhau)

**Objective:** `example/nestjs-training` ở GitHub và GitLab GIỐNG HỆT nhau.

**Steps:**

1. `git fetch origin example/nestjs-training`
2. Push: `git push gitlab HEAD:example/nestjs-training` (từ worktree sync, sau khi A1+A2)
3. Verify: `git diff origin/example/nestjs-training gitlab/example/nestjs-training` → rỗng
4. Xóa worktree cũ nếu không cần: `git worktree remove .cache/gitlab-sync/worktree` (tùy chọn, hỏi user)

**Verification:** diff 2 remote = rỗng; `git log gitlab/example/nestjs-training -1` → author `hienduong-agility`.

---

## Phần B — Thiết lập quy tắc "2 phiên bản" cho agents (mục tiêu chính)

> Ghi quy tắc vào **cả 2 bản** (main VN + example EN) — chính là bài test đầu tiên của quy tắc: "mọi thay đổi docs → tạo/update đủ 2 bản".

### Task B1: Thêm quy tắc vào `AGENTS.md` (cả bản VN trên main + bản EN trên example)

**Objective:** Mọi agent đọc AGENTS.md là biết ngay quy tắc 2 phiên bản.

**Nội dung thêm (vào section phù hợp, VD "Repository structure" hoặc section mới "Bilingual policy"):**

```
## Bilingual Policy (quy tắc 2 phiên bản)
- Mọi tài liệu trong repo có 2 phiên bản: main = tiếng Việt, example/nestjs-training = tiếng Anh.
- Khi thay đổi bất kỳ docs/config nào: PHẢI cập nhật cả 2 bản, nội dung tương đương, không lệch.
- Code (src/, test/) giống hệt 2 bản — chỉ docs/config khác ngôn ngữ.
- GitLab (gitlab remote) CHỈ nhận bản tiếng Anh từ example/nestjs-training.
- Commit trên GitLab: author = hienduong-agility, KHÔNG Co-authored-by trailer, message tiếng Anh.
- Kiểm tra trước khi coi là xong: 2 bản không lệch (diff rỗng), bản EN không còn ký tự tiếng Việt.
```

**Files:**

- Modify: `AGENTS.md` (trên `main` VN và `example/nestjs-training` EN)
- Verify: cả 2 branch đều có section này, nội dung tương đương

### Task B2: Cập nhật `.hermes.md` (bản VN) — quy tắc orchestration

**Objective:** Hermes (orchestrator) có quy tắc rõ để nhắc agents và kiểm tra khi dispatch.

**Nội dung thêm (mục phù hợp, VD sau "Technical contract"):**

- Mọi task docs → yêu cầu agent tạo/cập nhật 2 bản vi/en
- Verify của Hermes thêm bước: so diff 2 branch, scan VN trên bản EN
- GitLab: chỉ sync EN, author `hienduong-agility`, không trailer

**Files:**

- Modify: `.hermes.md` (chỉ tồn tại trên main VN — bản EN example không có file này, ghi chú rõ trong plan để không nhầm)

> Lưu ý: `.hermes.md` chỉ có ở main (VN). Không bắt buộc tạo bản EN cho file này (nội bộ Hermes).

### Task B3: Cập nhật `docs/workflow/WORKFLOW.md` (2 bản) — quy trình lesson

**Objective:** Quy trình 6 bước mỗi lesson có bước "viết 2 phiên bản" và "sync EN lên GitLab".

**Nội dung thêm:**

- Sau bước viết lesson note: tạo bản EN tương ứng trên example/nestjs-training
- Sau mỗi milestone: sync EN lên GitLab theo chuẩn (author `hienduong-agility`, không trailer)
- Definition of Done bổ sung: 2 bản không lệch, EN sạch tiếng Việt

**Files:**

- Modify: `docs/workflow/WORKFLOW.md` (main VN + example EN)

### Task B4: Cập nhật `docs/workflow/AGENT-MODEL.md` (2 bản)

**Objective:** Bảng vai trò agent phản ánh trách nhiệm "tạo 2 phiên bản" của từng vai.

**Files:**

- Modify: `docs/workflow/AGENT-MODEL.md` (main VN + example EN)

### Task B5: Cập nhật `CLAUDE.md` (2 bản)

**Objective:** Claude Code (Mentor/Reviewer) có quy tắc 2 phiên bản trong file hướng dẫn riêng.

**Files:**

- Modify: `CLAUDE.md` (main VN + example EN)

### Task B6: Test quy tắc — tạo trang "Bilingual policy" trong docs

**Objective:** Chứng minh quy tắc hoạt động bằng chính 1 tài liệu mới viết 2 bản.

**Files:**

- Create: `docs/bilingual-policy.md` (VN trên main) + `docs/bilingual-policy.md` (EN trên example)

**Steps:**

1. Viết bản VN trên main: quy tắc 2 phiên bản, ai làm gì, checklist trước khi xong
2. Viết bản EN tương ứng trên example
3. Link 2 bản cho nhau (🌐 English | Tiếng Việt)
4. Verify: 2 bản tương đương, EN sạch VN

---

## Thứ tự thực thi & ai làm

| Bước | Task                                                           | Ai                                                 | Branch                       |
| ---- | -------------------------------------------------------------- | -------------------------------------------------- | ---------------------------- |
| 1    | A1 (fix markdown GitLab)                                       | Hermes (thủ công, có duyệt)                        | worktree sync                |
| 2    | A2 (cập nhật 13 commits vào EN)                                | Claude Code (docs) hoặc Hermes thủ công theo duyệt | example/nestjs-training      |
| 3    | A3 (push GitLab, diff rỗng)                                    | Hermes sau khi user duyệt                          | gitlab example               |
| 4    | B1–B5 (quy tắc vào AGENTS/.hermes/WORKFLOW/AGENT-MODEL/CLAUDE) | Claude Code (docs/workflow là vai Claude)          | hien/nes-XX hoặc branch docs |
| 5    | B6 (trang bilingual-policy)                                    | Claude Code                                        | branch docs                  |
| 6    | Merge B1–B6 vào main qua PR (squash, Fixes NES-XX)             | user/Claude duyệt → Hermes không tự merge          | PR → main                    |
| 7    | Sync lại EN (B1–B6 bản EN) lên example + GitLab                | Hermes (có duyệt)                                  | example → gitlab             |

**Ghi chú routing:** Theo `.hermes.md` — docs/workflow/ADR thuộc Claude Code; Hermes chỉ verify + sync GitLab sau khi user duyệt từng bước. Mọi dispatch agent phải qua approval gate.

---

## Verification tổng (sau khi xong toàn bộ)

```bash
# 1. 2 bản example giống nhau
git diff origin/example/nestjs-training gitlab/example/nestjs-training   # → rỗng

# 2. Bản EN sạch tiếng Việt
python3 -c "scan regex [\u00C0-\u1EF9] trên gitlab/example/nestjs-training"  # → 0 file

# 3. Author GitLab đúng chuẩn
git log gitlab/example/nestjs-training -3 --format="%an <%ae>"   # → hienduong-agility

# 4. Gate gốc vẫn pass (code không đổi)
pnpm verify   # lint --max-warnings=0 + prettier + test + build

# 5. Quy tắc hiện diện ở cả 2 bản
grep -l "Bilingual Policy" AGENTS.md   # → main VN + example EN
```

---

## Rủi ro / Trade-off / Câu hỏi mở

1. **Rủi ro lệch bản tiếp tục**: 2 branch song song luôn có nguy cơ lệch (đang xảy ra). Giảm thiểu bằng quy tắc ghi trong AGENTS.md + Hermes verify mỗi lần dispatch. Cân nhắc sau: CI check tự động so diff (nhưng user không muốn script chạy ngầm → chỉ check thủ công khi dispatch).
2. **Chi phí dịch**: mỗi thay đổi docs tốn gấp đôi công. Chấp nhận vì yêu cầu "xem được cả 2 ngôn ngữ"; giữ docs ngắn gọn.
3. **`.hermes.md` không có bản EN** — quyết định: file nội bộ Hermes, chỉ VN. Nếu muốn nhất quán tuyệt đối, tạo `.hermes.en.md`? → Hỏi user.
4. **Worktree `.cache/gitlab-sync/`** — giữ lại làm nơi sync hay xóa sau khi xong? → Hỏi user.
5. **13 commits thiếu trên GitLab** gồm cả dependabot (package.json/lock) — phải sync cả file này (không dịch, copy nguyên trạng) để CI GitLab không lỗi version.
6. **PR cho Phần B**: tách 2 PR (1 cho main VN, 1 cho example EN) hay 1 PR cho main rồi sync example sau? → Đề xuất: 1 PR cho main, sync EN sau (đơn giản hơn, đúng luồng hiện tại).

---

## Kết luận

Plan gồm 2 phần: **A (dọn hiện trạng, 3 task)** để GitLab EN đúng chuẩn và 2 remote giống nhau; **B (thiết lập quy tắc, 6 task)** để mọi agent tự hiểu "luôn 2 phiên bản vi/en giống nhau, GitLab chỉ nhận EN với author hienduong-agility". Phần B tự kiểm chứng bằng cách viết 2 bản cho chính quy tắc (B6).
