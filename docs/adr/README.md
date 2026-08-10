# 📐 Architecture Decision Records (ADR)

## ADR là gì?

Một ADR là **một file markdown ngắn ghi lại một quyết định kỹ thuật quan trọng và lý do đằng sau nó**. Ý tưởng do Michael Nygard đề xuất năm 2011 và giờ là thực hành phổ biến ở các team backend.

## Vì sao một dự án học tập cũng cần ADR?

Vì câu hỏi khó nhất khi quay lại một codebase sau 6 tháng không phải _"code này làm gì?"_ — đọc code là biết. Câu hỏi khó là _**"tại sao lại làm thế này mà không làm cách kia?"**_

Code chỉ ghi lại **kết quả** của một quyết định. Nó không ghi lại các phương án đã bị loại, ràng buộc lúc đó, hay đánh đổi đã chấp nhận. Không có ADR, hai chuyện sẽ xảy ra:

1. Người sau (kể cả chính bạn) đảo ngược một quyết định đúng vì không biết lý do của nó
2. Cả team tranh luận lại đúng vấn đề đã tranh luận xong sáu tháng trước

Với bạn, ADR còn có giá trị riêng: **viết ADR buộc bạn phải diễn đạt được lý do lựa chọn**. Nếu không viết nổi một ADR cho quyết định nào đó, thường là vì bạn chưa thật hiểu tại sao mình chọn nó. Đây là một trong những khác biệt rõ nhất giữa junior và senior — không phải biết nhiều hơn, mà là **biết mình đang đánh đổi cái gì lấy cái gì**.

## Quy ước

- Đặt tên: `NNNN-mo-ta-ngan.md`, số tăng dần, không dùng lại số cũ
- **ADR là bất biến (immutable):** đã merge thì không sửa nội dung. Đổi ý thì viết ADR mới và đánh dấu ADR cũ là `Superseded by ADR-NNNN`
- Trạng thái: `Proposed` → `Accepted` → `Deprecated` / `Superseded`
- Ngắn thôi: một trang là đủ

## Danh sách

| #                                             | Quyết định                                                         | Trạng thái |
| --------------------------------------------- | ------------------------------------------------------------------ | ---------- |
| [0001](0001-chon-prisma-lam-orm.md)           | Chọn Prisma làm ORM thay vì TypeORM                                | Accepted   |
| [0002](0002-linear-lam-nguon-su-that.md)      | Linear là nguồn sự thật cho task, tích hợp native với GitHub/Slack | Accepted   |
| [0003](0003-trunk-based-mot-lesson-mot-pr.md) | Trunk-based development: một lesson một PR                         | Accepted   |

## Template

Copy khối này khi viết ADR mới:

```markdown
# ADR-NNNN: <Tiêu đề ở thể mệnh lệnh>

- **Trạng thái:** Proposed | Accepted | Deprecated | Superseded by ADR-XXXX
- **Ngày:** YYYY-MM-DD
- **Người quyết định:** <tên>

## Bối cảnh

Tình huống và ràng buộc dẫn tới việc phải quyết định. Có vấn đề gì cần giải?

## Quyết định

Chúng ta sẽ làm gì. Viết dứt khoát, ở thể chủ động.

## Các phương án đã cân nhắc

| Phương án | Ưu  | Nhược | Vì sao không chọn |
| --------- | --- | ----- | ----------------- |

## Hệ quả

**Tích cực:** ...
**Tiêu cực / cái giá phải trả:** ...
**Cần làm tiếp:** ...
```
