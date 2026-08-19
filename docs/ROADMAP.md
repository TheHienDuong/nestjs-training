# 🗺️ ROADMAP — NestJS Mastery

> **Nguồn sự thật về task:** Linear (project `NestJS Mastery`).
> File này là bản đồ tổng thể để đọc offline + theo dõi tiến độ trong repo.
> Cập nhật bởi skill `/sync-progress` sau mỗi lesson.

## Sản phẩm cuối khóa

Một **Task Management API** production-grade viết bằng NestJS 11:

- `User` — đăng ký, đăng nhập, JWT + refresh token, phân quyền theo role
- `Project` — người dùng sở hữu project, mời thành viên (quan hệ n-n qua bảng trung gian)
- `Task` — thuộc project, có assignee, status, priority, due date
- `Comment` — bình luận trên task

Kèm theo: validation đầu vào, xử lý lỗi tập trung, logging, Swagger docs, API versioning, cache Redis, health check, unit + e2e test có coverage threshold, CI tự động, chạy được bằng `docker compose`.

## Quy ước đọc bảng

| Cột            | Ý nghĩa                                                                                 |
| -------------- | --------------------------------------------------------------------------------------- |
| **L**          | Mã lesson (L00–L25)                                                                     |
| **Trạng thái** | ⬜ Chưa bắt đầu · 🟦 Đang học · ✅ Hoàn thành                                           |
| **Docs**       | Link tài liệu chính thống — **luôn đọc bản mới nhất trên web, không học từ file cache** |

Mọi link `docs.nestjs.com/...` dưới đây đã được đối chiếu với routing thật của repo `nestjs/docs.nestjs.com`.

---

## Phase 0 — Setup & Professional Workflow

> **Mục tiêu:** Dựng môi trường làm việc như một dự án thật trước khi viết dòng code nghiệp vụ đầu tiên. Bản thân việc setup là bài học.

| L   | Lesson                                                         | Trạng thái | Docs / Nguồn                                                                 |
| --- | -------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------- |
| L00 | Setup dự án, Linear/GitHub/Slack/CI/Docker, quy trình làm việc | ✅         | [Lesson note](lessons/00-setup/README.md) · [WORKFLOW](workflow/WORKFLOW.md) |

---

## Phase 1 — Foundations

> **Mục tiêu:** Hiểu 3 khối xây dựng của Nest (Module / Controller / Provider) và cơ chế Dependency Injection — thứ khác biệt lớn nhất so với Express.

| L   | Lesson                                                               | Trạng thái | Docs                                                                                                                                                                                                                                |
| --- | -------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L01 | Cấu trúc project & bootstrap (`main.ts`, platform adapter)           | 🟦         | [/first-steps](https://docs.nestjs.com/first-steps) · [/fundamentals/platform-agnosticism](https://docs.nestjs.com/fundamentals/platform-agnosticism)                                                                               |
| L02 | Controllers & Routing (`@Get`, `@Post`, `@Param`, `@Body`, `@Query`) | 🟦         | [/controllers](https://docs.nestjs.com/controllers)                                                                                                                                                                                 |
| L03 | Providers & Dependency Injection                                     | ⬜         | [/providers](https://docs.nestjs.com/providers) · [/fundamentals/custom-providers](https://docs.nestjs.com/fundamentals/custom-providers) · [/fundamentals/injection-scopes](https://docs.nestjs.com/fundamentals/injection-scopes) |
| L04 | Modules + **Hands-on: CRUD Tasks (in-memory)**                       | ⬜         | [/modules](https://docs.nestjs.com/modules) · [/fundamentals/dynamic-modules](https://docs.nestjs.com/fundamentals/dynamic-modules)                                                                                                 |

**Ôn kiến thức cũ:** `app.get('/path', handler)` của Express ↔ `@Controller` + `@Get`; `require()`/khởi tạo thủ công ↔ IoC container; router modular của Express ↔ `@Module`.

---

## Phase 2 — Working with Data

> **Mục tiêu:** Dữ liệu vào phải được kiểm chứng, cấu hình phải đến từ environment, và dữ liệu phải sống trong PostgreSQL thật qua Prisma.

| L   | Lesson                                                            | Trạng thái | Docs                                                                                                                                |
| --- | ----------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| L05 | DTO + Pipes + ValidationPipe (class-validator, class-transformer) | ⬜         | [/techniques/validation](https://docs.nestjs.com/techniques/validation) · [/pipes](https://docs.nestjs.com/pipes)                   |
| L06 | Configuration & environment variables                             | ⬜         | [/techniques/configuration](https://docs.nestjs.com/techniques/configuration)                                                       |
| L07 | Prisma + PostgreSQL: `PrismaService`, lifecycle hooks             | ⬜         | [/recipes/prisma](https://docs.nestjs.com/recipes/prisma) · [prisma.io/docs](https://www.prisma.io/docs)                            |
| L08 | Schema, relations, migrations, seed                               | ⬜         | [/techniques/database](https://docs.nestjs.com/techniques/database) · [Prisma schema](https://www.prisma.io/docs/orm/prisma-schema) |

**Ôn kiến thức cũ:** Bạn đã dùng Prisma với Express — giờ so sánh cách bọc `PrismaClient` thành một **provider** để Nest quản lý vòng đời, thay vì import một singleton toàn cục.

---

## Phase 3 — Request Lifecycle & Error Handling

> **Mục tiêu:** Nắm trọn vòng đời một request trong Nest. Đây là chỗ Express-dev hay hiểu sai nhất, vì Nest có tới 5 loại "thứ chen vào giữa" thay vì chỉ middleware.

| L   | Lesson                                    | Trạng thái | Docs                                                                                                                                                                                                                        |
| --- | ----------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L09 | Middleware                                | ⬜         | [/middleware](https://docs.nestjs.com/middleware)                                                                                                                                                                           |
| L10 | Exception Filters & xử lý lỗi tập trung   | ⬜         | [/exception-filters](https://docs.nestjs.com/exception-filters)                                                                                                                                                             |
| L11 | Interceptors + tổng hợp Request Lifecycle | ⬜         | [/interceptors](https://docs.nestjs.com/interceptors) · [/faq/request-lifecycle](https://docs.nestjs.com/faq/request-lifecycle) · [/fundamentals/execution-context](https://docs.nestjs.com/fundamentals/execution-context) |

**Thứ tự thực thi cần thuộc lòng:**
`Middleware → Guard → Interceptor (before) → Pipe → Handler → Interceptor (after) → Exception Filter`

---

## Phase 4 — Authentication & Authorization

| L   | Lesson                                                    | Trạng thái | Docs                                                                                                                                                                                              |
| --- | --------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L12 | Đăng ký / đăng nhập, băm mật khẩu                         | ⬜         | [/security/authentication](https://docs.nestjs.com/security/authentication) · [/security/encryption-and-hashing](https://docs.nestjs.com/security/encryption-and-hashing)                         |
| L13 | JWT + Passport strategy                                   | ⬜         | [/security/authentication](https://docs.nestjs.com/security/authentication) · [/recipes/passport](https://docs.nestjs.com/recipes/passport)                                                       |
| L14 | Guards + RBAC (`@Roles`, `Reflector`, quyền owner/member) | ⬜         | [/guards](https://docs.nestjs.com/guards) · [/security/authorization](https://docs.nestjs.com/security/authorization) · [/custom-decorators](https://docs.nestjs.com/custom-decorators)           |
| L15 | Refresh token + hardening (helmet, CORS, rate limit)      | ⬜         | [/security/helmet](https://docs.nestjs.com/security/helmet) · [/security/cors](https://docs.nestjs.com/security/cors) · [/security/rate-limiting](https://docs.nestjs.com/security/rate-limiting) |

---

## Phase 5 — Testing & Documentation

| L   | Lesson                                                   | Trạng thái | Docs                                                                                                                                      |
| --- | -------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| L16 | Unit testing (`Test.createTestingModule`, mock provider) | ⬜         | [/fundamentals/unit-testing](https://docs.nestjs.com/fundamentals/unit-testing)                                                           |
| L17 | E2E testing với supertest + test database riêng          | ⬜         | [/fundamentals/e2e-testing](https://docs.nestjs.com/fundamentals/e2e-testing)                                                             |
| L18 | Swagger / OpenAPI                                        | ⬜         | [/openapi/introduction](https://docs.nestjs.com/openapi/introduction) · [/openapi/cli-plugin](https://docs.nestjs.com/openapi/cli-plugin) |
| L19 | API Versioning                                           | ⬜         | [/techniques/versioning](https://docs.nestjs.com/techniques/versioning)                                                                   |

**Quality gate mở từ phase này:** bật `coverageThreshold` trong Jest — CI fail nếu coverage tụt.

---

## Phase 6 — Caching & Observability

| L   | Lesson                                                   | Trạng thái | Docs                                                                                                                            |
| --- | -------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| L20 | Caching với Redis: TTL, `CacheInterceptor`, invalidation | ⬜         | [/techniques/caching](https://docs.nestjs.com/techniques/caching)                                                               |
| L21 | Logging chuẩn production + Health checks                 | ⬜         | [/techniques/logger](https://docs.nestjs.com/techniques/logger) · [/recipes/terminus](https://docs.nestjs.com/recipes/terminus) |

---

## Phase 7 — Mở rộng (sau khi xong core)

| L   | Lesson                                            | Trạng thái | Docs                                                                                                                                                      |
| --- | ------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L22 | Queues (BullMQ) & Task Scheduling                 | ⬜         | [/techniques/queues](https://docs.nestjs.com/techniques/queues) · [/techniques/task-scheduling](https://docs.nestjs.com/techniques/task-scheduling)       |
| L23 | Events (`EventEmitter`)                           | ⬜         | [/techniques/events](https://docs.nestjs.com/techniques/events)                                                                                           |
| L24 | File upload & Serialization                       | ⬜         | [/techniques/file-upload](https://docs.nestjs.com/techniques/file-upload) · [/techniques/serialization](https://docs.nestjs.com/techniques/serialization) |
| L25 | **Hexagonal architecture trong NestJS** + tổng ôn | ⬜         | [/fundamentals/custom-providers](https://docs.nestjs.com/fundamentals/custom-providers) · [/recipes/cqrs](https://docs.nestjs.com/recipes/cqrs)           |

> L25 là lesson khép vòng: refactor một module theo ports & adapters, rồi đặt cạnh dự án Express + hexagonal cũ của bạn để thấy Nest đã _có sẵn_ những gì bạn từng phải tự dựng bằng tay.

---

## Repo tham khảo (đọc code người khác là cách học nhanh nhất)

| Repo                                                                                            | Dùng để                                                                      |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [nestjs/nest — `sample/`](https://github.com/nestjs/nest/tree/master/sample)                    | ~35 ví dụ chính chủ, mỗi thư mục một kỹ thuật. Nguồn đáng tin nhất sau docs. |
| [nestjs/awesome-nestjs](https://github.com/nestjs/awesome-nestjs)                               | Danh mục thư viện & bài viết được cộng đồng tuyển chọn                       |
| [lujakob/nestjs-realworld-example-app](https://github.com/lujakob/nestjs-realworld-example-app) | Một app thật hoàn chỉnh theo spec RealWorld                                  |
| [brocoders/nestjs-boilerplate](https://github.com/brocoders/nestjs-boilerplate)                 | Boilerplate production: auth, i18n, mailer, test, docker                     |
| [CatsMiaow/nestjs-project-structure](https://github.com/CatsMiaow/nestjs-project-structure)     | Cách tổ chức thư mục cho project lớn                                         |

## Retrospective sau mỗi phase

Kết thúc mỗi phase, viết một retro theo [`docs/templates/retro.md`](templates/retro.md) vào `docs/lessons/_retros/phase-X.md`. Đây là nghi thức thật của team Agile: nhìn lại để lần sau nhanh hơn.
