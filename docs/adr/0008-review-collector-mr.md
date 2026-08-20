# ADR-0008: Collector branch `mr/*` là lớp gom SAU merge, không thay thế ADR-0005

- **Trạng thái:** Proposed
- **Ngày:** 2026-08-20
- **Người quyết định:** Hien Duong

## Bối cảnh

`docs/workflow/REVIEW-MODEL.md` (mô hình multi-reviewer, PR #44/#45) mô tả pipeline: PR nhỏ được tách và review nhẹ theo loại, sau đó "gom 2 MR lớn" vào collector branch `mr/<ngay>-<stt>` để Copilot gatekeeper review kỹ trước khi vào `main`.

[ADR-0005](0005-coder-agent-mo-pr-rieng-vao-main.md) (Accepted) đã quyết định: Coder agent **mở PR riêng thẳng vào `main`** — mỗi PR nhỏ merge độc lập, không gom vào một nhánh trung gian. Codex review PR #45 chỉ ra mâu thuẫn thật: nếu PR nhỏ đã theo ADR-0005 (merge thẳng `main`), thì không còn gì để "gom" vào `mr/*`; nếu PR nhỏ target thẳng `mr/*` thay vì `main`, việc đó vi phạm ADR-0005. ADR-0007 chỉ supersede quyết định về vai reviewer (Claude nhận lại Reviewer local), không đụng tới ADR-0005 — nên cần một ADR riêng làm rõ ranh giới.

## Quyết định

1. **PR nhỏ vẫn đi đúng ADR-0005:** mở PR riêng, target `main`, review (Claude local → Codex GitHub App connector tự động → user lead review), merge thẳng vào `main` khi user duyệt. Không đổi target sang `mr/*`.
2. **`mr/*` là lớp gom AUDIT sau đó, không phải lớp gate trước merge:** cuối ngày (hoặc khi user thấy cần), Hermes tạo branch `mr/<ngay>-<stt>` **từ các commit đã có sẵn trên `main`** (đã merge qua ADR-0005), để Copilot gatekeeper review kỹ một lượt tổng hợp trước khi coi các thay đổi đó là "đã phát hành" chính thức (post-merge quality gate, không chặn code vào `main`).
3. Nếu Copilot gatekeeper phát hiện vấn đề ở bước audit `mr/*`, xử lý bằng PR fix mới (theo đúng ADR-0005) — **không revert bằng thao tác trực tiếp trên `mr/*`**.
4. `mr/*` tối đa 2 lần/ngày (theo `REVIEW-MODEL.md` §2/§3) — đây là trần cho số lần audit, không phải trần cho số PR nhỏ được merge trong ngày.

## Các phương án đã cân nhắc

| Phương án                                                                          | Ưu                                                                    | Nhược                                                                                         | Vì sao không chọn                            |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------- |
| PR nhỏ target thẳng `mr/*` (gate trước merge)                                      | Copilot review trước khi vào `main`, chặn sớm                         | Vi phạm ADR-0005 (Coder phải mở PR thẳng `main`); đổi lại quyết định Accepted không cần thiết | Vi phạm ADR đã Accepted                      |
| **`mr/*` là audit SAU merge (đã chọn)**                                            | Giữ nguyên ADR-0005; Copilot vẫn có vai trò kiểm tra tổng hợp định kỳ | Vấn đề phát hiện ở audit phải fix bằng PR mới, không chặn được real-time                      | —                                            |
| Bỏ hẳn collector `mr/*`, chỉ dùng Codex GitHub App connector + Claude local review | Đơn giản nhất, không cần ADR riêng                                    | Mất lớp review tổng hợp/kỹ của Copilot cho các thay đổi lớn dồn lại                           | User muốn giữ Copilot làm gatekeeper định kỳ |

## Hệ quả

**Tích cực:** giải quyết mâu thuẫn ADR-0005 vs `mr/*`; PR nhỏ vẫn merge nhanh vào `main` không bị chặn chờ Copilot; Copilot vẫn đóng vai gatekeeper định kỳ (post-merge) đúng tinh thần "tiết kiệm token, chỉ chốt việc lớn".

**Cái giá phải trả:** vấn đề Copilot phát hiện ở bước audit đã ở trên `main` rồi — phải fix bằng PR tiếp theo, không "chặn" được như một gate thật; cần ghi rõ trong `docs/lessons/_agent-log.md` khi audit phát hiện vấn đề để không mất dấu.

**Cần làm tiếp:** cập nhật `docs/workflow/REVIEW-MODEL.md` pipeline cho khớp (đã làm), thêm dòng ADR-0008 vào `docs/adr/README.md` (đã làm), theo dõi lần audit `mr/*` đầu tiên xem cơ chế "gom từ commit đã ở main" có cần script hỗ trợ hay làm tay đủ.
