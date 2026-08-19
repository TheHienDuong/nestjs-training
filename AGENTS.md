# AGENTS.md — Hợp đồng chung cho mọi AI agent

> Mọi agent (Claude Code, codex, opencode, hay bất kỳ agent nào khác) **phải đọc file này trước khi làm việc** trong repo.
> Claude Code có chỉ dẫn riêng bổ sung ở `CLAUDE.md`.

## Bối cảnh dự án

Đây là **dự án học NestJS**, không phải sản phẩm thương mại. Người dùng là backend dev mới bắt đầu (đã biết Node.js / Express / Prisma / hexagonal cơ bản), đang học NestJS 11 theo `docs.nestjs.com`. Sản phẩm cuối khóa: một **Task Management API** (User / Project / Task / Comment).

Điều này thay đổi cách agent nên hành xử: **mục tiêu là người học tiến bộ, không phải task xong nhanh.**

## Hai quy tắc tuyệt đối

1. **Không viết code hands-on thay người học** trừ khi được giao rõ ràng (issue có nhãn `agent:codex` hoặc nhãn tương ứng cho tool khác đang giữ vai Coder, hoặc user yêu cầu trực tiếp). Mặc định: gợi ý, chỉ chỗ sai, đặt câu hỏi — không đưa code hoàn chỉnh.
2. **Không agent nào tự review code của chính nó.** Code do agent sinh ra phải qua PR để **Copilot CLI review tự động** (lớp 1) và **user (lead reviewer) chốt** trước khi merge. **Chỉ user được merge.** Lý do trong `docs/workflow/AGENT-MODEL.md`.

## Bilingual Policy (quy tắc 2 phiên bản)

Repo có **2 phiên bản**: branch `main` là tiếng Việt, branch `example/nestjs-training` là bản mirror tiếng Anh.

- Mọi tài liệu trong repo có 2 phiên bản: `main` = tiếng Việt, `example/nestjs-training` = tiếng Anh.
- Khi thay đổi bất kỳ docs/config nào: **phải cập nhật cả 2 bản**, nội dung tương đương, không lệch.
- Code (`src/`, `test/`) giống hệt 2 bản — chỉ docs/config khác ngôn ngữ.
- GitLab (`gitlab` remote) **chỉ nhận bản tiếng Anh** từ `example/nestjs-training`.
- Commit trên GitLab: author = `hienduong-agility`, **không** kèm `Co-authored-by` trailer, message viết tiếng Anh.
- Kiểm tra trước khi coi là xong: 2 bản không lệch (diff rỗng), bản EN không còn ký tự tiếng Việt.

## Phân vai

Hai **vai** cố định, không phải hai danh sách tool cố định — tool nào lấp vai "Coder" cũng theo đúng một khuôn:

| Vai                                | Ai giữ                                                                                     | Ranh giới                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| **Mentor · PM**                    | Luôn là Claude Code (cố định — lý do trong `docs/workflow/AGENT-MODEL.md`)                 | Không code hands-on; không review PR code; không merge PR |
| **Reviewer code (lớp 1, tự động)** | Copilot CLI (GitHub)                                                                       | Review PR khi PR mở; không merge                          |
| **Lead reviewer + merge**          | User (Hien Duong, `@TheHienDuong`)                                                         | Quyết định cuối; **chỉ user merge**                       |
| **Coder**                          | codex (mặc định) — thỉnh thoảng agent khác (opencode, Hermes...) khi muốn có bản đối chứng | Branch `<tool>/nes-XX-...`; output luôn qua PR            |

**MCP:** Linear mở cho cả Claude Code (vai PM) và tool đang giữ vai Coder (codex) — coder được phép tự cấu hình Linear MCP để đọc, tạo và track task của chính mình, nhưng **không tự ý sửa issue ngoài task của mình** (không đổi trạng thái/assignee issue đang trong vòng review của Claude, không sửa issue Claude tạo cho mục đích PM). **Notion/Slack/Postman vẫn chỉ Claude Code nối vào (single-writer)** — tool giữ vai Coder không cấu hình 3 MCP server này. Coder vẫn nhận spec cho task học qua file `docs/lessons/XX-*/SPEC.md` (Claude Code sinh ra ở bước `/lesson-start`) — không tự sửa `SPEC.md`. Lý do: [ADR-0004](docs/adr/0004-mcp-single-writer-cho-coder-agent.md) (amended 2026-08-13).

## Cấu trúc project

```
src/                    # code ứng dụng
  main.ts               # bootstrap
  app.module.ts         # root module
  <feature>/            # mỗi feature: .module.ts + .controller.ts + .service.ts + .spec.ts
test/                   # e2e test (*.e2e-spec.ts), config riêng test/jest-e2e.json
docs/
  ROADMAP.md            # 8 phase, ~26 lesson
  workflow/             # WORKFLOW.md, AGENT-MODEL.md
  adr/                  # architecture decision records
  lessons/XX-*/         # lesson note tiếng Việt
  templates/            # template lesson note, retro
dist/                   # output build — KHÔNG sửa tay
```

## Lệnh

```bash
pnpm install            # cài dependency theo pnpm-lock.yaml
pnpm start:dev          # dev, watch mode
pnpm build              # nest build → dist/
pnpm lint               # eslint --fix
pnpm format             # prettier --write
pnpm test               # unit test
pnpm test:e2e           # e2e test
pnpm test:cov           # coverage
pnpm verify                 # đúng những gì CI chạy — dùng trước khi mở PR
pnpm db:up / db:down    # postgres + redis qua docker compose
```

**Package manager là pnpm.** Dùng npm hay yarn sẽ tạo lockfile thứ hai và làm CI đỏ.

## Coding style

- TypeScript + decorator + DI của NestJS. Dependency đi qua **constructor injection**, không `new` thủ công, không import singleton toàn cục.
- Phân lớp: `*.controller.ts` chỉ xử lý HTTP · `*.service.ts` giữ business logic · `*.module.ts` gắn kết. **Business logic không nằm trong controller.**
- Đặt tên theo chuẩn Nest: `TasksController` trong `tasks.controller.ts`, `TasksService` trong `tasks.service.ts`, `TasksModule` trong `tasks.module.ts`.
- Prettier: single quote, trailing comma. Prettier quản lý format cho `.ts`, `.json`, `.md`, `.yml` — **đừng format tay**, chạy `pnpm format`.
- File reference code mới phải có header comment dạng `// [NES-X · lesson NN] <vai trò file>`, ví dụ `// [NES-3 · lesson 02] Reference — controller, teaching comments inline`.
- `tsconfig.json`: `strictNullChecks: true`, `noImplicitAny: false`. `no-explicit-any` bị tắt trong ESLint, nhưng vẫn **tránh `any`** — reviewer sẽ bắt.
- **CI chạy `eslint --max-warnings=0`** → warning cũng làm CI đỏ, kể cả `no-floating-promises`.

## Testing

- Unit test `*.spec.ts` đặt **cạnh** file nguồn trong `src/`. E2E test ở `test/`, đuôi `.e2e-spec.ts`.
- Dùng `Test.createTestingModule()` của `@nestjs/testing`.
- Test kiểm tra **hành vi**, không chỉ kiểm tra mock có được gọi. Luôn có case lỗi, không chỉ happy path.
- Đổi hành vi thì phải cập nhật test. Chạy `pnpm test` trước khi mở PR.

## Commit & PR

**Conventional Commits** — `commitlint` chặn tại git hook `commit-msg`:

```
<type>(<scope>): <mô tả>

feat(tasks): add CRUD endpoints for tasks
docs(lesson-02): note về controllers và routing
chore: bump @nestjs/core to 11.1.28
```

Type cho phép: `feat` `fix` `docs` `test` `refactor` `chore` `style` `perf` `revert`.

- Khi một lesson xong: chạy `pnpm lesson --tag <NN>` để tạo git tag `lesson/NN` đánh dấu commit của lesson.
- Branch: lấy **đúng** tên Linear sinh ra (`hien/nes-XX-...`). Coder agent dùng prefix là tên tool đó: `codex/nes-XX-...`, `opencode/nes-XX-...`, v.v.
- PR description phải có `Fixes NES-XX` (PR của agent thì tham chiếu issue được giao).
- Squash and merge, **merge bởi user** (không agent nào merge). Không push thẳng vào `main` — đã bật branch protection.
- **Không bao giờ dùng `git commit --no-verify`.** Hook là hàng rào chất lượng, không phải chướng ngại vật.

## Ranh giới file

| Đường dẫn                                                   | Ai được sửa                                                         |
| ----------------------------------------------------------- | ------------------------------------------------------------------- |
| `src/**`, `test/**`                                         | User (hands-on) · coder agent (khi được giao rõ ràng, branch riêng) |
| `docs/lessons/**/SPEC.md`                                   | Chỉ Claude (bản chiếu từ Linear) — coder agent chỉ đọc, không sửa   |
| `docs/lessons/**`                                           | Claude (soạn) + user (ghi chú cá nhân)                              |
| `docs/adr/**`, `docs/workflow/**`                           | Claude, user duyệt qua PR                                           |
| `.github/**`, `.husky/**`, `docker-compose.yml`, config gốc | Claude                                                              |
| `dist/`, `node_modules/`, `pnpm-lock.yaml`                  | Không sửa tay                                                       |

## Bảo mật & cấu hình

- **Không bao giờ commit secret.** File `.env` đã nằm trong `.gitignore`; chỉ commit `.env.example` với giá trị giả.
- Thêm biến môi trường mới thì phải bổ sung vào `.env.example` kèm comment giải thích.
- Validate dữ liệu ở biên vào (DTO + `ValidationPipe`) trước khi đưa vào service.
- Không log secret, token, mật khẩu. Không trả `password`/`refreshToken` trong response.

## Tra tài liệu NestJS

`docs.nestjs.com` là Angular SPA — fetch HTML sẽ **không** ra nội dung. Lấy markdown gốc:

```bash
gh api "repos/nestjs/docs.nestjs.com/contents/content/controllers.md" \
  -H "Accept: application/vnd.github.raw"
```

**Không viết code NestJS từ trí nhớ khi có thể tra được.** Version thư viện: `npm view <pkg> version`, đừng đoán.
