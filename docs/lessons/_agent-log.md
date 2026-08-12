# 🤖 Nhật ký giao việc cho agent

> Mỗi lần giao việc cho một AI agent, ghi lại một dòng. Sau khoá học bạn sẽ có **dữ liệu thật của chính mình** để trả lời một câu hỏi rất thực tế trong nghề: _việc nào nên giao cho AI, việc nào tự làm thì học được nhiều hơn?_
>
> Ghi cả lần thất bại. Những dòng "kết quả kém" là những dòng có giá trị nhất.

| Ngày       | Lesson | Agent       | Việc được giao                                                                                                | Kết quả | Nhận xét                                                                                                                                                                                                                                                                                                                                                                     |
| ---------- | ------ | ----------- | ------------------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-10 | L00    | Claude Code | Dựng toàn bộ hạ tầng Phase 0: docs, ADR, CI, husky/commitlint, docker-compose, 4 skill, lesson note L00 + L01 | ✅ Tốt  | Việc "dựng khung + viết tài liệu" là loại việc agent làm tốt: có chuẩn rõ, khối lượng lớn, ít cần phán đoán nghiệp vụ. Đáng chú ý: agent tra URL docs từ repo nguồn `nestjs/docs.nestjs.com` thay vì tin trí nhớ — sau đó phát hiện `/middleware` ứng với file `middlewares.md`, và vài đường dẫn trong plan ban đầu là sai. Bài học: **bắt agent dẫn nguồn thì lỗi lộ ra**. |
| 2026-08-11 | L00    | codex       | Fix format docs + đóng lỗ hổng prettier check scope (PR #13) — dispatch bởi Hermes orchestrator               | ✅ Tốt  | Làm đúng scope, verify pass trước khi commit, hooks chạy đủ. Bài học: (1) `codex exec` KHÔNG tự thêm `Co-authored-by: Codex` — phải thêm tay; (2) sandbox `workspace-write` chặn commit (`.git/worktrees/.../index.lock: Operation not permitted`) → task có commit phải dùng `--sandbox danger-full-access` ngay từ đầu.                                                    |

## Gợi ý cách phân loại kết quả

| Ký hiệu                              | Nghĩa                                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------------- |
| ✅ Tốt                               | Dùng được gần như nguyên vẹn                                                          |
| 🟡 Phải sửa nhiều                    | Đúng hướng nhưng chi tiết sai/không idiomatic                                         |
| 🔴 Kém                               | Sai hướng, sửa lâu hơn tự làm                                                         |
| 🎓 Tôi học được nhiều hơn khi tự làm | Kể cả khi output của agent tốt — đây là ghi chú quan trọng nhất cho một dự án học tập |
