# ADR-0005: Nhánh của Coder agent mở PR riêng vào main (thay thế quyết định #5 của ADR-0003)

- **Trạng thái:** Accepted
- **Ngày:** 2026-08-11
- **Người quyết định:** Hien Duong

## Bối cảnh

ADR-0003, quyết định #5: _"Nhánh của agent (`codex/...`) merge vào **branch lesson**, không merge trực tiếp vào `main`"_ — thiết kế tại thời điểm đó cho đúng một Coder cố định (codex) làm "lời giải tham chiếu" cho từng lesson.

[ADR-0004](0004-mcp-single-writer-cho-coder-agent.md) (2026-08-11) đổi sang mô hình **vai Coder linh hoạt**: nhiều tool (codex, opencode, Hermes...) đều có thể đóng vai, mỗi tool làm trên branch riêng đặt tên theo chính tool đó, và output bắt buộc qua PR; review code lớp 1 bởi Copilot CLI (tự động), lead review + merge bởi user. Với mô hình mới, quyết định #5 của ADR-0003 không còn phù hợp:

- **Branch lesson là nơi người học làm hands-on.** Trộn code của Coder agent vào đó làm nhiễu lịch sử học tập và nhật ký so sánh `docs/lessons/_agent-log.md` (không còn phân biệt được phần nào là của học viên, phần nào của agent).
- **Không xác định được "branch lesson" nào** khi nhiều tool cùng lấp vai Coder (mỗi tool một branch riêng).
- **Cần một điểm review duy nhất, nhất quán** cho mọi tool: PR riêng → Copilot CLI review (lớp 1) → user lead review → **squash merge bởi user**.

## Quyết định

1. Nhánh của Coder agent (`codex/...`, `opencode/...`, ...) luôn mở **PR riêng trực tiếp vào `main`**. Ngoại lệ duy nhất: lesson yêu cầu "lời giải tham chiếu" và SPEC.md của lesson ghi rõ đích merge — khi đó merge vào branch lesson như một ngoại lệ có ghi chú.
2. Mọi PR của Coder agent đều qua review tự động (Copilot CLI) + lead review của user trước khi merge — chỉ user merge. Giữ nguyên nguyên tắc "không agent nào tự review code của chính nó".
3. Quyết định #5 của ADR-0003 được thay thế bởi ADR này. Các quyết định 1–4 của ADR-0003 (trunk-based, một lesson một PR, squash merge, branch protection) giữ nguyên.

## Các phương án đã cân nhắc

| Phương án                                    | Ưu                                                                | Nhược                                                                                | Vì sao không chọn                      |
| -------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------- |
| Merge vào branch lesson (ADR-0003 #5)        | Lời giải tham chiếu nằm ngay cạnh code của học viên               | Nhiễu lịch sử lesson; không rõ "branch lesson" nào khi nhiều tool; review lệch tuyến | Mâu thuẫn với ADR-0004                 |
| **PR riêng vào main** _(đã chọn)_            | Một điểm review duy nhất; lịch sử main sạch; áp dụng cho mọi tool | Mỗi lời giải tham chiếu tốn thêm một PR                                              | —                                      |
| Commit thẳng vào branch lesson, không review | Nhanh nhất                                                        | Vi phạm "không agent nào tự review code mình"                                        | Mất đúng phần giá trị học tập cao nhất |

## Hệ quả

**Tích cực**

- Quy trình review nhất quán cho mọi tool — Copilot CLI review lớp 1, user luôn là điểm chốt cuối (lead review + merge) trước khi code của agent vào `main`.
- Lịch sử `main` và branch lesson đọc được như tài liệu học tập, không lẫn code agent.

**Cái giá phải trả**

- Muốn có lời giải tham chiếu phải mở thêm một PR riêng. Chấp nhận: PR chính là nơi review diễn ra, nên đây không phải chi phí chết.

**Cần làm tiếp**

- Rà soát `docs/workflow/WORKFLOW.md` và `AGENT-MODEL.md` để không còn chỗ nào mô tả luồng "merge vào branch lesson".
