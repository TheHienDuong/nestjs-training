# Postman — test API bằng tay

## Vì sao dùng Postman khi đã có test tự động?

Hai công cụ trả lời hai câu hỏi khác nhau:

|                                    | Trả lời câu hỏi                                         |
| ---------------------------------- | ------------------------------------------------------- |
| **Test tự động** (jest, supertest) | _"Hành vi này có còn đúng sau khi tôi sửa code không?"_ |
| **Postman**                        | _"API này thực tế dùng như thế nào?"_                   |

Postman là nơi bạn **khám phá** API: thử một request, xem response thật, đổi payload, xem lỗi trả về ra sao. Nó cũng là **tài liệu sống** mà bạn gửi cho frontend dev hoặc QA — họ import collection và gọi được API ngay, không cần đọc code.

Trong nghề, collection Postman thường là thứ đầu tiên team frontend hỏi khi bạn xong một endpoint.

## Cấu trúc collection

Collection `NestJS Training API` được tổ chức theo folder, lớn dần theo lộ trình học:

| Folder     | Từ lesson                                       |
| ---------- | ----------------------------------------------- |
| `Health`   | L01 — `GET /`                                   |
| `Tasks`    | L04 — CRUD in-memory, sau đó nối database ở L07 |
| `Auth`     | L12–L15 — register, login, refresh token        |
| `Projects` | Phase 4 — kèm kiểm tra phân quyền owner/member  |
| `Comments` | Phase 4                                         |

## Environment variables

Dùng biến, đừng hardcode URL vào từng request — đổi môi trường chỉ cần đổi một chỗ.

| Biến           | Giá trị local           | Ghi chú                                      |
| -------------- | ----------------------- | -------------------------------------------- |
| `baseUrl`      | `http://localhost:3000` | Đổi khi có API versioning ở L19              |
| `accessToken`  | _(để trống)_            | Request login tự ghi vào biến này (xem dưới) |
| `refreshToken` | _(để trống)_            | Tương tự                                     |

**Mẹo tiết kiệm rất nhiều thời gian:** ở tab _Scripts → Post-response_ của request login, thêm:

```js
const body = pm.response.json();
pm.environment.set('accessToken', body.accessToken);
pm.environment.set('refreshToken', body.refreshToken);
```

Từ đó mọi request chỉ cần đặt Authorization = `Bearer {{accessToken}}` và bạn không phải copy token bằng tay lần nào nữa.

## Quy ước

- Mỗi endpoint nên có **ít nhất 2 request**: một happy path và một case lỗi (`404`, `401`, `422`). Xem lỗi trả về đúng như thiết kế cũng quan trọng như xem thành công.
- Mỗi request nên có **example response** đã lưu — đó chính là phần "tài liệu" của collection.
- Sau khi đổi endpoint, cập nhật collection **trong cùng lesson đó**. Collection lỗi thời tệ hơn không có collection, vì nó khiến người dùng tin vào thông tin sai.

## Liên hệ với các lesson sau

- **L18 (Swagger)** — Nest sẽ tự sinh OpenAPI spec từ decorator. Lúc đó bạn có thể import spec đó vào Postman để tự sinh collection, thay vì tạo request bằng tay. Đây là lý do Swagger đáng đầu tư: một nguồn định nghĩa, nhiều nơi dùng được.
- **L17 (E2E test)** — cùng một request, nhưng chạy tự động và assert kết quả. Postman để khám phá; e2e để bảo vệ.
