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
