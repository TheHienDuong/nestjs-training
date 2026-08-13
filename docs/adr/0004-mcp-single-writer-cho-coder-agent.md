# ADR-0004: Claude Code là single-writer cho Notion/Slack/Postman; Linear mở cho coder agent; coder agent nhận SPEC.md

- **Trạng thái:** Accepted (amended 2026-08-13)
- **Ngày:** 2026-08-11
- **Người quyết định:** Hien Duong

## Bối cảnh

Dự án tách 2 vai: Claude Code giữ cố định vai Mentor·PM·Reviewer; vai **Coder** linh hoạt, chủ yếu là **codex**, thỉnh thoảng thay/thêm bằng tool khác (**opencode**, hoặc opencode chạy model DeepSeek qua provider `opencode-go`...). Các CLI agent này đều hỗ trợ tự cấu hình MCP server (Linear, Notion, Slack...) y hệt cách Claude Code đang dùng.

Nếu mỗi agent tự nối vào Linear/Notion/Slack để đọc **và ghi**, rủi ro thật: hai agent cùng đổi trạng thái một issue, Slack nhận thông báo trùng từ nhiều nguồn, Notion note bị agent này ghi đè agent kia. Đây đúng là vấn đề "nhiều nguồn sự thật" mà [ADR-0002](0002-linear-lam-nguon-su-that.md) đã né bằng cách chọn Linear làm nguồn sự thật duy nhất — nhưng ADR-0002 chưa nói tới việc có nhiều _agent_, chỉ nói tới nhiều _hệ thống_.

## Quyết định

1. **Linear mở cho cả Claude Code (vai PM) và coder agent (codex)** — coder được phép tự cấu hình Linear MCP để đọc, tạo và track task của chính mình. **Notion, Slack, Postman vẫn single-writer = Claude Code**; bất kỳ tool nào giữ vai Coder không được cấu hình 3 MCP server này — không cần, vì không đóng vai PM.
2. Bàn giao spec cho vai Coder qua một **file tĩnh**: `docs/lessons/XX-ten-lesson/SPEC.md`, được Claude Code sinh ra ở bước `/lesson-start` bằng cách copy nguyên description của issue Linear tương ứng. Cơ chế này giữ nguyên dù Linear đã mở cho coder — SPEC.md vẫn là bản chiếu cho task **học** mà Claude giao, coder không sửa `SPEC.md`.
3. Coder agent đọc `SPEC.md` + `AGENTS.md` trước khi làm. Với Linear, coder được tự truy vấn để đọc/tạo/track **task của chính mình**, nhưng **không tự truy vấn hoặc sửa** issue nằm ngoài phạm vi được giao.
4. `SPEC.md` là bản chiếu tại một thời điểm (giống vai trò của `ROADMAP.md` với Linear theo ADR-0002), **không phải nguồn sự thật**. Nếu issue Linear đổi sau khi đã tạo `SPEC.md`, Claude Code cập nhật lại file khi phát hiện lệch — không agent nào khác được sửa `SPEC.md`.
5. Vai Coder là **linh hoạt theo tool**, không phải danh sách cố định: mỗi tool lấp vai này dùng branch riêng đặt tên theo chính tool đó (`codex/...`, `opencode/...`, v.v.) để nhật ký so sánh (`docs/lessons/_agent-log.md`) phân biệt được lời giải đến từ tool/model nào — không cần quy tắc riêng cho từng tool mới.
6. **Nguyên tắc chống xung đột ghi trên Linear:** coder agent **không** được đổi trạng thái hoặc assignee của issue đang trong vòng review của Claude Code; **không** được sửa issue do Claude tạo cho mục đích PM (lesson note, quiz, ADR tracking). Coder chỉ được ghi trên issue thuộc task của chính mình (task nó tạo hoặc được giao rõ ràng).

## Các phương án đã cân nhắc

| Phương án                                          | Ưu                                                                                                              | Nhược                                                                                                             | Vì sao không chọn                                                             |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Single-writer + SPEC.md** _(đã chọn)_            | Không thể xảy ra ghi chồng; onboarding một agent mới chỉ cần dạy nó đọc `SPEC.md`, không cần cấp thêm token nào | Có bước thủ công: Claude phải tạo/cập nhật `SPEC.md`                                                              | —                                                                             |
| Mọi agent đều nối full MCP                         | Coder agent tự tra được issue mới nhất, không lệch                                                              | Race condition thật khi ghi; phải cấp và quản lý credential cho từng agent, tăng bề mặt rủi ro                    | Đổi lấy một tiện lợi nhỏ (khỏi copy file) lấy một rủi ro lớn (state xung đột) |
| Chia sẻ một token Linear read-only cho coder agent | Đọc trực tiếp, không cần file trung gian                                                                        | MCP OAuth của Linear không cho scope "chỉ đọc" ở mức phân quyền theo tool; vẫn phải cấu hình riêng cho từng agent | Không giảm được việc cấu hình, lại vẫn có thể ghi nhầm                        |
| Dán tay spec vào prompt mỗi lần gọi agent          | Không cần file, không cần quy ước                                                                               | Dễ copy thiếu, không có bản ghi lại, không tái dùng được giữa các lần gọi agent trong cùng lesson                 | Không bền, không audit được                                                   |

## Hệ quả

**Tích cực**

- Không có nguồn ghi xung đột vào Notion/Slack/Postman — đúng tinh thần ADR-0002 mở rộng sang nhiều agent. Với Linear, ranh giới ghi chồng được giữ bằng quy tắc ở mục Quyết định #6 (coder không đụng issue thuộc vòng review/PM của Claude) thay vì bằng việc cấm hoàn toàn.
- Thêm một coder agent mới (agent thứ 6, thứ 7...) không cần xin thêm quyền gì — chỉ cần nó đọc được file text và `AGENTS.md`.
- `SPEC.md` là artifact cố định trong Git, nên **agent log** (`docs/lessons/_agent-log.md`) so sánh công bằng: mọi agent nhận đúng cùng một spec tại đúng một thời điểm.

**Tiêu cực / cái giá phải trả**

- Nếu Claude Code quên cập nhật `SPEC.md` sau khi issue Linear đổi, coder agent sẽ làm theo spec cũ. Rủi ro thấp vì lesson hiếm khi đổi mục tiêu giữa chừng.
- Thêm một file nữa mỗi lesson — chấp nhận được, cùng chi phí với `README.md` đã có.

**Cần làm tiếp**

- Cập nhật skill `/lesson-start` để sinh `SPEC.md` ở bước scaffold.
- Cập nhật `AGENTS.md` và `docs/workflow/AGENT-MODEL.md` để agent nào đọc vào cũng hiểu đúng ranh giới này.

## Lịch sử amend

- **2026-08-13** — Hien Duong quyết định mở Linear cho coder agent (codex): sau một thời gian đánh giá, codex hoạt động tốt với Linear MCP (tự đọc, tạo và track task của mình mà không gây ghi chồng). Claude Code chuyển từ single-writer cho Linear sang giữ vai review — vẫn là single-writer cho Notion/Slack/Postman, vẫn là nơi sinh và cập nhật `SPEC.md`. Xem NES-111.
