# ADR-0003: Trunk-based development — một lesson một PR, squash merge

- **Trạng thái:** Accepted (quyết định #5 được thay thế bởi [ADR-0005](0005-coder-agent-mo-pr-rieng-vao-main.md))
- **Ngày:** 2026-08-10
- **Người quyết định:** Hien Duong

## Bối cảnh

Cần chọn một chiến lược nhánh (branching strategy). Ba mô hình phổ biến:

- **Git Flow** — `main` + `develop` + `feature/*` + `release/*` + `hotfix/*`
- **GitHub Flow** — `main` + nhánh ngắn hạn, merge liên tục
- **Trunk-based** — `main` là trunk, nhánh sống rất ngắn (dưới vài ngày)

Ràng buộc: một người làm, mỗi lesson là một đơn vị công việc độc lập và cần được **review trước khi vào `main`** (vì review là một phần của việc học, không phải thủ tục).

Repo còn cần điều kiện kỹ thuật riêng: Linear cần một PR mỗi issue để tự chuyển trạng thái, và lịch sử `main` nên đọc được như một dòng thời gian học tập.

## Quyết định

1. **Trunk-based:** chỉ có `main` là nhánh dài hạn. Không có `develop`.
2. **Một lesson = một branch = một PR.** Tên branch lấy từ Linear (`hien/nes-XX-...`).
3. **Squash and merge** — mỗi lesson để lại đúng một commit trên `main`.
4. **Branch protection trên `main`:** cấm push trực tiếp, bắt buộc PR, bắt buộc CI xanh.
5. Nhánh của agent (`codex/...`) merge vào **branch lesson**, không merge trực tiếp vào `main`.

## Các phương án đã cân nhắc

| Phương án                            | Ưu                                                                                                             | Nhược                                                                                          | Vì sao không chọn                             |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------- |
| **Trunk-based + squash** _(đã chọn)_ | `main` luôn chạy được; lịch sử sạch — `git log` đọc ra đúng lộ trình học; nhánh ngắn nên không có conflict lớn | Mất commit chi tiết bên trong lesson sau khi squash                                            | —                                             |
| **Git Flow**                         | Chuẩn cho phần mềm có nhiều bản release song song                                                              | Quá nhiều nhánh cho một người; `develop` + `main` không giải quyết vấn đề gì ở đây             | Overhead không đổi lại được gì                |
| **Commit thẳng vào `main`**          | Nhanh nhất                                                                                                     | Không có PR → không có review → mất hẳn bước 4 của workflow; Linear không tự chuyển trạng thái | Bỏ mất chính phần có giá trị học tập cao nhất |
| **Merge commit thay vì squash**      | Giữ lại mọi commit chi tiết                                                                                    | Lịch sử `main` lẫn commit "wip", "fix typo"                                                    | Ưu tiên `main` đọc được như tài liệu          |

## Hệ quả

**Tích cực**

- `git log --oneline` trên `main` chính là bản ghi lộ trình học: mỗi dòng một lesson.
- Branch protection tạo ra một hàng rào thật — bạn sẽ _bị chặn_ khi làm sai, và cảm giác bị chặn dạy nhanh hơn đọc quy tắc.
- Nhánh sống ngắn nên hầu như không phải xử lý merge conflict phức tạp — đúng lý do các team lớn chuyển sang trunk-based.

**Cái giá phải trả**

- Squash làm mất commit chi tiết trong lesson. Chấp nhận: quá trình dò dẫm bên trong một lesson được ghi lại ở **lesson note**, chỗ đó có ích hơn git history.
- Branch protection nghĩa là chính bạn cũng không push được vào `main`. Sẽ có lúc thấy bất tiện — đó là dụng ý, và cũng là thực tế ở mọi công ty.

**Cần làm tiếp**

- Bật branch protection sau khi PR đầu tiên đã merge (cần có ít nhất một lần CI chạy để chọn được required status check).
- Vì làm một mình, **không** bật "require approval từ người khác" — sẽ tự chặn chính mình. Hàng rào ở đây là _CI xanh_ + bước `/lesson-review`.
