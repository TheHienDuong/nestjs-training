# ADR-0007: Claude Code nhận lại vai Reviewer local (mô hình multi-reviewer phân tải)

- **Trạng thái:** Proposed
- **Ngày:** 2026-08-19
- **Người quyết định:** Hien Duong

## Bối cảnh

Ngày 2026-08-13 (PR #24 "governance-workflow-reviewmerge"): quyết định Claude Code **bỏ vai Reviewer code** → chỉ còn Mentor · PM. Khi đó review code lớp 1 = Copilot CLI (tự động, trên GitHub), lead review + merge = user. Lý do tại thời điểm đó: tách "người thầy" khỏi "người gõ phím review", tránh Claude kiêm quá nhiều.

Ngày 2026-08-19: user quyết định xây **mô hình multi-reviewer phân tải** (xem `docs/workflow/REVIEW-MODEL.md`): không để một agent ôm hết việc review; mỗi agent review đúng thứ nó giỏi; tiết kiệm token (Copilot chỉ chốt MR lớn). Kết quả phân tích phân vai lộ ra nhu cầu bị bỏ trống:

- **Review local** (đọc + review mã của Coder agent trước khi merge qua PR riêng) cần một vai giữ được **ngữ cảnh dài** (roadmap + toàn bộ note + lịch sử học) và **suy luận kiến trúc** — đúng thế mạnh Claude Code.
- Claude cũng là người **tách PR nhỏ** (có memory, biết đã làm gì) nên việc nó review lại các PR đó là liền mạch.
- Coder agent (codex) **không được review** — đúng nguyên tắc "không agent nào vừa viết vừa tự review code mình" (AGENT-MODEL.md), và tránh lãng phí.

## Quyết định

1. **Claude Code đảm nhận vai Reviewer local** — review mã của Coder agent (codex) **trước merge** trong luồng PR nhỏ, và là **failover #1 cho Copilot gatekeeper** (review MR lớn) khi Copilot hết limit.
2. **codex (Coder) KHÔNG review code/PR** — chỉ code; không tự review PR mình vừa tạo hay PR của người khác. Quy tắc này áp dụng cho **`codex` ở vai Coder tương tác** (branch `codex/nes-XX-...`) — không áp dụng cho **Codex GitHub App connector** (`chatgpt-codex-connector[bot]`, GitHub App tự động), vì connector này không code, chỉ phân tích diff (xem `docs/workflow/REVIEW-MODEL.md`). **agy** (vai đối chứng, thay `opencode` từ 2026-08-20) cũng không phải reviewer chính — xem `docs/workflow/REVIEW-MODEL.md`.
3. **Copilot CLI giữ vai gatekeeper tự động** (lớp review 1, trên GitHub) cho MR lớn; **user là lead reviewer + chỉ user merge** (giữ nguyên).
4. Quyết định 2026-08-13 (PR #24) về việc Claude bỏ vai Reviewer code được **thay thế từ phần này**.

## Các phương án đã cân nhắc

| Phương án                                        | Ưu                                                                      | Nhược                                                                             | Vì sao không chọn                 |
| ------------------------------------------------ | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------- |
| Giữ nguyên Claude = Mentor · PM (như 2026-08-13) | Không phải đảo quyết định cũ                                            | Thiếu người review local; Copilot/Codex/agy ôm hết → đè nặng + tốn token          | Mâu thuẫn mục tiêu multi-reviewer |
| **Claude làm Reviewer local** _(đã chọn)_        | Phân tải đều; tận dụng memory + context lớn; liền mạch với việc tách PR | Thêm một phần workload cho Claude; phải đồng bộ lại các rule cũ                   | —                                 |
| Codex làm reviewer local                         | Code-quality mạnh                                                       | Vai Coder ngược nguyên tắc "không vừa viết vừa tự review"; đã chốt codex chỉ code | Vi phạm nguyên tắc gốc            |

## Hệ quả

**Tích cực:** review được phân tải theo thế mạnh từng agent; Claude review local nhất quán nhờ memory; rulebook per agent minh bạch cho user kiểm chứng.

**Cái giá phải trả:** Claude nhận thêm trách nhiệm review (một phần workload); phải cập nhật lại các quy tắc cũ đang ghi "Claude không review" (`AGENT-MODEL.md`, `.hermes.md`, `CLAUDE.md`).

**Cần làm tiếp:** viết `docs/workflow/REVIEW-MODEL.md`; cập nhật `AGENT-MODEL.md`/`.hermes.md`/`CLAUDE.md` cho khớp; cập nhật bảng danh sách ADR (file `README.md`); EN mirror sang `example/nestjs-training` (bilingual).
