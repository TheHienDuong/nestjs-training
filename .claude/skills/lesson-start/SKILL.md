---
name: lesson-start
description: Mở một lesson mới trong lộ trình học NestJS — đọc issue Linear, tạo branch đúng convention, scaffold lesson note từ template, chuyển issue sang In Progress. Dùng khi user nói "bắt đầu lesson X", "học lesson X", "/lesson-start LXX", hoặc muốn tiếp tục lesson kế tiếp trong ROADMAP.
---

# lesson-start

Mở một lesson mới đúng quy trình, để mọi lesson trông giống nhau và không bao giờ thiếu bước.

## Vì sao cần skill này

Việc này lặp 26 lần. Làm tay sẽ trôi dạt: lesson 3 đặt tên branch kiểu này, lesson 12 kiểu khác, note thiếu mục "Liên hệ kiến thức cũ" — mà đó lại là mục quan trọng nhất. Đặc biệt, tên branch **phải** khớp convention Linear, nếu không mất toàn bộ tự động hóa trạng thái task (xem `docs/adr/0002-linear-lam-nguon-su-that.md`).

## Đầu vào

Mã lesson (`L02`) hoặc tên (`controllers`). Không có gì → lấy lesson ⬜ đầu tiên trong `docs/ROADMAP.md`.

## Các bước

### 1. Xác định lesson

Đọc `docs/ROADMAP.md`, tìm dòng lesson. Lấy: số, tên, phase, các link docs. Nếu đã ✅ → hỏi lại user có muốn làm lại không.

### 2. Kiểm tra trạng thái làm việc hiện tại

```bash
git status --short && git branch --show-current
```

- Còn thay đổi chưa commit → **dừng lại**, báo user, không tự stash.
- Đang ở branch lesson khác chưa merge → hỏi trước khi rời.

### 3. Lấy issue trên Linear

Dùng Linear MCP tìm issue của lesson trong project tương ứng.

- **Có issue:** lấy `identifier` (vd `NES-12`), `branchName` (Linear sinh sẵn — dùng đúng chuỗi này), và description.
- **Chưa có issue:** tạo mới theo cấu trúc description ở mục _Định dạng description issue_ bên dưới, gắn đúng project + label `phase-X`.
- **Linear MCP chưa kết nối:** báo user chạy `! claude mcp add --transport http linear https://mcp.linear.app/mcp` rồi `/mcp`. Vẫn tiếp tục các bước còn lại, dùng branch dạng `lesson/XX-ten-lesson`, và ghi lại là còn nợ bước liên kết Linear.

### 4. Tạo branch

```bash
git checkout main && git pull origin main
git checkout -b <branchName từ Linear>
```

Tên branch **phải** lấy nguyên từ field `branchName` của Linear. Đừng tự sáng tạo — chuỗi `nes-XX` bên trong là thứ Linear dùng để nhận diện.

### 5. Scaffold lesson note

Copy `docs/templates/lesson-note.md` → `docs/lessons/XX-ten-lesson/README.md`.

Điền sẵn: tiêu đề, bảng metadata (phase, Linear ID, branch, docs, ngày hôm nay), và phần **🎯 Mục tiêu** lấy từ description của issue. **Để trống** các mục Lý thuyết / Hands-on / Quiz — chúng được điền ở bước `/teach` và `/lesson-review`.

### 6. Sinh SPEC.md cho coder agent

Copy nguyên description của issue Linear thành `docs/lessons/XX-ten-lesson/SPEC.md`. Đây là file duy nhất mà Coder agent (codex, hoặc tool khác đang lấp vai Coder) đọc để biết làm gì — không có quyền MCP vào Linear (xem [ADR-0004](../../docs/adr/0004-mcp-single-writer-cho-coder-agent.md) và `docs/workflow/AGENT-MODEL.md`). Chỉ Claude được sửa file này; nếu issue Linear đổi sau đó, cập nhật lại `SPEC.md` cùng lúc.

### 7. Chuyển issue sang In Progress

Cập nhật state issue qua Linear MCP. (Nếu GitHub integration đã bật thì bước 4 cũng tự làm việc này — cập nhật lại vẫn vô hại vì cùng một giá trị.)

Lưu ý: bước cập nhật Linear (bước 3, 6, 7) chỉ Claude Code làm được — Coder agent (dù là codex hay tool nào khác) không có kết nối MCP tới Linear (xem `docs/workflow/AGENT-MODEL.md`), nên không thể tự chạy skill này.

### 8. Báo cáo cho user

Trả lời gọn bằng tiếng Việt:

- Lesson nào, branch nào, note ở đâu, `SPEC.md` ở đâu
- Mục tiêu của lesson (3–5 bullet)
- Câu tiếp theo nên gõ: `/teach <chủ đề>`

## Định dạng description issue Linear

```markdown
## 🎯 Mục tiêu học

- <3-5 bullet đo được>

## 📚 Tài liệu chính thống

- [<tên mục>](<link docs.nestjs.com đầy đủ>)

## 🔗 Liên hệ kiến thức cũ

- Express/Prisma/hexagonal: <đối chiếu>

## 🛠 Hands-on

<code gì, ở file nào, kiểm tra bằng cách nào>

## ✅ Definition of Done

- [ ] Lesson note đủ mục Liên hệ kiến thức cũ + Nguồn
- [ ] Hands-on chạy được
- [ ] Test pass
- [ ] Vượt quiz ở bước review
- [ ] PR có CI xanh và đã merge
```

## Ranh giới

- **Không** viết code `src/` — đây là bước mở lesson, chưa phải bước làm.
- **Không** commit gì. Chỉ tạo branch và file note.
- **Không** tự đổi tên branch của Linear cho "đẹp hơn".
- `SPEC.md` chỉ Claude được sửa — Coder agent (codex hoặc tool khác lấp vai đó) chỉ đọc.
