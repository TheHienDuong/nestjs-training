# 🤖 AGENT MODEL — Mô hình nhiều agent phối hợp

> Repo này cố tình dùng **nhiều AI agent với vai trò tách bạch**, thay vì một agent làm tất cả.
> Đây không phải để "cho vui": tách vai là cách duy nhất giữ được giá trị học tập và giá trị review.

## Nguyên tắc gốc

> **Không agent nào vừa viết code vừa tự review code của chính nó.**

Lý do giống hệt lý do team thật không cho tác giả tự approve PR của mình: người vừa viết ra một giải pháp đã "cam kết" với giả định của nó rồi, nên rất khó nhìn ra lỗ hổng trong chính giả định đó. Với AI, hiệu ứng còn mạnh hơn — model sẽ có xu hướng bảo vệ output nó vừa sinh ra.

Nguyên tắc thứ hai, quan trọng với người học:

> **Agent không làm hộ phần hands-on.** Nếu AI viết code thay bạn, cái duy nhất được huấn luyện là AI.

---

## Phân vai

### 🎓 Claude Code — Mentor · PM · Reviewer

| Làm                                                           | Không làm                          |
| ------------------------------------------------------------- | ---------------------------------- |
| Tạo & chia task trên Linear, viết description đầy đủ          | Viết code hands-on thay bạn        |
| Giảng bài, đọc docs mới nhất, cho ví dụ, liên hệ kiến thức cũ | Merge PR thay bạn                  |
| Review PR như senior, quiz kiểm tra hiểu                      | Tự review code do chính nó sinh ra |
| Viết lesson note, ADR, đồng bộ Notion/Slack                   |                                    |

**Vì sao Claude giữ vai mentor:** context window lớn giúp nó nắm được cả roadmap + toàn bộ note + lịch sử học của bạn cùng lúc — đúng thứ một người thầy cần.

### ⚙️ codex — Coder

Nhận issue có nhãn `agent:codex`. **Description trên Linear chính là spec** — nếu spec mơ hồ thì output sẽ mơ hồ, và đó cũng là bài học về cách viết ticket tốt.

```bash
# Giao việc: mở terminal ở thư mục repo, checkout branch riêng trước
git checkout -b codex/nes-12-reference-solution
codex "Đọc AGENTS.md trước. Implement theo spec trong docs/lessons/02-controllers/SPEC.md.
       Chỉ sửa file trong src/. Không sửa docs/ và .github/."
```

Ràng buộc bắt buộc:

- Làm trên **branch riêng** (`codex/...`), không bao giờ commit thẳng vào branch lesson của bạn
- Output **luôn đi qua PR** để Claude review
- Phải đọc `AGENTS.md` trước — file này là hợp đồng chung cho mọi agent

**Cách dùng có ích nhất khi học:** bạn tự làm hands-on trước, _xong xuôi rồi_ mới xem "lời giải tham chiếu" của codex và so sánh. Khác biệt giữa hai bản là bài học đắt giá nhất trong lesson đó.

### 🧪 opencode — Agent đối chứng

Dùng từ Phase 7 trở đi. Giao **cùng một task** cho codex và opencode, rồi so sánh cách hai model tiếp cận. Mục tiêu không phải tìm ra "model nào giỏi hơn" mà là nhận ra: cùng một spec có thể sinh ra nhiều thiết kế hợp lệ, và **bạn** mới là người quyết định chọn cái nào.

---

## Ngữ cảnh dùng chung

Nhiều agent chỉ hợp tác được khi cùng đọc một nguồn ngữ cảnh:

| Nguồn           | Vai trò                                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`AGENTS.md`** | Hợp đồng chung. Mọi agent phải đọc trước khi làm. Chuẩn mở, được codex/opencode/Claude cùng hỗ trợ.                                                     |
| **`CLAUDE.md`** | Chỉ dẫn riêng cho Claude Code (workflow, ranh giới vai trò).                                                                                            |
| **`docs/`**     | Ngữ cảnh dài hạn: roadmap, workflow, ADR, lesson notes.                                                                                                 |
| **serena MCP**  | Điều hướng code theo **symbol** thay vì đọc cả file — tìm định nghĩa, tìm nơi tham chiếu. Tiết kiệm context và chính xác hơn grep khi codebase lớn dần. |
| **`/graphify`** | Dựng knowledge graph từ notes + code. Bật khi qua Phase 3, lúc số note đã đủ nhiều để "hỏi xuyên tài liệu" có ý nghĩa.                                  |

## Ranh giới file (tránh agent giẫm chân nhau)

| Đường dẫn                                       | Ai được sửa                                    |
| ----------------------------------------------- | ---------------------------------------------- |
| `src/**`, `test/**`                             | Bạn (hands-on) · codex (khi được giao rõ ràng) |
| `docs/lessons/**`                               | Claude (soạn) + bạn (bổ sung ghi chú cá nhân)  |
| `docs/adr/**`, `docs/workflow/**`               | Claude, kèm bạn duyệt qua PR                   |
| `.github/**`, `.husky/**`, `docker-compose.yml` | Claude                                         |
| `AGENTS.md`, `CLAUDE.md`                        | Claude, kèm bạn duyệt qua PR                   |

## Nhật ký thử nghiệm agent

Mỗi lần giao việc cho một agent, ghi lại một dòng vào `docs/lessons/_agent-log.md`: task gì, agent nào, kết quả tốt/xấu ở điểm nào. Sau khóa học bạn sẽ có dữ liệu thật để trả lời câu hỏi rất thực tế trong nghề: **việc nào nên giao cho AI, việc nào không.**
