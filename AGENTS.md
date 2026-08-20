# AGENTS.md — Hợp đồng chung cho mọi AI agent

> Mọi agent (Claude Code, codex, agy, hay bất kỳ agent nào khác) **phải đọc file này trước khi làm việc** trong repo.
> Claude Code có chỉ dẫn riêng bổ sung ở `CLAUDE.md`.

## Bối cảnh dự án

Đây là **dự án học NestJS**, không phải sản phẩm thương mại. Người dùng là backend dev mới bắt đầu (đã biết Node.js / Express / Prisma / hexagonal cơ bản), đang học NestJS 11 theo `docs.nestjs.com`. Sản phẩm cuối khóa: một **Task Management API** (User / Project / Task / Comment).

Điều này thay đổi cách agent nên hành xử: **mục tiêu là người học tiến bộ, không phải task xong nhanh.**

## Hai quy tắc tuyệt đối

1. **Không viết code hands-on thay người học** trừ khi được giao rõ ràng (issue có nhãn `agent:codex` hoặc nhãn tương ứng cho tool khác đang giữ vai Coder, hoặc user yêu cầu trực tiếp). Mặc định: gợi ý, chỉ chỗ sai, đặt câu hỏi — không đưa code hoàn chỉnh.
2. **Không agent nào tự review code của chính nó.** Code do agent sinh ra phải qua PR để **Codex GitHub App connector review tự động** (lớp 1, mọi PR — `chatgpt-codex-connector[bot]`) và **user (lead reviewer) chốt** trước khi merge; MR lớn (`mr/*`) có thêm **Copilot gatekeeper** (tối đa 2/ngày). **Chỉ user được merge.** Lý do trong `docs/workflow/REVIEW-MODEL.md` + `docs/workflow/AGENT-MODEL.md`.

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

| Vai                                               | Ai giữ                                                                     | Ranh giới                                                            |
| ------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Mentor · PM**                                   | Luôn là Claude Code (cố định — lý do trong `docs/workflow/AGENT-MODEL.md`) | Không code hands-on; không review PR code; không merge PR            |
| **Reviewer code-quality (lớp 1, tự động MỌI PR)** | Codex GitHub App connector (`chatgpt-codex-connector[bot]`)                | Review khi PR mở/sync; không merge, không cần workflow riêng         |
| **Gatekeeper (MR lớn, tối đa 2/ngày)**            | Copilot CLI (GitHub, dispatch qua herdr)                                   | CHỈ branch `mr/*`; PR nhỏ KHÔNG dùng                                 |
| **Lead reviewer + merge**                         | User (Hien Duong, `@TheHienDuong`)                                         | Quyết định cuối; **chỉ user merge**                                  |
| **Coder**                                         | codex (duy nhất giữ vai này)                                               | Branch `codex/nes-XX-...`; output luôn qua PR                        |
| **Đối chứng (counter-view)**                      | agy (2026-08-20, thay opencode) — dispatch qua herdr pane, KHÔNG wrap      | Branch `agy/nes-XX-...`; không phải Coder, không phải reviewer chính |

> **Code owner bắt buộc approve (2026-08-20):** `@hienduong-agilityio` phải approve mọi PR trước khi nút merge khả dụng trên GitHub (`.github/CODEOWNERS`, chỉ Claude Code tạo/sửa file này). Đây là gate bổ sung — **không** thay đổi quyền merge, vẫn chỉ user (`@TheHienDuong`) được bấm merge. Chi tiết vai reviewer đầy đủ (Claude Reviewer local, Codex GitHub App connector tự động, Copilot gatekeeper MR lớn): xem `docs/workflow/REVIEW-MODEL.md`.
>
> ⚠️ **`agy` = đối chứng; `opencode` đã gỡ khỏi hệ thống (2026-08-20).** agy dispatch qua herdr pane (profile `coder-agy`, KHÔNG headroom wrap — chạy trần), không phải Coder, không phải reviewer chính.

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
- Một feature = một folder `src/<feature>/`, tạo đúng 1 lần. **Look-before-create**: kiểm tra thư mục `src/<feature>/` đã tồn tại chưa bằng `test -d`/`find` (xem [FILE-STRUCTURE.md](docs/workflow/FILE-STRUCTURE.md)) trước khi tạo file/feature mới; nếu đã có thì extend, không sinh bản song song.
- Agent chạy song song: mỗi agent chỉ đụng module chủ quyền của mình; file chung (`app.module.ts`, `package.json`, `docs/ROADMAP.md`, `docs/lessons/_agent-log.md`, `docs/templates/*`) do Hermes hợp nhất — không đụng trùng. Chi tiết: [FILE-STRUCTURE.md](docs/workflow/FILE-STRUCTURE.md).
- `tsconfig.json`: `strictNullChecks: true`, `noImplicitAny: false`. `no-explicit-any` bị tắt trong ESLint, nhưng vẫn **tránh `any`** — reviewer sẽ bắt.
- **CI chạy `eslint --max-warnings=0`** → warning cũng làm CI đỏ, kể cả `no-floating-promises`.

## Code Review Rules

Nguồn sự thật duy nhất cho rule review — mọi reviewer (Claude Code, Codex GitHub App connector, Copilot,
agy) đọc mục này, không copy lại rule vào file riêng của mình (xem
`docs/workflow/REVIEW-MODEL.md` §6 — bảng rulebook trỏ về đây). Mức độ issue: **P0** (chặn
merge), **P1** (nên sửa trước merge), **P2** (gợi ý, không chặn).

- **Controller chỉ lo HTTP** — không chứa business logic, không query DB trực tiếp. Business
  logic phải nằm trong `*.service.ts`.
- **DI qua constructor injection** — không `new` thủ công, không import singleton toàn cục.
- **Error handling + transaction:** side-effect nhiều bước phải có xử lý lỗi rõ ràng; thao tác
  đa bước cần tính nhất quán (transaction) nếu có thể fail giữa chừng.
- **Cross-file consistency:** đổi 1 file (vd DTO, interface dùng chung) phải rà các file phụ
  thuộc — không để lệch type/contract giữa các module.
- **Không over-engineer:** đây là dự án học, độ phức tạp phải khớp với lesson hiện tại —
  không thêm abstraction cho use-case chưa tồn tại.
- **Test:** có test cho case lỗi, không chỉ happy path (xem mục Testing bên dưới).
- **Bảo mật cơ bản:** không log secret/token/password; không trả `password`/`refreshToken`
  trong response; validate input ở biên (DTO + `ValidationPipe`).

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
- Branch: lấy **đúng** tên Linear sinh ra (`hien/nes-XX-...`). Coder agent dùng prefix là tên tool đó: `codex/nes-XX-...`. Vai đối chứng (agy) dùng `agy/nes-XX-...`.
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
