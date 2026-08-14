# NestJS Training

> Dự án **học NestJS 11** theo tài liệu chính thống [docs.nestjs.com](https://docs.nestjs.com), nhưng được vận hành **như một dự án backend thật**: Linear để quản lý task, GitHub PR + CI để kiểm soát chất lượng, Slack để báo tiến độ, Notion làm knowledge base.

Sản phẩm cuối khoá: một **Task Management API** (User · Project · Task · Comment) với validation, xử lý lỗi tập trung, JWT auth + RBAC, Swagger docs, API versioning, cache Redis, health check, unit + e2e test, CI tự động.

## Bắt đầu từ đâu

| Bạn muốn                               | Đọc                                                                  |
| -------------------------------------- | -------------------------------------------------------------------- |
| Xem toàn bộ lộ trình học               | [`docs/ROADMAP.md`](docs/ROADMAP.md)                                 |
| Hiểu quy trình làm việc mỗi lesson     | [`docs/workflow/WORKFLOW.md`](docs/workflow/WORKFLOW.md)             |
| Hiểu vì sao repo được dựng như thế này | [`docs/lessons/00-setup/README.md`](docs/lessons/00-setup/README.md) |
| Xem các quyết định kiến trúc và lý do  | [`docs/adr/`](docs/adr/README.md)                                    |
| Hiểu cách nhiều AI agent phối hợp      | [`docs/workflow/AGENT-MODEL.md`](docs/workflow/AGENT-MODEL.md)       |

## Chuẩn bị môi trường

Yêu cầu: **Node.js >= 20** (docs NestJS yêu cầu), **pnpm**, **Docker**.

```bash
pnpm install          # husky tự cài git hook qua script "prepare"
cp .env.example .env  # rồi điền giá trị thật
docker compose up -d  # postgres:16 + redis:7
docker compose ps     # cả hai phải ở trạng thái (healthy)
pnpm start:dev        # http://localhost:3000
```

## Lệnh hay dùng

```bash
pnpm start:dev        # dev, watch mode — vòng lặp chính
pnpm lint             # eslint --fix
pnpm format           # prettier --write
pnpm test             # unit test
pnpm test:e2e         # e2e test
pnpm test:cov         # coverage
pnpm verify               # đúng những gì CI chạy — dùng TRƯỚC khi mở PR
pnpm db:up / db:down  # bật/tắt postgres + redis
```

## Cấu trúc

```
src/                       # code ứng dụng (main.ts, app.module.ts, feature modules)
test/                      # e2e test (*.e2e-spec.ts)
docs/
  ROADMAP.md               # 8 phase, ~26 lesson, link docs chính thống
  workflow/                # WORKFLOW.md · AGENT-MODEL.md
  adr/                     # architecture decision records
  lessons/XX-*/README.md   # note tiếng Việt từng lesson
  templates/               # template lesson note · retro
.claude/skills/            # lesson-start · teach · lesson-review · sync-progress
.github/workflows/ci.yml   # lint → format → test → build
.husky/                    # pre-commit (lint-staged) · commit-msg (commitlint)
docker-compose.yml         # postgres:16 · redis:7 · adminer (profile "tools")
postman/                   # collection test API bằng tay
```

## Quy tắc quan trọng

- **Package manager là `pnpm`** — không dùng npm/yarn (sẽ tạo lockfile thứ hai và làm CI đỏ).
- **Conventional Commits bắt buộc** — `commitlint` chặn tại git hook, sai format là commit bị từ chối.
- **Không push thẳng vào `main`** — branch protection bật; mọi thay đổi đi qua PR có CI xanh.
- **PR phải có `Fixes NES-XX`** — đó là thứ khiến Linear tự chuyển issue sang Done.
- **AI không viết code hands-on thay người học** — xem [AGENTS.md](AGENTS.md).

## Chất lượng

| Hàng rào          | Ở đâu             | Chặn gì                         |
| ----------------- | ----------------- | ------------------------------- |
| `lint-staged`     | hook `pre-commit` | Code chưa format / lint lỗi     |
| `commitlint`      | hook `commit-msg` | Commit message sai chuẩn        |
| GitHub Actions    | mỗi push & PR     | Lint · format · test · build    |
| Branch protection | `main`            | Push trực tiếp, merge khi CI đỏ |
| Dependabot        | hàng tuần         | Dependency lỗi thời             |

## Ghi chú

Repo có hai remote: `origin` (GitHub — nơi làm việc chính) và `gitlab` (repo training của công ty). Toàn bộ workflow trong tài liệu này dùng `origin`.
+## NES-2 L01 — Reference Implementation

### Tiếng Việt

Reference implementation của lesson NES-2 L01 minh hoạ bốn mục tiêu:

1. Vai trò của năm file core do `nest new` sinh ra.
2. Luồng bootstrap NestJS và constructor injection cho DI.
3. Cấu trúc feature module chuẩn với module, controller, service, DTO và unit test.
4. Các lệnh Nest CLI thường dùng: `new`, `generate`, `build` và `start`.

Luồng bootstrap bắt đầu tại [`src/main.ts`](src/main.ts): `NestFactory.create(AppModule)` đọc metadata `@Module()`, khởi tạo DI container, đăng ký controller/provider, rồi `app.listen()` mở HTTP listener. [`AppController`](src/app.controller.ts) nhận `AppService` qua constructor injection; tương tự [`UsersController`](src/users/users.controller.ts) nhận `UsersService`.

| File                                                       | Vai trò                                                                            |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [`src/main.ts`](src/main.ts)                               | Entry point: bootstrap app bằng `NestFactory.create(AppModule)` và `app.listen()`. |
| [`src/app.module.ts`](src/app.module.ts)                   | Root module: khai báo `imports`, `controllers` và `providers`.                     |
| [`src/app.controller.ts`](src/app.controller.ts)           | Root controller: xử lý HTTP request và uỷ quyền business logic cho service.        |
| [`src/app.service.ts`](src/app.service.ts)                 | Root provider/service: chứa business logic và dùng `@Injectable()`.                |
| [`src/app.controller.spec.ts`](src/app.controller.spec.ts) | Unit test cho controller bằng `Test.createTestingModule()`.                        |

Feature `users` nằm trong [`src/users/`](src/users/), còn e2e test nằm tại [`test/users.e2e-spec.ts`](test/users.e2e-spec.ts).

| Lệnh                                                    | Mục đích                                            | Script tương đương trong repo |
| ------------------------------------------------------- | --------------------------------------------------- | ----------------------------- |
| `npx @nestjs/cli new my-app --package-manager pnpm`     | Tạo project mới cùng các file core, config và test. | —                             |
| `nest generate module users` hoặc `nest g module users` | Scaffold module mới.                                | —                             |
| `nest generate controller users`                        | Scaffold controller mới.                            | —                             |
| `nest generate service users`                           | Scaffold service mới.                               | —                             |
| `nest build`                                            | Build production ra `dist/`.                        | `pnpm build`                  |
| `nest start --watch`                                    | Chạy dev mode và tự restart khi file đổi.           | `pnpm start:dev`              |
| `nest start`                                            | Compile rồi chạy app một lần.                       | `pnpm start`                  |

### English

The NES-2 L01 reference implementation demonstrates four objectives:

1. The role of the five core files generated by `nest new`.
2. The NestJS bootstrap flow and constructor injection for DI.
3. A standard feature-module structure with a module, controller, service, DTO, and unit test.
4. The common Nest CLI commands: `new`, `generate`, `build`, and `start`.

Bootstrap starts in [`src/main.ts`](src/main.ts): `NestFactory.create(AppModule)` reads `@Module()` metadata, creates the DI container, registers controllers/providers, and `app.listen()` opens the HTTP listener. [`AppController`](src/app.controller.ts) receives `AppService` through constructor injection; [`UsersController`](src/users/users.controller.ts) receives `UsersService` in the same way.

| File                                                       | Role                                                                                     |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [`src/main.ts`](src/main.ts)                               | Entry point: bootstraps the app with `NestFactory.create(AppModule)` and `app.listen()`. |
| [`src/app.module.ts`](src/app.module.ts)                   | Root module: declares `imports`, `controllers`, and `providers`.                         |
| [`src/app.controller.ts`](src/app.controller.ts)           | Root controller: handles HTTP requests and delegates business logic to the service.      |
| [`src/app.service.ts`](src/app.service.ts)                 | Root provider/service: contains business logic and uses `@Injectable()`.                 |
| [`src/app.controller.spec.ts`](src/app.controller.spec.ts) | Controller unit test using `Test.createTestingModule()`.                                 |

The `users` feature is in [`src/users/`](src/users/), and its e2e test is in [`test/users.e2e-spec.ts`](test/users.e2e-spec.ts).

| Command                                               | Purpose                                                   | Equivalent repository script |
| ----------------------------------------------------- | --------------------------------------------------------- | ---------------------------- |
| `npx @nestjs/cli new my-app --package-manager pnpm`   | Creates a new project with core files, config, and tests. | —                            |
| `nest generate module users` or `nest g module users` | Scaffolds a new module.                                   | —                            |
| `nest generate controller users`                      | Scaffolds a new controller.                               | —                            |
| `nest generate service users`                         | Scaffolds a new service.                                  | —                            |
| `nest build`                                          | Builds production output in `dist/`.                      | `pnpm build`                 |
| `nest start --watch`                                  | Runs development mode and restarts when files change.     | `pnpm start:dev`             |
| `nest start`                                          | Compiles and runs the app once.                           | `pnpm start`                 |
