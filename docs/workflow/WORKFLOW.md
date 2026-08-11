# 🔄 WORKFLOW — Quy trình làm việc của dự án

> Đây là "sổ tay nội quy" của repo. Mọi lesson đều đi qua đúng 6 bước dưới đây.
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

## Vòng đời một lesson (6 bước)

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

Claude review code của bạn như một senior reviewer thật: đặt câu hỏi về lựa chọn thiết kế, chỉ ra chỗ chưa idiomatic, và **quiz** để xác nhận bạn hiểu chứ không phải chép. Kết quả ghi vào phần _Ôn tập_ của lesson note.

### Bước 5 — Pull Request

```bash
git push -u origin <branch>
gh pr create --fill
```

- PR description **bắt buộc** có dòng `Fixes NES-XX` → merge xong Linear tự chuyển **Done**
- CI phải xanh mới merge được (branch `main` đã bật protection)
- Merge bằng **Squash and merge** để lịch sử `main` sạch: 1 lesson = 1 commit

### Bước 6 — Đồng bộ · `/sync-progress`

Cập nhật `docs/ROADMAP.md`, đẩy knowledge note lên Notion hub, gửi digest học tập vào `#nestjs-training`.

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

### Definition of Done — một lesson chỉ được coi là xong khi đủ 5 điều

- [ ] Lesson note viết xong, có đủ mục **Liên hệ kiến thức cũ** và **Nguồn**
- [ ] Hands-on chạy được (`pnpm start:dev` + gọi thử API bằng Postman)
- [ ] Test cho phần vừa viết pass (`pnpm test`)
- [ ] Vượt quiz ở bước review — hiểu _vì sao_, không chỉ _làm sao_
- [ ] PR có CI xanh và đã được merge vào `main`

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
