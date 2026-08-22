<!--
TEMPLATE LESSON NOTE — copy toàn bộ file này khi mở lesson mới.
Skill /lesson-start sẽ tự làm việc copy + điền phần đầu.
Đừng xoá mục nào: mỗi mục có một lý do sư phạm riêng, ghi trong comment.
-->

# L04 — Modules + Hands-on: CRUD Tasks (in-memory)

|                |                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| **Phase**      | 1 — Nền tảng NestJS                                                                                      |
| **Linear**     | NES-5                                                                                                    |
| **Branch**     | `duongthehien2001/nes-5-l04-modules-crud-tasks`                                                          |
| **Docs chính** | [docs.nestjs.com/modules](https://docs.nestjs.com/modules)                                              |
| **Ngày học**   | 2026-08-22                                                                                                |

---

## 🗂 File map lesson này

> Bản đồ chính xác nhất + đọc từng file code (kèm số dòng): chạy `pnpm lesson <NN>`.
> Bảng này là bản tóm tắt để đọc nhanh; cập nhật khi lesson xong.

| File | Vai trò (lý thuyết / ref / hands-on) | Tạo ở lesson | Trạng thái |
| ---- | ------------------------------------ | ------------ | ---------- |
| ...  | ...                                  | L00          | Mới / Sửa  |

---

## 🎯 Mục tiêu

<!-- 3-5 gạch đầu dòng ĐO ĐƯỢC. "Hiểu về controller" là không đo được.
     "Tự viết được controller có 5 route CRUD, giải thích được @Param vs @Query" là đo được. -->

- [ ] Giải thích được vai trò của `imports` / `exports` / `providers` / `controllers` trong `@Module` và khi nào mỗi field cần dùng.
- [ ] Tách `TasksModule` ra khỏi `AppModule`, `AppModule` chỉ còn `imports: [TasksModule]`.
- [ ] Hoàn thiện đủ 5 route CRUD của Tasks (in-memory) end-to-end, chạy được qua `pnpm start:dev`.
- [ ] Test toàn bộ CRUD bằng Tasks Postman collection, cả 5 route trả đúng status/body.
- [ ] Đọc và tóm tắt được dynamic modules (link roadmap) — chưa cần implement, chỉ cần giải thích khi nào cần.

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

| Kiến thức đã có | Tương ứng trong NestJS | Khác nhau ở đâu |
| --------------- | ---------------------- | --------------- |
| Express: ...    | Nest: ...              | ...             |

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

1. ...

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

- [docs.nestjs.com/modules](https://docs.nestjs.com/modules)
- [docs.nestjs.com/fundamentals/dynamic-modules](https://docs.nestjs.com/fundamentals/dynamic-modules)
