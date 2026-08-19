<!--
SPEC.md — nguồn bàn giao task cho Coder agent (NES-3, L02).
Chỉ Claude được sửa file này (xem docs/adr/0004-mcp-single-writer-cho-coder-agent.md
và docs/workflow/AGENT-MODEL.md). Nội dung sao nguyên từ description issue Linear NES-3.
Nếu issue Linear đổi sau đó, cập nhật lại file này cùng lúc.
-->

# NES-3 — L02 — Controllers & Routing

## 🎯 Mục tiêu học

- [ ] Tự viết được controller với route GET/POST/PATCH/DELETE
- [ ] Phân biệt `@Param`, `@Query`, `@Body`
- [ ] Biết cách set status code, header qua decorator thay vì object `res` của Express

## 📚 Tài liệu chính thống

- [https://docs.nestjs.com/controllers](https://docs.nestjs.com/controllers)

## 🔗 Liên hệ kiến thức cũ

Express: `router.get('/tasks/:id', (req, res) => ...)` ↔ Nest: method trong class có `@Get(':id')`, tham số lấy qua `@Param('id')` thay vì `req.params.id`. Nest ẩn `req`/`res` mặc định — chỉ cần khi thật sự cần full control (`@Res()`).

## 🛠 Hands-on

1. Tạo `TasksController` với route CRUD cơ bản (chưa cần service/DB, trả dữ liệu tĩnh)

## ✅ Definition of Done

- [ ] Lesson note đầy đủ
- [ ] Test pass, quiz pass, PR merged
