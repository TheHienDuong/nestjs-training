# ADR-0002: Linear là nguồn sự thật cho task, tích hợp native với GitHub và Slack

- **Trạng thái:** Accepted
- **Ngày:** 2026-08-10
- **Người quyết định:** Hien Duong

## Bối cảnh

Dự án học tập này cần một nơi quản lý ~26 lesson với description đầy đủ, phân theo phase, có ưu tiên và estimate. Đồng thời người học muốn làm quen với **công cụ và quy trình mà một team backend thật sự dùng**, chứ không phải một file TODO.

Có 4 hệ thống liên quan: PM tool, GitHub (code + CI), Slack (thông báo), Notion (knowledge base). Rủi ro lớn nhất khi dùng nhiều hệ thống là **thông tin lệch nhau** — task ghi "đang làm" trong khi PR đã merge từ tuần trước.

## Quyết định

1. **Linear là nguồn sự thật duy nhất cho trạng thái task.** Không hệ thống nào khác được coi là chuẩn về việc "lesson này xong chưa".
2. Bật **GitHub integration** và **Slack integration** native của Linear. Trạng thái task chuyển động **do sự kiện git**, không do ai bấm tay:
   - Tạo branch theo tên Linear sinh ra → issue tự sang _In Progress_
   - PR có `Fixes NES-XX` được merge → issue tự sang _Done_
3. Agent chỉ tự động hóa phần integration **không** làm được: viết lesson note, tổng hợp Notion hub, gửi digest học tập.
4. `docs/ROADMAP.md` là bản chiếu (projection) để đọc offline, **không** phải nguồn sự thật.

## Các phương án đã cân nhắc

| Phương án                                   | Ưu                                                                                                                                                                                    | Nhược                                                                                     | Vì sao không chọn                          |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------ |
| **Linear + native integration** _(đã chọn)_ | Mô hình Initiative→Project→Issue→Sub-issue đủ diễn đạt curriculum; cycles cho biết velocity thật; MCP chính thức nên agent tạo/cập nhật được task; integration GitHub/Slack là native | Thêm một tài khoản; free tier có giới hạn                                                 | —                                          |
| **GitHub Issues + Projects v2**             | Không cần công cụ ngoài; gần PR nhất                                                                                                                                                  | Thiếu cycles/estimate chuẩn; không cho trải nghiệm PM tool riêng — thứ mọi công ty đều có | Bỏ mất một phần mục tiêu học tập           |
| **Trello**                                  | Trực quan, dễ bắt đầu                                                                                                                                                                 | Không auto-transition theo PR; không có branch convention; tích hợp nông                  | Sẽ phải cập nhật tay → chắc chắn lệch      |
| **Notion database làm PM**                  | Gộp task + knowledge một chỗ                                                                                                                                                          | Không có git integration đúng nghĩa; Notion mạnh ở tài liệu, không ở issue tracking       | Dùng Notion đúng sở trường: knowledge base |

## Hệ quả

**Tích cực**

- Không có bước "cập nhật task" thủ công → không thể lệch trạng thái. Đây chính là lý do các team thật đầu tư vào integration thay vì kỷ luật cập nhật tay.
- Học được phản xạ quan trọng: **branch name và PR description là dữ liệu, không phải văn bản trang trí**. Viết đúng thì cả hệ thống tự chạy.
- Có số liệu thật về bản thân: mỗi cycle làm được bao nhiêu point, ước lượng lệch bao nhiêu.

**Cái giá phải trả**

- Phụ thuộc vào việc đặt tên branch đúng. Đặt sai → mất tự động hóa, và nhìn bề ngoài không có lỗi gì → khó phát hiện. Đã ghi rõ trong [WORKFLOW.md](../workflow/WORKFLOW.md).
- Linear free tier giới hạn số issue đang mở; nếu chạm giới hạn thì tạo issue theo từng phase thay vì tạo hết một lượt.
- Bốn hệ thống là nhiều với một người học một mình. Chấp nhận, vì trải nghiệm nhiều hệ thống cùng lúc chính là một trong các mục tiêu.

**Cần làm tiếp**

- Bật GitHub + Slack integration trong Linear Settings ngay sau khi tạo repo và channel.
- Skill `/sync-progress` chỉ được làm phần bù, **không** được cập nhật lại thứ integration đã làm — làm cả hai sẽ tạo ra hai nguồn sự thật, đúng thứ ADR này muốn tránh.
