---
name: sync-progress
description: Đồng bộ tiến độ học sau khi merge một lesson — cập nhật ROADMAP.md, đẩy knowledge note lên Notion hub, gửi digest học tập vào Slack #nestjs-training. Chỉ làm phần mà Linear integration không tự làm. Dùng khi user nói "sync tiến độ", "/sync-progress", "cập nhật tiến độ", hoặc ngay sau khi merge PR của một lesson.
---

# sync-progress

Đồng bộ phần tiến độ mà **native integration không lo được**.

## Vì sao cần skill này — và ranh giới quan trọng nhất của nó

Theo `docs/adr/0002-linear-lam-nguon-su-that.md`, Linear là nguồn sự thật duy nhất về trạng thái task, và nó **tự** chuyển trạng thái qua GitHub integration, **tự** thông báo qua Slack integration.

> ⚠️ Skill này **không** được cập nhật lại trạng thái issue trên Linear.
> Làm thế là tạo ra nguồn sự thật thứ hai — đúng thứ ADR-0002 muốn tránh.

Việc của skill này chỉ gồm ba thứ integration không làm được:

1. `docs/ROADMAP.md` — bản chiếu để đọc offline
2. **Notion hub** — knowledge tổng hợp, tra cứu xuyên lesson
3. **Slack digest học tập** — khác hẳn notification của Linear: Linear báo _"NES-12 đã Done"_, digest nói _"học được gì, còn vướng gì"_

## Bước 1 — Xác định lesson vừa xong

```bash
git log main --oneline -5
gh pr list --state merged --limit 3
```

Xác nhận với user lesson nào cần sync trước khi ghi gì.

## Bước 2 — Kiểm tra Linear đã tự chuyển trạng thái

Đọc issue qua Linear MCP.

- Đã **Done** → tốt, integration hoạt động đúng. Đi tiếp.
- Vẫn **In Progress** → integration chưa chạy. **Không lặng lẽ sửa tay.** Báo user và chẩn đoán nguyên nhân:
  - Tên branch có chứa `nes-XX` không? (nguyên nhân phổ biến nhất)
  - PR description có `Fixes NES-XX` không?
  - GitHub integration đã bật trong Linear Settings chưa?

  Đây là thông tin có ích: biết integration hỏng vì sao còn giá trị hơn việc che đi bằng một lần cập nhật tay.

## Bước 3 — Cập nhật ROADMAP.md

Đổi ⬜/🟦 → ✅ ở dòng lesson tương ứng. Nếu là lesson cuối của phase, kiểm tra đã có retro chưa (`docs/lessons/_retros/phase-X.md`) — chưa có thì nhắc user viết theo `docs/templates/retro.md`.

## Bước 4 — Đẩy knowledge lên Notion

Dùng skill `notion-knowledge-router` để tôn trọng cấu trúc note sẵn có của user (đừng tự phát minh schema).

Nội dung đẩy lên là **bản tổng hợp**, không phải copy nguyên lesson note:

- Mục **🧠 Điểm cần nhớ** (tối đa 5 dòng)
- Bảng **🔗 Liên hệ kiến thức cũ**
- Các ngộ nhận đã phát hiện ở bước review
- Link về lesson note trên GitHub để xem chi tiết

Notion đóng vai trò **tra cứu nhanh và xuyên lesson**; chi tiết + code vẫn nằm trong repo, nơi có version control.

## Bước 5 — Digest học tập vào Slack

Gửi vào `#nestjs-training`:

```
✅ LXX — <Tên lesson>  ·  NES-XX  ·  <link PR>

🧠 Học được
• <2-3 điểm chính>

🔗 Nối với kiến thức cũ
• <một câu>

⚠️ Còn mơ hồ
• <hoặc "không có">

▶️ Tiếp theo: LYY — <tên>
```

Digest này **bổ sung** cho notification của Linear, không thay thế. Linear nói _cái gì_ đã xong; digest nói _học được gì_.

## Bước 6 — Gợi ý lesson kế tiếp

Đọc `docs/ROADMAP.md`, tìm lesson ⬜ đầu tiên, gợi ý user gõ `/lesson-start LYY`.

Nếu vừa xong Phase 3 và chưa từng chạy `/graphify`: đề xuất build knowledge graph từ notes — tới lúc này số note đã đủ để hỏi xuyên tài liệu có ý nghĩa.

## Ranh giới

- **Không** cập nhật trạng thái issue Linear (xem cảnh báo ở đầu file).
- **Không** gửi Slack khi chưa xác nhận PR đã merge thật.
- **Không** sửa nội dung lesson note — chỉ đọc để tổng hợp.
- Digest ngắn gọn. Kênh Slack đầy chữ là kênh không ai đọc.
