# ADR-0004: Claude Code là single-writer cho Linear/Notion/Slack; coder agent chỉ nhận SPEC.md

- **Trạng thái:** Accepted
- **Ngày:** 2026-08-11
- **Người quyết định:** Hien Duong

## Bối cảnh

Dự án tách 2 vai: Claude Code giữ cố định vai Mentor·PM·Reviewer; vai **Coder** linh hoạt, chủ yếu là **codex**, thỉnh thoảng thay/thêm bằng tool khác (**opencode**, hoặc opencode chạy model DeepSeek qua provider `opencode-go`...). Các CLI agent này đều hỗ trợ tự cấu hình MCP server (Linear, Notion, Slack...) y hệt cách Claude Code đang dùng.

Nếu mỗi agent tự nối vào Linear/Notion/Slack để đọc **và ghi**, rủi ro thật: hai agent cùng đổi trạng thái một issue, Slack nhận thông báo trùng từ nhiều nguồn, Notion note bị agent này ghi đè agent kia. Đây đúng là vấn đề "nhiều nguồn sự thật" mà [ADR-0002](0002-linear-lam-nguon-su-that.md) đã né bằng cách chọn Linear làm nguồn sự thật duy nhất — nhưng ADR-0002 chưa nói tới việc có nhiều _agent_, chỉ nói tới nhiều _hệ thống_.

## Quyết định

1. **Chỉ Claude Code giữ kết nối MCP tới Linear, Notion, Slack, Postman.** Bất kỳ tool nào đang giữ vai Coder không được cấu hình các MCP server này — không cần, vì không đóng vai PM.
2. Bàn giao spec cho vai Coder qua một **file tĩnh**: `docs/lessons/XX-ten-lesson/SPEC.md`, được Claude Code sinh ra ở bước `/lesson-start` bằng cách copy nguyên description của issue Linear tương ứng.
3. Coder agent chỉ đọc `SPEC.md` + `AGENTS.md` trước khi làm — **không tự truy vấn Linear**.
4. `SPEC.md` là bản chiếu tại một thời điểm (giống vai trò của `ROADMAP.md` với Linear theo ADR-0002), **không phải nguồn sự thật**. Nếu issue Linear đổi sau khi đã tạo `SPEC.md`, Claude Code cập nhật lại file khi phát hiện lệch — không agent nào khác được sửa `SPEC.md`.
5. Vai Coder là **linh hoạt theo tool**, không phải danh sách cố định: mỗi tool lấp vai này dùng branch riêng đặt tên theo chính tool đó (`codex/...`, `opencode/...`, v.v.) để nhật ký so sánh (`docs/lessons/_agent-log.md`) phân biệt được lời giải đến từ tool/model nào — không cần quy tắc riêng cho từng tool mới.

## Các phương án đã cân nhắc

| Phương án                                          | Ưu                                                                                                              | Nhược                                                                                                             | Vì sao không chọn                                                             |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Single-writer + SPEC.md** _(đã chọn)_            | Không thể xảy ra ghi chồng; onboarding một agent mới chỉ cần dạy nó đọc `SPEC.md`, không cần cấp thêm token nào | Có bước thủ công: Claude phải tạo/cập nhật `SPEC.md`                                                              | —                                                                             |
| Mọi agent đều nối full MCP                         | Coder agent tự tra được issue mới nhất, không lệch                                                              | Race condition thật khi ghi; phải cấp và quản lý credential cho từng agent, tăng bề mặt rủi ro                    | Đổi lấy một tiện lợi nhỏ (khỏi copy file) lấy một rủi ro lớn (state xung đột) |
| Chia sẻ một token Linear read-only cho coder agent | Đọc trực tiếp, không cần file trung gian                                                                        | MCP OAuth của Linear không cho scope "chỉ đọc" ở mức phân quyền theo tool; vẫn phải cấu hình riêng cho từng agent | Không giảm được việc cấu hình, lại vẫn có thể ghi nhầm                        |
| Dán tay spec vào prompt mỗi lần gọi agent          | Không cần file, không cần quy ước                                                                               | Dễ copy thiếu, không có bản ghi lại, không tái dùng được giữa các lần gọi agent trong cùng lesson                 | Không bền, không audit được                                                   |

## Hệ quả

**Tích cực**

- Không có nguồn ghi xung đột vào Linear/Notion/Slack — đúng tinh thần ADR-0002 mở rộng sang nhiều agent.
- Thêm một coder agent mới (agent thứ 6, thứ 7...) không cần xin thêm quyền gì — chỉ cần nó đọc được file text và `AGENTS.md`.
- `SPEC.md` là artifact cố định trong Git, nên **agent log** (`docs/lessons/_agent-log.md`) so sánh công bằng: mọi agent nhận đúng cùng một spec tại đúng một thời điểm.

**Tiêu cực / cái giá phải trả**

- Nếu Claude Code quên cập nhật `SPEC.md` sau khi issue Linear đổi, coder agent sẽ làm theo spec cũ. Rủi ro thấp vì lesson hiếm khi đổi mục tiêu giữa chừng.
- Thêm một file nữa mỗi lesson — chấp nhận được, cùng chi phí với `README.md` đã có.

**Cần làm tiếp**

- Cập nhật skill `/lesson-start` để sinh `SPEC.md` ở bước scaffold.
- Cập nhật `AGENTS.md` và `docs/workflow/AGENT-MODEL.md` để agent nào đọc vào cũng hiểu đúng ranh giới này.
