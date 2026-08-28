# Hoàn tất L04 và đồng bộ English mirror — Execution Plan

> **For Hermes:** Đây là kế hoạch điều phối. Không giả mạo hands-on/quiz của user; không merge thay user.

**Goal:** Hoàn tất các phần có thể tự động của NES-5/L04, đồng bộ toàn bộ thay đổi hiện tại từ `main` sang `example/nestjs-training`, và để repo ở trạng thái sẵn sàng cho lesson tiếp theo.

**Architecture:** `main` là nguồn VN/code; `example/nestjs-training` là mirror EN. Code trong `src/` và `test/` phải giữ cùng hành vi/cấu trúc; chỉ dịch comment/string khi hợp đồng repo cho phép. Docs/config được dịch sang English, giữ cấu trúc và link. Mọi output agent đi qua branch/PR riêng; user là người merge.

**Tech Stack:** NestJS 11, pnpm, GitHub PR, herdr panes, Claude Code mentor/writer, Codex GitHub connector review.

---

## Đã xác minh

- `main` sạch và khớp `origin/main` tại `ef31fec6`.
- L04/NES-5 code và lesson note VN đã có trên main qua PR #69/#70.
- `pnpm verify` pass: 6 suites, 14 tests, build pass.
- `origin/example/nestjs-training` mới ở `72e7257`, thiếu L04 và nhiều thay đổi sau L03.
- VN–EN đang lệch 71 paths / khoảng 3.228 additions và 2.982 deletions khi so sánh tree.
- Kanban hiện không có task active; không tự suy đoán trạng thái Linear.

## Giới hạn không được phá

- Hermes không tự làm hands-on thay user.
- Không ghi quiz/retrospective giả như thể user đã học hoặc đã trả lời.
- Không dispatch agent trước khi user duyệt.
- Không merge PR; user merge.
- Không sửa `gitlab` trong wave GitHub mirror.

## Wave 1 — Hoàn thiện lesson note L04 (Claude)

**Branch:** branch riêng theo task NES-5, không làm trên `main`.

Claude cần:

1. Đọc docs NestJS mới nhất về modules/dynamic modules.
2. Hoàn thiện `docs/lessons/04-modules/README.md`:
   - File map chính xác.
   - Lý thuyết, liên hệ Express/Prisma/hexagonal, ví dụ, nguồn.
   - Hướng dẫn hands-on rõ ràng nhưng không code hộ phần user.
   - Quiz/ôn tập để user tự trả lời; không điền câu trả lời giả.
3. Cập nhật `docs/ROADMAP.md` chỉ tới trạng thái phù hợp với bằng chứng; không đánh dấu L04 hoàn thành nếu chưa có xác nhận hands-on/quiz của user.
4. Ghi agent-log nếu workflow yêu cầu.
5. Chạy format/docs checks, không merge.

**Review:** Hermes đọc diff toàn bộ; Claude không review PR do chính Claude author. User là lead review.

## Wave 2 — Đồng bộ English mirror (Claude/writer)

**Branch:** `sync/english-mirror-l04` hoặc tên Linear tương ứng nếu Claude resolve được ticket.

Scope: toàn bộ delta từ `origin/example/nestjs-training` tới `origin/main`, không chỉ L04.

1. Mirror additions/deletions/renames chính xác từ main.
2. Dịch docs/config theo bilingual contract.
3. Giữ source code/test parity về hành vi; comment/string code phải theo quy ước EN.
4. Không mang ký tự tiếng Việt hoặc từ Việt không dấu vào bản EN.
5. Kiểm tra rename ADR và links không bị trỏ sai.
6. Chạy Prettier/ESLint/test/build phù hợp trên mirror.
7. Tạo PR riêng vào `example/nestjs-training`, không merge.

## Wave 3 — Verify độc lập

Hermes sẽ:

- Đọc raw diff toàn bộ, không tin self-report.
- So sánh file map và cấu trúc VN/EN.
- Scan ký tự tiếng Việt có dấu và word-list Việt không dấu trong EN.
- Chạy `pnpm verify` trên main và các check cần thiết trên mirror.
- Kiểm tra PR/CI/review state trên GitHub.
- Báo danh sách PR để user review/merge.

## Điều kiện để thật sự đóng L04

Chỉ khi user tự xác nhận:

- Đã chạy hands-on bằng `pnpm start:dev`/Postman.
- Đã kiểm tra đủ 5 route CRUD và case lỗi.
- Đã trả lời quiz L04 bằng lời của mình.

Hermes/agent có thể chuẩn bị mọi tài liệu và reference code, nhưng không được biến code agent viết thành bằng chứng user đã hoàn thành phần học.

## Rủi ro

- Mirror 71 paths là một MR lớn; nếu quá lớn cần chia thành PR nhỏ hoặc collector `mr/*` theo REVIEW-MODEL.
- `origin/example/nestjs-training` có lịch sử phân kỳ/rename ADR; phải dùng `--find-renames` và kiểm tra links.
- L04 note hiện có phần hands-on/quiz chưa hoàn tất; không được đánh dấu xanh chỉ vì PR code đã merge.
