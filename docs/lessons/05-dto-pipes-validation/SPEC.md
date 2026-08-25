<!--
SPEC.md — nguồn bàn giao task cho Coder agent (NES-6, L05).
Chỉ Claude được sửa file này (xem docs/adr/0004-mcp-single-writer-cho-coder-agent.md
và docs/workflow/AGENT-MODEL.md). Phần "Bản chiếu từ Linear" sao nguyên từ description
issue Linear NES-6. Nếu issue Linear đổi sau đó, cập nhật lại file này cùng lúc.
-->

# NES-6 — L05 — DTO + Pipes + ValidationPipe

| Trường     | Giá trị                                                                                         |
| ---------- | ----------------------------------------------------------------------------------------------- |
| Issue      | [NES-6](https://linear.app/food-ordering-api/issue/NES-6/l05-dto-pipes-validationpipe)          |
| Project    | Phase 2 — Working with Data                                                                     |
| Labels     | `hands-on`, `phase-2`                                                                           |
| Priority   | Medium · Estimate 2 points                                                                      |
| Branch     | `duongthehien2001/nes-6-l05-dto-pipes-validationpipe`                                           |
| Sub-issues | NES-57 Theory & note · NES-60 Hands-on · NES-65 Review & quiz (đều còn ở Backlog khi mở lesson) |

---

## Phần A — Bản chiếu từ Linear (nguyên văn description NES-6)

### 🎯 Mục tiêu học

- [ ] Viết DTO với `class-validator` + `class-transformer`
- [ ] Bật `ValidationPipe` toàn cục, hiểu `whitelist`/`forbidNonWhitelisted`/`transform`
- [ ] Tự viết một Pipe tuỳ chỉnh đơn giản

### 📚 Tài liệu chính thống

- [https://docs.nestjs.com/techniques/validation](https://docs.nestjs.com/techniques/validation)
- [https://docs.nestjs.com/pipes](https://docs.nestjs.com/pipes)

### 🔗 Liên hệ kiến thức cũ

Express: validate tay bằng `if (!body.title) throw ...` hoặc middleware `joi`/`zod` riêng ↔ Nest: khai báo rule ngay trên DTO bằng decorator, Pipe tự chạy trước khi vào handler — validate trở thành khai báo (declarative) thay vì mệnh lệnh (imperative).

### 🛠 Hands-on

1. Tạo `CreateTaskDto`/`UpdateTaskDto` với validation rule hợp lý (title bắt buộc, status là enum...)
2. Bật `ValidationPipe` global trong `main.ts`

### ✅ Definition of Done

- [ ] Lesson note đầy đủ
- [ ] Test pass (kể cả case DTO invalid trả 400), quiz pass, PR merged

---

## Phần B — Acceptance criteria (Claude diễn giải từ Phần A, khớp trạng thái repo hiện tại)

> Phần B **không** có trong description Linear. Đây là bản chi tiết hoá để reference implementation có tiêu chí kiểm chứng được. Nếu lệch với Phần A thì Phần A thắng.

**AC1 — Dependency.** `class-validator` (hiện tại `0.15.1`) và `class-transformer` (`0.5.1`) nằm trong `dependencies` của `package.json`, cài bằng **pnpm**, `pnpm-lock.yaml` được cập nhật cùng commit. Repo hiện **chưa** có 2 package này.

**AC2 — `CreateTaskDto`.** `src/tasks/dto/create-task.dto.ts`: `title` bắt buộc, là string, không rỗng (kể cả chuỗi toàn khoảng trắng), có giới hạn độ dài hợp lý. Không có field nào khác được chấp nhận.

**AC3 — `UpdateTaskDto`.** `src/tasks/dto/update-task.dto.ts`: mọi field optional (`title?`, `completed?`), `completed` phải là boolean thật, `title` áp cùng rule với AC2 khi có mặt. Giữ hành vi PATCH hiện tại (body rỗng không làm hỏng task).

**AC4 — `ValidationPipe` toàn cục.** Bật với `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`, và phải có hiệu lực ở **cả** runtime lẫn e2e test.

> ⚠️ Ràng buộc thật của repo: `test/*.e2e-spec.ts` dựng app bằng `Test.createTestingModule(...).createNestApplication()`, **không** chạy code trong `src/main.ts`. Nếu chỉ gọi `app.useGlobalPipes()` trong `main.ts` thì e2e không có validation và test 400 ở AC7 sẽ fail. Chọn **một** phương án và ghi lý do trong PR: (a) đăng ký qua provider `APP_PIPE` trong `AppModule`; (b) giữ `main.ts` và thêm đúng cấu hình đó vào từng e2e setup.

**AC5 — Value import cho DTO.** `src/tasks/tasks.controller.ts` hiện dùng `import type { CreateTaskDto }` / `import type { UpdateTaskDto }`. Type-only import bị xoá lúc compile → `metatype` mất → `ValidationPipe` bỏ qua DTO. Phải đổi sang value import. Cùng vấn đề ở `src/users/users.controller.ts` nếu chạm tới.

**AC6 — Custom pipe.** Một pipe tự viết đơn giản: class có `@Injectable()`, implement `PipeTransform`, ném `BadRequestException` khi input sai, bind ở đúng scope (param hoặc method — không cần global), có unit test `*.spec.ts` đặt cạnh file nguồn.

**AC7 — Test, bắt buộc gồm case DTO invalid → HTTP 400.**

- `POST /tasks` body `{}` → **400**, `message` là mảng chứa lỗi của `title`.
- `POST /tasks` body `{ "title": "" }` (và biến thể toàn khoảng trắng) → **400**.
- `POST /tasks` body `{ "title": "ok", "hacker": true }` → **400** khi bật `forbidNonWhitelisted` (nếu chọn chỉ `whitelist` thì phải là **201** + field lạ bị strip; test phải khớp đúng cấu hình đã chọn ở AC4).
- `PATCH /tasks/:id` body `{ "completed": "yes" }` → **400**.
- `GET /tasks/abc` → **400** (regression cho `ParseIntPipe` đã có từ L02/L04).
- Unit test custom pipe: input hợp lệ trả giá trị đã transform; input sai ném `BadRequestException`.
- Toàn bộ test CRUD hiện có (`test/tasks.e2e-spec.ts`, `test/users.e2e-spec.ts`, `src/**/*.spec.ts`) vẫn pass.

**AC8 — Quality gate.** `pnpm verify` xanh (lint `--max-warnings=0` + prettier check + jest + build). E2E chạy riêng bằng `pnpm test:e2e`.

**AC9 — Không đổi contract sẵn có.** Response của Task giữ shape `{ id, title, completed }`; `GET /tasks` giữ header `Cache-Control: no-store`; `DELETE` giữ 204.

### Điểm cần user quyết định trước khi code

Phần A viết _"title bắt buộc, status là enum..."_ nhưng model hiện tại trong `src/tasks/tasks.service.ts` là `completed: boolean`, và `test/tasks.e2e-spec.ts` + Postman collection đang bám theo shape đó.

- **Mặc định của SPEC này:** giữ `completed: boolean` và validate bằng `@IsBoolean()` — coi "status là enum" trong Phần A là ví dụ minh hoạ về "rule hợp lý", không phải yêu cầu đổi model.
- **Nếu user muốn có enum thật:** đó là một thay đổi contract (thêm `TaskStatus`), phải cập nhật service, e2e test và Postman collection cùng lúc → nêu rõ trong PR, không làm ngầm.

## Phần C — Ranh giới cho reference implementation (coder agent)

- Chỉ sửa `src/**`, `test/**`, và `package.json` + `pnpm-lock.yaml` (**chỉ** để thêm `class-validator` + `class-transformer`).
- **Không** sửa `docs/**` (kể cả file SPEC này), `.github/**`, `.husky/**`, `postman/**` — trừ khi user quyết định đổi contract theo mục trên.
- File mới phải có header comment `// [NES-6 · lesson 05] <vai trò file>`.
- **Giữ nguyên teaching comment** đang có trong `src/tasks/**` và `src/users/**` — bài học từ PR #60: xoá comment giảng dạy làm mất giá trị dạy học của `main`.
- Branch riêng `codex/nes-6-...`, output đi qua PR có dòng `Fixes NES-6`; **không** tự review PR của mình, **không** merge.
- Reference implementation chỉ được làm **sau khi** user đã tự xong hands-on (NES-60) — đây là lời giải để đối chiếu, không phải để thay thế.
