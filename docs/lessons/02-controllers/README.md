<!--
TEMPLATE LESSON NOTE — copy toàn bộ file này khi mở lesson mới.
Skill /lesson-start sẽ tự làm việc copy + điền phần đầu.
Đừng xoá mục nào: mỗi mục có một lý do sư phạm riêng, ghi trong comment.
-->

# L02 — Controllers & Routing

|                |                                                     |
| -------------- | --------------------------------------------------- |
| **Phase**      | 1 — Foundations                                     |
| **Linear**     | NES-3                                               |
| **Branch**     | `duongthehien2001/nes-3-l02-controllers-routing`    |
| **Docs chính** | [/controllers](https://docs.nestjs.com/controllers) |
| **Ngày học**   | 2026-08-17                                          |

---

## 🎯 Mục tiêu

<!-- 3-5 gạch đầu dòng ĐO ĐƯỢC. "Hiểu về controller" là không đo được.
     "Tự viết được controller có 5 route CRUD, giải thích được @Param vs @Query" là đo được. -->

- [ ] Tự viết được controller với route GET/POST/PATCH/DELETE
- [ ] Phân biệt `@Param`, `@Query`, `@Body`
- [ ] Biết cách set status code, header qua decorator thay vì object `res` của Express

## 📚 Lý thuyết

<!-- Giải thích bằng tiếng Việt, theo thứ tự: VẤN ĐỀ trước, GIẢI PHÁP sau.
     Mỗi khái niệm phải có link tới đúng mục docs gốc để tra lại được.
     Tránh dịch máy docs — viết như đang giảng cho người ngồi cạnh. -->

### Khái niệm 1: ...

**Vấn đề nó giải quyết:** ...

**Cách Nest làm:** ...

**Khi nào KHÔNG nên dùng:** ...

> 📖 Nguồn: <link>

---

## 🔗 Liên hệ kiến thức cũ

<!-- Mục quan trọng nhất của cả note. Học nhanh = neo kiến thức mới vào cái đã biết.
     Luôn đối chiếu với: Express, Prisma, hexagonal architecture. -->

| Kiến thức đã có                                        | Tương ứng trong NestJS                    | Khác nhau ở đâu                                                                                                                        |
| ------------------------------------------------------ | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Express: `router.get('/tasks/:id', (req, res) => ...)` | Nest: method trong class có `@Get(':id')` | Tham số lấy qua `@Param('id')` thay vì `req.params.id`; Nest ẩn `req`/`res` mặc định — chỉ cần khi thật sự cần full control (`@Res()`) |

**Điều tôi từng hiểu sai:** <viết ra ngay khi phát hiện — đây là phần bạn sẽ đọc lại nhiều nhất>

---

## 💻 Ví dụ có giải thích

<!-- Mỗi ví dụ: code CHẠY ĐƯỢC + giải thích từng dòng quan trọng + link nguồn.
     Không copy nguyên docs: sửa lại theo domain Task Management của dự án. -->

### Ví dụ 1: ...

```ts
// file: src/...
```

**Giải thích:**

- Dòng `...`: ...

> 📖 Dựa trên: <link docs hoặc link repo tham khảo>

---

## 🛠 Hands-on

<!-- BẠN tự code phần này. Agent không làm hộ. -->

**Yêu cầu:**

1. Tạo `TasksController` với route CRUD cơ bản (chưa cần service/DB, trả dữ liệu tĩnh)

**Cách kiểm tra:**

```bash
pnpm start:dev
curl ...
```

**Vướng ở đâu, gỡ thế nào:**

- ...

---

## ✅ Ôn tập & Quiz

<!-- Điền sau bước /lesson-review. Trả lời bằng lời của mình, KHÔNG copy đáp án.
     Nếu không tự trả lời được thì lesson chưa xong — quay lại phần Lý thuyết. -->

1. **Hỏi:** ...
   **Trả lời:** ...

**Ôn lại lesson trước:** <một câu nối kiến thức lesson này với lesson trước>

---

## 🧠 Điểm cần nhớ

<!-- Tối đa 5 dòng. Đây là phần bạn sẽ đọc lại khi ôn nhanh trước phỏng vấn. -->

1. ...

---

## 📎 Nguồn

<!-- Mọi link đã dùng. Nguồn chính thống lên đầu. -->

- [docs.nestjs.com/controllers](https://docs.nestjs.com/controllers)
- [nestjs/nest — sample/...](https://github.com/nestjs/nest/tree/master/sample)
