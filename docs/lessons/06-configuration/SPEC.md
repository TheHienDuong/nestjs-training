> ✅ **Verified implementation — execution substitute (2026-08-26):** Thực thi qua PR #82 (`Fixes NES-7`, merge `f496a77`) dưới ngoại lệ user duyệt một lần. Lựa chọn B (`class-validator`, 0 dependency validate mới). Chi tiết bằng chứng: xem disclaimer + mục "✅ Bằng chứng thực thi thay" trong `README.md`.

## 🎯 Mục tiêu học

- [x] Dùng `@nestjs/config` với `ConfigModule.forRoot`
- [x] Validate schema biến môi trường (Joi hoặc class-validator) — app từ chối start nếu thiếu env
- [x] Inject `ConfigService` thay vì đọc `process.env` trực tiếp trong business logic

## 📚 Tài liệu chính thống

- [https://docs.nestjs.com/techniques/configuration](https://docs.nestjs.com/techniques/configuration)

## 🔗 Liên hệ kiến thức cũ

Express + `dotenv`: đọc `process.env.X` rải rác khắp nơi, không ai đảm bảo biến tồn tại ↔ Nest: `ConfigService` tập trung, có validate ngay lúc bootstrap — lỗi thiếu env lộ ra ngay khi start thay vì lúc runtime.

## 🛠 Hands-on

1. `.env.example` đã tồn tại sẵn ở root repo (từ L00) — inspect và tái sử dụng, không tạo file mới. Chỉ thêm biến vào file này nếu hands-on thực sự cần một biến chưa có sẵn. Validate schema chỉ cần cover các biến đang được code hiện tại sử dụng (`NODE_ENV`, `PORT`) — không validate các biến dành cho lesson sau (`DATABASE_URL`, `REDIS_HOST`, JWT, rate limiting).
2. Viết schema validate (Joi hoặc `class-validator`, tự chọn), thử xoá/làm sai một biến để thấy app từ chối start

## ✅ Definition of Done

- [x] Lesson note đầy đủ
- [x] Test pass, quiz pass, PR merged

> Tick dựa trên bằng chứng thực thi thay (PR #82 merged, CI xanh, quiz do Claude Code trả lời thay ở bước closeout) — xem disclaimer đầu file này và trong `README.md`.
