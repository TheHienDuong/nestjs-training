# 🔄 WORKFLOW — Quy trình làm việc của dự án

> Đây là "sổ tay nội quy" của repo. Mọi lesson đều đi qua đúng 7 bước dưới đây.
> Mục đích kép: **học NestJS** và **học cách một team backend thật sự vận hành**.

## Bản đồ công cụ

```
                    ┌─────────────────────────────┐
                    │   LINEAR  (nguồn sự thật)   │
                    │  Initiative → Project →     │
                    │  Issue → Sub-issue          │
                    └──────┬───────────────┬──────┘
        GitHub integration │               │ Slack integration
              (tự động)    │               │    (tự động)
                    ┌──────▼──────┐  ┌─────▼────────────┐
                    │   GITHUB    │  │ #nestjs-training │
                    │ code · PR   │  │  thông báo issue │
                    │ CI Actions  │  │  digest học tập  │
                    └──────┬──────┘  └──────────────────┘
                           │
              ┌────────────▼─────────────┐
              │  docs/lessons/*.md       │  ← note tiếng Việt, review qua PR
              │  NOTION hub              │  ← knowledge tổng hợp, tra cứu nhanh
              └──────────────────────────┘
```

**Nguyên tắc nền:** ưu tiên _native integration_ hơn đồng bộ thủ công. Linear tự nói chuyện với GitHub và Slack; agent chỉ làm phần mà integration không làm được (viết note, tổng hợp Notion, digest học tập).

---

## Vòng đời một lesson (7 bước)

### Bước 1 — Mở lesson · `/lesson-start`

```
/lesson-start L02
```

Skill sẽ:

1. Đọc issue tương ứng trên Linear, tóm tắt mục tiêu bằng tiếng Việt
2. Tạo branch **đúng convention của Linear** (xem mục _Branch_ bên dưới)
3. Tạo `docs/lessons/02-controllers/README.md` từ template
4. Chuyển issue sang **In Progress** → Slack tự nhận thông báo

### Bước 2 — Học lý thuyết · `/teach`

```
/teach controllers
```

Claude đóng vai người thầy:

- **Luôn đọc docs mới nhất từ web trước khi giảng** — không giảng từ trí nhớ
- Giải thích tiếng Việt: khái niệm là gì, giải quyết vấn đề gì, khi nào _không_ nên dùng
- Ví dụ chạy được, kèm link tới đúng mục docs gốc
- Liên hệ kiến thức cũ: Express / Prisma / hexagonal tương ứng ra sao
- Kết bằng 3–5 câu hỏi kiểm tra hiểu

### Bước 3 — Hands-on (bạn tự code)

**Claude không code hộ phần hands-on.** Vai trò của Claude ở bước này là gợi ý, chỉ chỗ sai, đặt câu hỏi ngược.

Muốn có "lời giải tham chiếu" để đối chiếu sau khi tự làm xong: gắn nhãn `agent:codex` (hoặc nhãn tương ứng cho tool khác) lên issue và giao cho **Coder agent** — mặc định là codex — làm ở branch riêng, xem [AGENT-MODEL.md](AGENT-MODEL.md).

### Bước 4 — Review · `/lesson-review`

**Review học tập** (giảng dạy, không phải review code trước merge): Claude quiz và ôn tập với bạn như một senior mentor — đặt câu hỏi về lựa chọn thiết kế, chỉ ra chỗ chưa idiomatic, và xác nhận bạn hiểu chứ không phải chép. Kết quả ghi vào phần _Ôn tập_ của lesson note.

### Review code & merge

Tách bạch với review học tập ở trên — đây là cổng kiểm duyệt trước khi code vào `main`:

1. **Claude Code** review local mã của Coder agent (trước khi PR mở).
2. **Codex GitHub App connector** (`chatgpt-codex-connector[bot]`) review tự động, ngay sau khi PR mở/sync — chạy trên **mọi PR**, kể cả PR nhỏ, không cần workflow riêng. **Copilot CLI KHÔNG tự động** — chỉ dispatch cho MR lớn (`mr/*`, tối đa 2/ngày, xem [REVIEW-MODEL.md](REVIEW-MODEL.md)).
3. **User (lead reviewer)** review lại code, quyết định merge hay không — PR cần thêm approve bắt buộc của code owner `@hienduong-agilityio` (`.github/CODEOWNERS`).
4. **Chỉ user được merge** — không agent nào merge, kể cả Claude Code.

### Bước 5 — Pull Request

```bash
git push -u origin <branch>
gh pr create --fill
```

- PR description **bắt buộc** có dòng `Fixes NES-XX` → merge xong Linear tự chuyển **Done**
- CI phải xanh mới merge được (branch `main` đã bật protection)
- Merge bằng **Squash and merge** để lịch sử `main` sạch: 1 lesson = 1 commit — **merge chỉ do user thực hiện** (không agent nào merge)

### Bước 6 — Đồng bộ · `/sync-progress`

Cập nhật `docs/ROADMAP.md`, đẩy knowledge note lên Notion hub, gửi digest học tập vào `#nestjs-training`.

### Bước 7 — Tag lesson · `pnpm lesson --tag <NN>`

Sau khi PR đã merge vào `main`, chạy `pnpm lesson --tag <NN>` để tạo git tag `lesson/NN` đánh dấu đúng commit của lesson. Nhờ tag này, `pnpm lesson <NN>` sau đó hiển thị được file map chính xác và cho đọc code theo từng lesson.

---

## Quy ước

### Branch

Linear sinh sẵn tên branch cho mỗi issue (nút _Copy git branch name_), dạng:

```
hien/nes-12-controllers-va-routing
```

Dùng **đúng** tên đó. Chính chuỗi `nes-12` là thứ giúp Linear tự nhận diện branch và chuyển trạng thái issue. Đặt tên khác đi là mất tự động hóa.

### Commit — Conventional Commits

```
<type>(<scope>): <mô tả ngắn, thể mệnh lệnh>
```

| Type       | Dùng khi                             |
| ---------- | ------------------------------------ |
| `feat`     | Thêm tính năng cho API               |
| `fix`      | Sửa lỗi                              |
| `docs`     | Viết/sửa lesson note, README, ADR    |
| `test`     | Thêm/sửa test                        |
| `refactor` | Đổi cấu trúc code, không đổi hành vi |
| `chore`    | Cấu hình, dependency, CI             |
| `style`    | Format, không đổi logic              |

Scope nên là tên lesson hoặc module: `docs(lesson-02): ...`, `feat(tasks): ...`

`commitlint` chạy ở git hook `commit-msg` — sai format là commit bị **chặn ngay tại máy**, không đợi tới CI.

### Bilingual (2 phiên bản)

Lesson note viết tiếng Việt trên `main`, tạo bản EN tương ứng trên branch `example/nestjs-training`. Sau mỗi milestone, sync bản EN lên GitLab (author `hienduong-agility`).

### Definition of Done — một lesson chỉ được coi là xong khi đủ 7 điều

- [ ] Lesson note viết xong, có đủ mục **Liên hệ kiến thức cũ** và **Nguồn**
- [ ] Hands-on chạy được (`pnpm start:dev` + gọi thử API bằng Postman)
- [ ] Test cho phần vừa viết pass (`pnpm test`)
- [ ] Vượt quiz ở bước review — hiểu _vì sao_, không chỉ _làm sao_
- [ ] PR có CI xanh và đã được merge vào `main`
- [ ] 2 bản vi/en không lệch nội dung
- [ ] Bản EN sạch, không còn ký tự tiếng Việt

---

## Dọn dẹp workspace sau khi task xong (Herdr) — bắt buộc

> Áp dụng cho task dispatch qua Herdr — Coder (codex) hoặc agy chạy trong worktree/pane riêng (xem [AGENT-MODEL.md](AGENT-MODEL.md)). Chi tiết đầy đủ + guardrail nằm ở `.hermes.md` (mục "Dọn dẹp bắt buộc" + "Herdr bridge") — đây là bản tóm tắt cho người đọc quy trình.

**Luồng 9 bước (Herdr bridge)** — dọn dẹp là **bước cuối bắt buộc**, không phải việc làm khi rảnh:

1. `hermes kanban create/claim` — task state (nguồn sự thật duy nhất)
2. `herdr worktree create --cwd <repo> --branch codex/nes-XX-... --label NES-XX --json` — tự tạo workspace + tab + pane riêng cho task
3. `herdr agent start <name> --kind codex --pane <pane_id>` — agent ephemeral per task
4. `herdr agent prompt <pane_id> "<task> + ghi kết quả vào <worktree>/.hermes/runs/NES-XX.json"`
5. Poll file JSON kết quả — phán quyết duy nhất, không tin `pane wait-output`/`agent wait`
6. Verify độc lập: `git diff` raw + `pnpm verify` — không tin lời tự báo cáo
7. Mở PR riêng (`Fixes NES-XX`) → Claude Code review local → Codex GitHub App connector review → user lead review + merge
8. `hermes kanban complete`
9. **Dọn dẹp bắt buộc** — ngay sau khi PR đã squash merge (hoặc user báo hủy task): resolve target động bằng `herdr agent list` (không dùng lại id/label cũ), kiểm tra `git status` + trạng thái PR/issue, rồi mới `herdr worktree remove --workspace <id> --force` + `git branch -D <branch>`. Không để lại worktree/pane vô dụng.

**Ngoại lệ an toàn — không bao giờ xóa nếu:**

- Là worktree `main` hoặc worktree hiện tại của user (đang mở/đang dùng).
- Là worktree lesson/coder/reviewer đang **active** (task chưa đóng, đang chờ review/CI).
- Worktree còn **uncommitted changes**.
- Branch còn **PR đang mở**.
- Pane đang **chạy** hoặc còn cần cho việc khác.

**Remote branch:** mặc định **không** xóa — chỉ xóa branch local. Chỉ xóa remote khi user yêu cầu rõ ràng.

**Nếu bị chặn:** báo đúng lý do (uncommitted changes / PR mở / pane đang chạy) trong chat, không ép xóa, thử lại dọn dẹp sau khi điều kiện chặn được giải quyết.

---

## Hàng rào chất lượng tự động

| Hàng rào                          | Chạy ở đâu  | Chặn cái gì                            |
| --------------------------------- | ----------- | -------------------------------------- |
| `lint-staged` (pre-commit)        | Máy bạn     | Code chưa format / lint lỗi            |
| `commitlint` (commit-msg)         | Máy bạn     | Commit message sai convention          |
| GitHub Actions CI                 | Trên GitHub | Lint / test / build fail               |
| Branch protection                 | Trên GitHub | Push thẳng vào `main`, merge khi CI đỏ |
| Coverage threshold _(từ Phase 5)_ | CI          | Coverage tụt dưới ngưỡng               |
| Dependabot                        | Trên GitHub | Dependency lỗi thời (mở PR hàng tuần)  |

Thứ tự này có chủ đích: **phát hiện lỗi càng sớm càng rẻ**. Lỗi format bắt ở máy tốn 2 giây; bắt ở CI tốn 3 phút; bắt ở review tốn nửa ngày của người khác.

---

## Lệnh hay dùng

```bash
# Vòng lặp phát triển
pnpm install
pnpm start:dev                 # watch mode
pnpm lint                      # eslint --fix
pnpm format                    # prettier --write

# Test
pnpm test                      # unit
pnpm test -- app.controller     # một file
pnpm test -- -t "tên test"      # theo tên
pnpm test:cov                  # coverage
pnpm test:e2e                  # e2e

# Hạ tầng local
docker compose up -d           # postgres + redis
docker compose ps              # kiểm tra healthy
docker compose down            # tắt (giữ data)
docker compose down -v         # tắt và XOÁ data

# GitHub
gh pr create --fill
gh run watch                   # xem CI chạy realtime
gh pr checks                   # trạng thái check của PR
```

## Chuẩn bị môi trường lần đầu

```bash
pnpm install                   # husky tự cài hook qua script "prepare"
cp .env.example .env           # rồi điền giá trị
docker compose up -d
```
