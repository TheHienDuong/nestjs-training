# L07 — Prisma + PostgreSQL: PrismaService

|                |                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------- |
| **Phase**      | 2 — Working with Data                                                                       |
| **Linear**     | NES-8 (sub-issue: NES-81 Theory & note)                                                     |
| **Branch**     | `codex/nes-8-l07-prisma-postgresql-prismaservice` (PR #87, reference implementation merged) |
| **Docs chính** | [/recipes/prisma](https://docs.nestjs.com/recipes/prisma)                                   |
| **Ngày học**   | 2026-08-26                                                                                  |

> 📝 **Toàn bộ phần Hands-on + Quiz của lesson này được thực thi thay**, không phải "bạn tự làm" như
> scaffold gốc. Xem disclaimer ngay dưới đây trước khi đọc tiếp — đây là tuyên bố có hiệu lực.

> ⚠️ **Disclaimer — execution substitute (2026-08-27):** Phần **🛠 Hands-on** (NES-84: viết
> `PrismaService`/`PrismaModule`, `prisma/schema.prisma`, chuyển `TasksService` sang Prisma) được
> **Hermes/Codex thực thi thay** qua PR #87 (`Fixes NES-8`, branch
> `codex/nes-8-l07-prisma-postgresql-prismaservice`, merge commit `5791085`). Trong lúc review local,
> Claude Code phát hiện 1 lỗi P1 (race condition `findOne()` rồi mới `update`/`delete` riêng — Prisma
> `P2025` lọt thành lỗi 500 thay vì 404) và **tự sửa trực tiếp trên PR #87** (commit `522bab5`,
> `fix(tasks): map Prisma P2025 to NotFoundException on update/remove`) trước khi PR được merge —
> nghĩa là bản merge cuối cùng đã qua một vòng sửa của Claude, không chỉ của Codex. Phần **✅ Ôn tập &
> Quiz** (NES-88) được **Claude Code thực thi thay** ở bước closeout này, dựa trên đọc lại diff PR #87
> và docs gốc. Cả hai nằm trong **ngoại lệ user duyệt một lần (execution-substitute authorization,
> 2026-08-26/27)** — **KHÔNG phải xác nhận rằng Hien Duong đã tự tay code hands-on hoặc tự trả lời
> quiz này**. Muốn học thật, hãy tự làm lại hands-on và tự trả lời quiz trước khi đọc phần bên dưới.
>
> ⚠️ **Live PostgreSQL: KHÔNG được xác minh, dù bằng chứng code/CI ở dưới đều thật.** PR #87 tự khai
> "Docker was unavailable" — migration `prisma/migrations/20260826162300_init` và e2e CRUD qua
> Postgres thật **chưa từng chạy**, kể cả local lẫn CI (`.github/workflows/ci.yml` vẫn comment out
> service `postgres` + step E2E). Toàn bộ "bằng chứng" dưới đây là **static/unit-level**: Prisma
> schema validate, ESLint, Prettier, `pnpm test` (Prisma mock ở boundary), Nest build, và CI xanh —
> không phải app đã thực sự CRUD được với một Postgres sống. Đừng đọc phần dưới như bằng chứng
> runtime đã hoàn thành; xem mục "Definition of Done" để biết chính xác gate nào còn thiếu.
>
> ⚠️ **Linear:** MCP Linear không kết nối được trong phiên viết closeout này — số hiệu NES-84/NES-88
> ở trên lấy theo quy ước sub-issue của NES-8 do user cung cấp trực tiếp, **chưa được tự xác minh
> live status/checklist trên Linear**. Cập nhật trạng thái Linear (nếu cần) là việc riêng, không nằm
> trong phạm vi closeout docs-only này.
>
> ⚠️ **Bản EN (`example/nestjs-training`): CHƯA có mirror cho L07.** Không có commit nào trên branch
> đó nhắc tới lesson 07/NES-8/NES-81 dưới bất kỳ hình thức nào — đây là **pending**, không phải đã
> làm và bỏ sót ghi chú. Đừng coi 2 bản vi/en đang song song cho L07; mirror EN là việc còn lại,
> chưa có bằng chứng parity hay hoàn thành ở thời điểm closeout này.

---

## 🗂 File map lesson này

> Bản đồ chính xác nhất + đọc từng file code (kèm số dòng): chạy `pnpm lesson 07` (sau khi tag
> `lesson/07` được cắt — xem "Definition of Done"). Bảng dưới đây phản ánh trạng thái thật trên
> `main` sau khi PR #87 + PR #88 đã merge — **không còn** là danh sách dự kiến.

| File                                                                | Vai trò (lý thuyết / ref / hands-on)                                                                | Tạo ở lesson | Trạng thái                                                                                                     |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------- |
| `docs/lessons/07-prisma-postgresql/README.md`                       | Lý thuyết + hands-on reference + quiz (mục này)                                                     | L07          | ✅ Merged (PR #88, lý thuyết) + closeout ở bước này                                                            |
| `prisma/schema.prisma`                                              | Schema tối thiểu — model `Task` (không quan hệ, không migration nâng cao, việc đó thuộc L08)        | L07          | ✅ Merged (PR #87, execution substitute)                                                                       |
| `prisma/migrations/20260826162300_init/migration.sql`               | Migration `CREATE TABLE "Task"` sinh từ schema trên                                                 | L07          | ✅ Merged file — **chưa từng apply lên Postgres thật** (Docker waived)                                         |
| `src/prisma/prisma.service.ts`                                      | Provider bọc `PrismaClient`, lifecycle hook `onModuleInit`/`onModuleDestroy`                        | L07          | ✅ Merged (PR #87, execution substitute)                                                                       |
| `src/prisma/prisma.module.ts`                                       | Module `@Global()` export `PrismaService` để các feature module khác dùng chung                     | L07          | ✅ Merged (PR #87, execution substitute)                                                                       |
| `src/app.module.ts`                                                 | Sửa — thêm `PrismaModule` vào `imports`                                                             | L01/L04      | ✅ Merged (PR #87, execution substitute)                                                                       |
| `src/main.ts`                                                       | Sửa — thêm `app.enableShutdownHooks()` để `onModuleDestroy` thật sự chạy khi tắt app                | L01          | ✅ Merged (PR #87, execution substitute)                                                                       |
| `src/config/env.validation.ts`                                      | Sửa — thêm `DATABASE_URL` (`@IsDefined @IsString @IsUrl`) vào `EnvironmentVariables`                | L06          | ✅ Merged (PR #87, execution substitute)                                                                       |
| `src/tasks/tasks.service.ts`                                        | Sửa — thay mảng in-memory bằng gọi qua `PrismaService`, CRUD async                                  | L04          | ✅ Merged (PR #87, execution substitute; P1 fix `522bab5` sau review Claude)                                   |
| `src/tasks/tasks.controller.ts`, `tasks.module.ts`                  | Sửa — `async`/`Promise<Task>` xuyên suốt; `TasksModule` import `PrismaModule`                       | L04          | ✅ Merged (PR #87, execution substitute)                                                                       |
| `*.spec.ts` (env.validation, main, tasks.service, tasks.controller) | Test — cập nhật cho `DATABASE_URL`, Prisma mock ở boundary, error-path P2025                        | L04-L07      | ✅ Merged (PR #87, execution substitute)                                                                       |
| `test/tasks.e2e-spec.ts`, `test/setup-env.ts`                       | e2e — CRUD contract chạy qua `PrismaService` thật; **cần Postgres sống, chưa từng chạy được**       | L02/L07      | ✅ Merged file — **chưa từng chạy với Postgres thật**                                                          |
| `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`             | Thêm `@prisma/client@6.19.3`/`prisma@6.19.3`; `allowBuilds` cho phép postinstall của Prisma trên CI | —            | ✅ Merged (PR #87; `pnpm-workspace.yaml` fix `3f75e42` do Claude thêm sau khi CI đỏ `ERR_PNPM_IGNORED_BUILDS`) |

---

## 🎯 Mục tiêu

<!-- Copy nguyên văn từ NES-8. Đã tick ở bước closeout — xem ghi chú execution-substitute ngay dưới. -->

- [x] Bọc `PrismaClient` thành một `@Injectable()` provider (`PrismaService`)
- [x] Dùng lifecycle hook `onModuleInit`/`onModuleDestroy` để connect/disconnect đúng lúc
- [x] Inject `PrismaService` vào `TasksService`, thay in-memory bằng query thật

> Đã tick dựa trên **bằng chứng thực thi thay** (code chạy thật + CI xanh ở PR #87) — **không phải**
> bằng chứng Hien Duong tự tay code hands-on, và **không phải** bằng chứng đã connect được tới một
> Postgres sống (xem disclaimer đầu file + "Definition of Done").

## 📚 Lý thuyết

### Khái niệm 1: `PrismaService` — bọc `PrismaClient` thành một provider

**Vấn đề nó giải quyết:** Với Express + Prisma (như bạn đã làm trước đây), cách phổ biến nhất là
tạo một file `db.ts`/`prisma.ts`, khởi tạo `const prisma = new PrismaClient()` một lần, rồi
`export default prisma` để mọi route/controller `import prisma from './db'`. Đây là **singleton
toàn cục** — đúng chức năng, nhưng có 3 vấn đề khi app lớn dần:

- Không ai quản lý **vòng đời** của nó: `prisma.$connect()` (thường tự động, ngầm ở lần query đầu)
  và `prisma.$disconnect()` không gắn với bất kỳ sự kiện nào của app — bạn phải tự nhớ gọi
  `$disconnect()` đúng chỗ khi tắt server.
- Không **mock được** dễ dàng trong unit test — muốn test một service mà không đụng DB thật, bạn
  phải `jest.mock('./db')` ở tầng module, không phải constructor injection.
- Vi phạm nguyên tắc DI mà `AGENTS.md` của repo này đã nêu rõ: _"không import singleton toàn cục"_.

**Cách Nest làm:** Bọc `PrismaClient` thành một class implement `@Injectable()`, kế thừa
(`extends`) `PrismaClient` để có sẵn mọi phương thức query (`this.task.findMany()`,
`this.user.create()`, ...), rồi để **Nest's DI container** quản lý vòng đời và việc chia sẻ instance
— giống hệt cách bạn đã bọc mọi provider khác từ L03/L04, chỉ khác là provider này bọc một thư viện
ngoài thay vì domain logic tự viết.

```ts
// minh hoạ — dựa trên docs.nestjs.com/recipes/prisma, CHƯA áp dụng vào repo
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {}
```

**Khi nào KHÔNG nên dùng cách bọc này:** Nếu chỉ có 1 script chạy 1 lần (seed, migration thủ công)
không nằm trong vòng đời của app Nest, dùng `PrismaClient` trực tiếp (không qua DI) vẫn hợp lý —
không có "app" nào để inject vào. Trong phạm vi request/response của một app Nest thật thì luôn nên
đi qua provider.

> 📖 Nguồn: [docs.nestjs.com/recipes/prisma — Use Prisma Client in your NestJS services](https://docs.nestjs.com/recipes/prisma)

---

### Khái niệm 2: Lifecycle hook `onModuleInit` / `onModuleDestroy` — connect/disconnect đúng lúc

**Vấn đề nó giải quyết:** `PrismaClient` cần một kết nối TCP mở tới Postgres. Kết nối này nên được
mở **sau khi** Nest đã dựng xong DI container (không mở kết nối trong constructor một cách mù quáng
trước khi biết class có thực sự được dùng hay không) và đóng lại **gọn gàng** khi app tắt — bỏ dở
kết nối khi process bị kill có thể để lại connection "treo" phía Postgres.

**Cách Nest làm:** Đây chính là lý do NestJS có [lifecycle
hooks](https://docs.nestjs.com/fundamentals/lifecycle-events) — các interface một provider có thể
implement để Nest tự gọi đúng thời điểm trong vòng đời app:

```ts
// minh hoạ — dựa trên docs.nestjs.com/recipes/prisma, CHƯA áp dụng vào repo
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
```

`onModuleInit()` được Nest gọi ngay sau khi mọi dependency của module chứa `PrismaService` đã được
resolve — đúng thời điểm để mở kết nối DB.

**Điểm dễ hiểu sai — `onModuleDestroy` KHÔNG tự động chạy khi bạn Ctrl+C:** Theo
[docs.nestjs.com/fundamentals/lifecycle-events#application-shutdown](https://docs.nestjs.com/fundamentals/lifecycle-events),
`onModuleDestroy()`, `beforeApplicationShutdown()` và `onApplicationShutdown()` **chỉ** được Nest
gọi khi có `app.close()` tường minh, **hoặc** khi process nhận system signal (như `SIGTERM`) —
**và bạn đã gọi `app.enableShutdownHooks()`** ở `main.ts` trước đó. Mặc định, các shutdown hook này
**tắt** (lý do: chúng tốn thêm listener trên `process`). Nghĩa là nếu chỉ viết:

```ts
// minh hoạ — dựa trên docs.nestjs.com/recipes/prisma, CHƯA áp dụng vào repo
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
```

...mà không thêm `app.enableShutdownHooks()` vào `src/main.ts`, `onModuleDestroy()` sẽ **không bao
giờ được gọi** khi bạn dừng `pnpm start:dev` bằng Ctrl+C (tức `SIGINT`) hay khi Docker/Kubernetes
gửi `SIGTERM` lúc restart container — kết nối Postgres bị bỏ dở đột ngột thay vì đóng gọn gàng. Đây
là điều **NES-8 muốn bạn tự quan sát** ở bước hands-on (xem mục 🛠 Hands-on bên dưới), không phải kết
luận có sẵn ở đây.

**Khi nào KHÔNG nên dùng `enableShutdownHooks()`:** Nest tự cảnh báo trong docs — nếu bạn chạy
nhiều Nest app trong cùng 1 Node process (ví dụ chạy test song song bằng Jest), bật
`enableShutdownHooks()` ở mọi app có thể khiến Node cảnh báo "quá nhiều listener". Với app học tập
chạy đơn lẻ như repo này thì không phải lo.

> 📖 Nguồn: [docs.nestjs.com/fundamentals/lifecycle-events](https://docs.nestjs.com/fundamentals/lifecycle-events), [docs.nestjs.com/recipes/prisma](https://docs.nestjs.com/recipes/prisma)

---

### Khái niệm 3: Driver adapters trong Prisma 7 — vì sao setup hôm nay khác các tutorial cũ

**Vấn đề nó giải quyết:** Đây không phải một "khái niệm NestJS" mà là một thay đổi kiến trúc lớn
của chính Prisma, quan trọng vì nó đổi luôn cách `PrismaService` được viết so với các bài hướng dẫn
Prisma cũ (kể cả nhiều video/blog vẫn còn phổ biến).

Khi đọc trực tiếp bản `docs.nestjs.com/recipes/prisma` mới nhất (lấy hôm nay qua `gh api`, không
phải từ trí nhớ), generator mặc định trong `schema.prisma` không còn là `prisma-client-js` cũ mà là:

```groovy
generator client {
  provider      = "prisma-client"
  output        = "../src/generated/prisma"
  moduleFormat  = "cjs"
}
```

Và `PrismaService` không còn `new PrismaClient()` trơn — với PostgreSQL, nó cần một **driver
adapter** riêng (`@prisma/adapter-pg`), truyền qua option `adapter` trong constructor:

```ts
// minh hoạ — nguyên văn (rút gọn) từ docs.nestjs.com/recipes/prisma, CHƯA áp dụng vào repo
import { Injectable } from '@nestjs/common';
import { PrismaClient } from './generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'; // ví dụ SQLite trong doc

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
    super({ adapter });
  }
}
```

Với PostgreSQL (thứ repo này dùng), driver adapter tương ứng là `@prisma/adapter-pg` — pattern này
cũng được chính blog chính thức của Prisma xác nhận cho NestJS 11 + Prisma 7 + PostgreSQL (bài viết
[Build a REST API with NestJS, Prisma 7, PostgreSQL and Swagger](https://www.prisma.io/blog/nestjs-prisma-rest-api-7D056s1BmOL0),
dùng `@prisma/adapter-pg`, `onModuleInit` gọi `this.$connect()`).

**Vì sao điều này quan trọng cho hands-on của bạn:** NES-8 được viết trước khi thay đổi này phổ
biến, nên mô tả "viết `PrismaService`, connect thành công" nghe đơn giản hơn thực tế hôm nay. Có
**2 lựa chọn**, không có đáp án đúng duy nhất — đây là quyết định bạn tự cân nhắc ở bước hands-on:

| Lựa chọn                                                                                                                                                          | Ưu điểm                                                                                                     | Đánh đổi                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Pin Prisma về một bản trước khi driver adapter bắt buộc** (generator `prisma-client-js` cũ, `new PrismaClient()` trơn, import từ `@prisma/client` mặc định) | Setup đơn giản, khớp gần hết tutorial/Stack Overflow hiện có, khớp đúng độ phức tạp NES-8 hình dung ban đầu | Không phải bản mới nhất trên npm — cần tự pin version, và sẽ phải migrate lên driver adapter ở một lesson sau này                            |
| **B — Theo đúng Prisma 7 hiện tại**: generator `prisma-client`, cài thêm `@prisma/adapter-pg`, có thể cần `prisma.config.ts`                                      | Khớp "docs mới nhất" đúng nghĩa đen, không phải migrate lại sau                                             | Thêm 1 package, 1 khái niệm mới (driver adapter) phải học kèm ngay lúc học `PrismaService` — dễ rối cho lesson đầu tiên về Prisma trong Nest |

**⚠️ Lưu ý version khi cài đặt (đã tự kiểm tra hôm nay, không phải suy đoán):** `npm view prisma
dist-tags` cho thấy dist-tag `latest` của package `prisma` hiện trỏ tới bản **release candidate**
`8.0.0-rc.11`, trong khi `@prisma/client` có `latest` là `7.10.0` (bản ổn định). Nếu bạn chạy
`pnpm add -D prisma` mà không ghi rõ version, bạn có thể vô tình cài `prisma@8.0.0-rc.x` trong khi
`@prisma/client@7.10.0` — hai major khác nhau, khả năng cao không tương thích. Kiểm tra lại bằng
`pnpm exec prisma -v` ngay sau khi cài, và cân nhắc pin `"prisma": "7.10.0"` tường minh trong
`package.json` nếu muốn bản ổn định mới nhất của dòng 7.

> ⚠️ **Thực tế đã cài (PR #87, execution substitute) — khác cả A lẫn B ở trên:** reference
> implementation pin `"@prisma/client": "6.19.3"` và `"prisma": "6.19.3"` — dòng **6.x**, cũ hơn cả
> bản `7.10.0` mà Lựa chọn A gợi ý pin. Generator giữ nguyên `prisma-client-js` cổ điển, **không**
> dùng driver adapter — vì yêu cầu driver adapter bắt buộc chỉ bắt đầu từ Prisma 7 (xem đầu Khái niệm
> này), nên pin ở 6.x né được toàn bộ quyết định A/B thay vì chọn một trong hai. Đây là điểm
> lý thuyết (viết trước khi hands-on chạy) và thực tế implementation lệch nhau — xem thêm "Điều tôi
> từng hiểu sai" bên dưới.

**Khi nào KHÔNG nên dùng driver adapter:** Nếu bạn không dùng PostgreSQL/MySQL/SQL Server (ví dụ
MongoDB), Prisma 7 **không** yêu cầu driver adapter — pattern `extends PrismaClient implements
OnModuleInit, OnModuleDestroy` với `$connect()`/`$disconnect()` trơn vẫn còn nguyên. Điều này không
áp dụng cho repo (đang dùng Postgres qua `docker-compose.yml`), nêu ở đây chỉ để bạn biết driver
adapter là yêu cầu riêng của nhóm database SQL, không phải luật chung của mọi Prisma 7 project.

> 📖 Nguồn: [docs.nestjs.com/recipes/prisma](https://docs.nestjs.com/recipes/prisma) (fetch hôm nay qua `gh api`), [prisma.io/blog — NestJS + Prisma 7 + PostgreSQL](https://www.prisma.io/blog/nestjs-prisma-rest-api-7D056s1BmOL0), [prisma.io/docs — supported databases](https://www.prisma.io/docs/orm/reference/supported-databases)

---

### Khái niệm 4: Chia sẻ `PrismaService` giữa nhiều feature module

**Vấn đề nó giải quyết:** `TasksService` cần `PrismaService`. Sau này `UsersModule` (và mọi module
tương lai) cũng sẽ cần. Đăng ký `PrismaService` riêng lẻ trong `providers` của từng module vừa lặp
code, vừa tạo ra **nhiều instance khác nhau** của cùng một kết nối DB (mỗi module tự new một
`PrismaService` scope-riêng) nếu không cẩn thận với module scope của Nest.

**Cách Nest làm:** Tạo một `PrismaModule` chuyên trách, `export` `PrismaService` ra ngoài, rồi các
feature module khác chỉ cần `imports: [PrismaModule]` để inject được đúng **một** instance dùng
chung (Nest provider mặc định là singleton-scope trong phạm vi app, y hệt điều bạn đã học ở L03/L04
với `TasksService`).

```ts
// minh hoạ — CHƯA áp dụng vào repo
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

**Khi nào KHÔNG nên dùng module riêng:** Nếu app chỉ có đúng 1 feature module dùng Prisma và chắc
chắn sẽ không có module thứ hai (hiếm khi đúng), khai báo `PrismaService` thẳng trong `providers`
của module đó cũng chấp nhận được — nhưng với roadmap của repo (`UsersModule`, rồi
`ProjectsModule`/`CommentsModule` ở các lesson sau đều cần DB), tách `PrismaModule` riêng là hợp lý
ngay từ đầu.

> 📖 Nguồn: [docs.nestjs.com/recipes/prisma](https://docs.nestjs.com/recipes/prisma), [docs.nestjs.com/modules](https://docs.nestjs.com/modules)

---

## 🔗 Liên hệ kiến thức cũ

| Kiến thức đã có                                                                                                                        | Tương ứng trong NestJS                                                                                                                                                                                      | Khác nhau ở đâu                                                                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Express + Prisma: `export default new PrismaClient()` trong `db.ts`, `import prisma from './db'` rải rác ở route/service               | `PrismaService extends PrismaClient`, đăng ký qua `PrismaModule`, inject qua constructor như mọi provider khác                                                                                              | Nest quản lý **vòng đời** (connect ở `onModuleInit`, disconnect ở `onModuleDestroy` nếu bật shutdown hooks) và cho **mock được** qua `Test.createTestingModule()` — Express+dotenv-style singleton không có cả hai                                                 |
| Hexagonal architecture: domain/business logic không phụ thuộc trực tiếp hạ tầng (DB thật, network...)                                  | `PrismaService` đóng vai trò **adapter** giữa domain code (`TasksService`) và hạ tầng thật (Postgres) — domain chỉ biết `this.prisma.task.findMany()`, không biết connection string hay driver nào phía sau | `TasksService` gọi `PrismaClient` toàn cục trực tiếp = domain code biết luôn cả cách kết nối DB (đúng thứ hexagonal muốn tránh); qua `PrismaService` là một port/adapter tường minh hơn, dễ thay thế bằng mock trong test                                          |
| L06 (Configuration): `ConfigModule.forRoot({ validate })` chỉ validate `NODE_ENV`/`PORT` (xem `src/config/env.validation.ts` hiện tại) | `DATABASE_URL` đã có sẵn trong `.env`/`.env.example` từ L00 ("Dùng từ Lesson 07"), nhưng **chưa** nằm trong `EnvironmentVariables` của L06                                                                  | Nếu không tự thêm `DATABASE_URL` vào schema validate của L06 (hoặc validate riêng trong `PrismaService`), thiếu/sai `DATABASE_URL` sẽ không bị chặn lúc bootstrap — lỗi chỉ lộ ra khi `PrismaClient` thật sự cố `$connect()`, đúng bẫy đã ghi trong quiz L06 câu 2 |

**Điều tôi từng hiểu sai:** Mục này thường ghi hiểu lầm **cá nhân** phát hiện lúc tự code — nhưng
hands-on lesson này do Hermes/Codex thực thi thay (xem disclaimer đầu file), nên không có trải
nghiệm cá nhân thật để ghi vào đây. Thay vào đó, đây là 4 điểm lệch giữa Lý thuyết (viết trước khi
hands-on chạy) và implementation thật mà Claude Code phát hiện khi đọc lại diff PR #87:

1. **Version Prisma pin ở 6.19.3, không phải 7.10.0/8.0.0-rc như Khái niệm 3 bàn tới** — né được
   toàn bộ quyết định driver-adapter A/B vì yêu cầu đó chỉ áp dụng từ Prisma 7 (xem callout ngay sau
   bảng Lựa chọn A/B).
2. **`PrismaModule` có thêm `@Global()`** — Khái niệm 4 và Ví dụ minh hoạ không nêu decorator này,
   nhưng implementation thật dùng nó để mọi feature module tương lai (Users, Projects, Comments)
   không cần tự `imports: [PrismaModule]` — đúng đánh đổi "tiện lợi vs. tường minh" đã bàn ở L06
   Khái niệm 3, áp dụng lại cho module boundary thay vì config.
3. **`TasksService.update()`/`remove()` ban đầu có race condition thật** — bản đầu của PR #87 gọi
   `findOne(id)` (một query) rồi mới `update`/`delete` (query thứ hai) để lấy `NotFoundException`,
   giống hệt cấu trúc `remove()` in-memory cũ từ L04. Với DB thật, giữa hai query đó một request khác
   có thể xoá record — Prisma ném lỗi `P2025` không được bắt, lộ ra thành 500 thay vì 404. Claude Code
   bắt lỗi này ở bước review local và tự sửa (`522bab5`): bắt `P2025` trực tiếp quanh `update`/`delete`
   thay vì query kiểm tra tồn tại riêng. **Bài học chuyển từ in-memory sang DB thật:** một pattern
   "kiểm tra rồi mới sửa" (check-then-act) an toàn với mảng in-memory single-threaded có thể **không**
   an toàn với DB có nhiều request đồng thời — luôn ưu tiên để chính thao tác ghi báo lỗi not-found,
   thay vì query riêng trước đó.
4. **e2e mất vài case validation khi viết lại cho Postgres** — bản e2e cũ (in-memory) có test riêng
   cho non-boolean `completed` khi PATCH, title rỗng khi PATCH, title quá dài, title không phải
   string; bản mới gộp chung một test `'rejects invalid task input'` và một vài case đó không còn
   được exercise (DTO validate vẫn đúng, chỉ là e2e không còn chạy tới). Chưa được khôi phục ở
   closeout này — ghi vào đây để không quên khi có dịp viết lại e2e cho L07/L08.

---

## 💻 Ví dụ có giải thích

> Toàn bộ code dưới đây là **minh hoạ dựa trên docs** — mục đích dạy khái niệm theo từng bước nhỏ,
> KHÔNG phải diff chính xác của PR #87. Quyết định cuối (Lựa chọn A hay B ở Khái niệm 3) là việc
> bạn tự làm nếu tự code lại hands-on. Code **thật đã merge** (khác vài chi tiết so với minh hoạ ở
> đây — xem "Điều tôi từng hiểu sai" ở trên) nằm ở mục "✅ Bằng chứng thực thi thay" trong phần
> Hands-on bên dưới, hoặc đọc trực tiếp qua `pnpm lesson 07`.

### Ví dụ 1: `prisma/schema.prisma` — schema tối thiểu cho lesson này

```groovy
// minh hoạ — CHƯA tồn tại trong repo. Model tối thiểu, KHÔNG thêm quan hệ (relations
// thuộc phạm vi L08, không phải L07 — xem docs/ROADMAP.md).
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js" // hoặc "prisma-client" nếu chọn Lựa chọn B ở Khái niệm 3
}

model Task {
  id        Int      @id @default(autoincrement())
  title     String
  completed Boolean  @default(false)
}
```

**Giải thích:**

- `url = env("DATABASE_URL")`: Prisma đọc connection string từ biến môi trường — đúng biến đã có
  sẵn trong `.env.example` từ L00, chỉ định danh riêng, chưa được validate ở L06 (xem bảng trên).
- Model `Task` chỉ có 3 field khớp với interface `Task` hiện tại trong `src/tasks/tasks.service.ts`
  (`id`, `title`, `completed`) — mục tiêu của L07 là thay chỗ lưu trữ (in-memory → Postgres), không
  phải thiết kế lại domain model.

> 📖 Dựa trên: [docs.nestjs.com/recipes/prisma](https://docs.nestjs.com/recipes/prisma)

### Ví dụ 2: `src/prisma/prisma.service.ts` — Lựa chọn A (đơn giản, generator cũ)

```ts
// minh hoạ — CHƯA tồn tại trong repo, ứng với Lựa chọn A ở Khái niệm 3
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
```

**Giải thích:**

- `extends PrismaClient`: mọi model method (`this.task.findMany()`...) có sẵn trên `this`, không
  cần một property `prisma` lồng bên trong.
- `implements OnModuleInit, OnModuleDestroy`: khai báo tường minh 2 interface để có type-checking —
  quên viết đúng tên method (`onModuleInit` viết sai thành `onModuleinit` chẳng hạn) sẽ bị
  TypeScript bắt ngay, thay vì âm thầm không bao giờ được Nest gọi.
- Như đã nêu ở Khái niệm 2: `onModuleDestroy` ở đây **cần** `app.enableShutdownHooks()` trong
  `main.ts` mới thực sự chạy khi nhận `SIGINT`/`SIGTERM`.

> 📖 Dựa trên: [docs.nestjs.com/recipes/prisma](https://docs.nestjs.com/recipes/prisma), [docs.nestjs.com/fundamentals/lifecycle-events](https://docs.nestjs.com/fundamentals/lifecycle-events)

### Ví dụ 3: `src/tasks/tasks.service.ts` — thay in-memory bằng Prisma (trích đoạn)

```ts
// minh hoạ — trích đoạn phần SẼ ĐỔI, KHÔNG phải diff đã áp dụng
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTaskDto: CreateTaskDto) {
    return this.prisma.task.create({ data: createTaskDto });
  }

  findAll() {
    return this.prisma.task.findMany();
  }
}
```

**Giải thích:**

- So với bản hiện tại (`src/tasks/tasks.service.ts`), field `private readonly tasks: Task[] = []`
  và `nextId` biến mất hoàn toàn — Postgres tự sinh `id` qua `@default(autoincrement())`, không cần
  provider `TASK_ID_START` (custom provider từ L04) nữa cho phần này.
- Mọi method của `TasksService` giờ trả về `Promise` (query DB là bất đồng bộ) — đây là thay đổi
  **breaking** cho `TasksController` (đang gọi các method này không `await`) và cho toàn bộ test
  hiện có của `tasks.service.spec.ts`/`tasks.controller.spec.ts` — điều bạn sẽ tự thấy khi chạy
  `pnpm test` ở hands-on, không phải điều lesson note này đã sửa hộ.

> 📖 Dựa trên: [docs.nestjs.com/recipes/prisma](https://docs.nestjs.com/recipes/prisma)

---

## 🛠 Hands-on

<!-- BẠN tự code phần này. Agent không làm hộ. -->

**Yêu cầu (dựa trên NES-8, đã bổ sung chi tiết theo Lý thuyết ở trên):**

1. `docker compose up -d`, rồi `docker compose ps` — xác nhận `nestjs-training-postgres` ở trạng
   thái `healthy` (hạ tầng này đã có từ L00, không cần sửa `docker-compose.yml`).
2. Quyết định Lựa chọn A hay B ở **Khái niệm 3** (pin Prisma bản cũ hơn vs. theo đúng Prisma 7 với
   driver adapter). Ghi lại version thật đã cài (`pnpm exec prisma -v`) vào lesson note này sau khi
   xong — đừng để trống, vì đây là quyết định có ảnh hưởng tới mọi lesson Prisma sau này.
3. Cài Prisma CLI + client theo lựa chọn đã chọn, ví dụ Lựa chọn A:
   ```bash
   pnpm add -D prisma@7.10.0
   pnpm add @prisma/client@7.10.0
   pnpm exec prisma init
   ```
   Không tạo lại `.env` — file đã có `DATABASE_URL` từ L00 (xem `.env.example`).
4. Viết `prisma/schema.prisma` theo Ví dụ 1 (model `Task` tối thiểu, không thêm quan hệ).
5. `pnpm exec prisma migrate dev --name init_task` để tạo bảng thật trong Postgres.
6. Viết `src/prisma/prisma.service.ts` (Ví dụ 2 hoặc bản có driver adapter nếu chọn B) và
   `src/prisma/prisma.module.ts` (Khái niệm 4).
7. Thêm `app.enableShutdownHooks()` vào `src/main.ts` nếu muốn `onModuleDestroy` thực sự chạy khi
   Ctrl+C — tự quan sát khác biệt có/không có dòng này (xem "Cách kiểm tra" bên dưới).
8. Sửa `TasksModule` để `imports: [PrismaModule]`, sửa `TasksService` theo hướng Ví dụ 3.
9. Cân nhắc (không bắt buộc để xong lesson, nhưng nên tự quyết định): thêm `DATABASE_URL` vào
   `EnvironmentVariables` trong `src/config/env.validation.ts` (L06) để fail-fast nếu thiếu biến này
   — hay để `PrismaService` tự throw khi `$connect()` fail. Hai cách đều hợp lệ, đánh đổi đã nêu ở
   bảng "Liên hệ kiến thức cũ".

**Cách kiểm tra:**

```bash
pnpm start:dev
# Quan sát: app start bình thường, không throw ngay từ ConfigModule/PrismaService.
```

```bash
# Kiểm tra lifecycle hook thật sự hoạt động:
# 1. Thêm 1 dòng console.log tạm trong onModuleInit/onModuleDestroy của PrismaService.
# 2. pnpm start:dev, xác nhận log "onModuleInit" in ra lúc app khởi động.
# 3. Ctrl+C:
#    - Nếu KHÔNG gọi app.enableShutdownHooks() ở main.ts: log "onModuleDestroy" KHÔNG in ra.
#    - Nếu CÓ gọi: log "onModuleDestroy" in ra trước khi process thoát.
# 4. Xoá console.log tạm sau khi quan sát xong — đừng để log rác trong code merge.
```

```bash
# Test CRUD qua Postgres thật, ví dụ bằng curl hoặc Postman collection của repo:
curl -X POST localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Học Prisma"}'
curl localhost:3000/tasks
# Xác nhận dữ liệu còn lại sau khi restart app (khác hẳn in-memory cũ — đây chính là mục tiêu L07).
```

```bash
pnpm test      # nhiều test cũ của TasksService/TasksController sẽ đỏ — cần cập nhật mock
pnpm test:e2e  # cần Postgres đang chạy; cân nhắc DATABASE_URL_TEST riêng (đã có trong .env.example, dùng đầy đủ từ L17)
pnpm verify    # chạy trước khi mở PR
```

**Vướng ở đâu, gỡ thế nào:**

- Lỗi kiểu `PrismaClientInitializationError` hoặc phàn nàn về `adapter`/`PrismaClientOptions`: dấu
  hiệu bạn đang ở Lựa chọn B (Prisma 7 + driver adapter) nhưng thiếu package `@prisma/adapter-pg`
  hoặc chưa truyền `adapter` vào `super({...})` — hoặc đang trộn lẫn cả hai lựa chọn A/B.
- `prisma migrate dev` báo không kết nối được DB: kiểm tra `docker compose ps` đã `healthy` chưa,
  và `DATABASE_URL` trong `.env` có đúng cổng `5433` (không phải `5432` mặc định) như comment trong
  `.env.example` đã ghi.
- Test cũ đỏ hàng loạt sau khi đổi `TasksService` sang `Promise`: đúng như dự đoán ở Ví dụ 3 — cần
  cập nhật `tasks.service.spec.ts` để mock `PrismaService` (`Test.createTestingModule()` +
  `overrideProvider`), không phải lỗi của bước trước đó.

### ✅ Bằng chứng thực thi thay — PR #87 (kết quả thật, không phải hướng dẫn)

> Xem disclaimer đầu file: phần dưới đây mô tả code **đã chạy thật** trong PR #87
> (`codex/nes-8-l07-prisma-postgresql-prismaservice` → `main`, merge `5791085`), không phải việc
> Hien Duong tự làm. Sentinel thực thi: `.hermes/runs/NES-8-claude-review.json` (review local),
> `NES-8-claude-p1-fix.json` (P1 fix), `NES-8-postmerge-audit.json` (audit sau merge) — cả ba đều
> gitignored, không nằm trong lịch sử git.

**0. Dependency.** `@prisma/client@6.19.3` vào `dependencies`, `prisma@6.19.3` vào `devDependencies`
— dòng 6.x, không phải 7.10.0/8.0.0-rc bàn ở Khái niệm 3 (xem callout + "Điều tôi từng hiểu sai").
Generator `prisma-client-js` cổ điển, không driver adapter.

**1. `prisma/schema.prisma`.** Model `Task` (`id` autoincrement, `title` String, `completed` Boolean
`@default(false)`) — khớp đúng Ví dụ 1, không thêm quan hệ. Migration
`prisma/migrations/20260826162300_init/migration.sql` sinh kèm (`CREATE TABLE "Task"`) nhưng
**chưa từng được apply lên một Postgres thật** — PR #87 tự khai Docker không có sẵn lúc thực thi.

**2. `src/prisma/prisma.service.ts`.** `PrismaService extends PrismaClient implements OnModuleInit,
OnModuleDestroy` — `$connect()`/`$disconnect()` — khớp Ví dụ 2 (Lựa chọn A, không adapter).
`src/prisma/prisma.module.ts` thêm `@Global()` (khác Ví dụ minh hoạ ở Khái niệm 4 — xem "Điều tôi
từng hiểu sai" #2), export `PrismaService`. `src/app.module.ts` import `PrismaModule`.

**3. `src/main.ts`.** Thêm `app.enableShutdownHooks()` trước khi đọc `PORT` — đúng điều kiện
`onModuleDestroy` thật sự chạy đã nêu ở Khái niệm 2.

**4. `src/config/env.validation.ts`.** Thêm `DATABASE_URL` (`@IsDefined @IsString @IsUrl({protocols:
['postgresql','postgres'], require_tld:false})`) vào `EnvironmentVariables` — chọn nhánh "thêm vào
schema validate của L06" trong 2 lựa chọn đã nêu ở bảng "Liên hệ kiến thức cũ" (thay vì để
`PrismaService` tự throw lúc `$connect()`).

**5. `src/tasks/tasks.service.ts`.** CRUD đầy đủ qua `this.prisma.task.*`, mọi method `async`. Bản
đầu của PR #87 có race condition thật ở `update()`/`remove()` (xem "Điều tôi từng hiểu sai" #3) —
Claude Code phát hiện lúc review local và tự sửa bằng commit `522bab5` trước khi PR merge: bắt lỗi
Prisma `P2025` trực tiếp quanh `update`/`delete`, bỏ hẳn query `findOne()` kiểm tra tồn tại riêng.

**6. Test.** Unit test (`tasks.service.spec.ts`, `tasks.controller.spec.ts`, `env.validation.spec.ts`,
`main.spec.ts`) mock `PrismaService` ở boundary — không chạm DB thật. `test/tasks.e2e-spec.ts` viết
lại để chạy CRUD qua `PrismaService` thật (kể cả gọi `app.get(PrismaService).task.deleteMany()` ở
`beforeEach`) nhưng **đòi hỏi Postgres sống** — bộ e2e này **chưa từng chạy được**, không local
(Docker waived) và không CI (xem ngay dưới). Cũng lưu ý: vài case validation cũ bị gộp/mất khi viết
lại (xem "Điều tôi từng hiểu sai" #4).

**7. CI.** `pnpm-workspace.yaml` cần mở rộng `allowBuilds` cho `@prisma/client`/`@prisma/engines`/
`prisma` — thiếu bước này khiến `pnpm install --frozen-lockfile` fail với `ERR_PNPM_IGNORED_BUILDS`
trên GitHub Actions; Claude Code tự sửa (commit `3f75e42`) sau khi phát hiện qua log CI đỏ.
`.github/workflows/ci.yml` **không đổi** — service `postgres` + step E2E vẫn bị comment out (đã có
từ trước PR #87), nên `pnpm test:e2e` **chưa bao giờ được CI chạy** cho bất kỳ lesson nào tính đến
thời điểm này, không riêng L07.

**Kết quả verify (chạy lại tại thời điểm review/fix, khớp CI của PR #87):** Prisma schema validate —
PASS. `pnpm exec eslint --max-warnings=0` — PASS. `pnpm exec prettier --check` — PASS. `pnpm test`
(`--runInBand --watchman=false`) — 9 suites / 34 tests PASS (Prisma mock ở boundary — **không phải**
test chạy với Postgres thật). `pnpm build` (`nest build`) — PASS. GitHub Actions CI trên PR #87
(`Lint · Test · Build`) — SUCCESS, merge commit `5791085e5d67b8e4babe915cd72d601e4abca94e`.
**`pnpm test:e2e` với Postgres thật — KHÔNG chạy, ở bất kỳ bước nào của toàn bộ lịch sử L07.**

---

## ✅ Definition of Done

<!-- Copy từ NES-8. Tick dựa trên bằng chứng thực thi thay (PR #87) — KHÔNG phải bạn tự hoàn
     thành. Mục thứ 2 CỐ TÌNH để trống, xem lý do ngay dưới bảng. -->

- [x] Lesson note đầy đủ (lý thuyết + hands-on reference + quiz execution-substitute — xem
      disclaimer đầu file)
- [ ] `docker compose ps` healthy, CRUD Tasks chạy qua Postgres thật — **CHƯA xác minh.** Docker bị
      waive theo uỷ quyền user khi thực thi PR #87; migration + e2e CRUD qua Postgres thật chưa từng
      chạy ở bất kỳ đâu (không local, không CI — xem "Bằng chứng thực thi thay" ở trên). Đây là gap
      **khác về bản chất** so với L05/L06: hai lesson đó không phụ thuộc runtime DB nên "waive
      Docker" chưa từng là vấn đề của chúng; mục tiêu cốt lõi của L07 chính là "dữ liệu sống trong
      Postgres thật" (xem mục tiêu Phase 2 ở `docs/ROADMAP.md`), nên gap này **không tự động coi là
      đã đóng** chỉ vì code/CI xanh.
- [x] Test pass (static + unit + CI) — `pnpm test` 9 suites/34 tests, ESLint `--max-warnings=0`,
      Prettier, `nest build` đều PASS; GitHub Actions CI xanh trên PR #87 (`5791085`). **Không bao
      gồm** `pnpm test:e2e` chạy thật với Postgres — case đó chưa từng chạy (xem trên).
- [ ] Quiz pass — câu trả lời ở mục "Ôn tập & Quiz" bên dưới là **execution substitute của Claude
      Code**, không phải bạn tự trả lời và được mentor xác nhận hiểu. Mục này chỉ đóng thật khi bạn
      tự làm lại quiz.
- [x] PR merged — PR #87 (`Fixes NES-8`) và PR #88 (`Fixes NES-81`) đã merge vào `main`, CI xanh cả
      hai (`5791085`, `8283a3f`).
- [ ] Bản EN (`example/nestjs-training`) mirror L07 — **PENDING**, chưa có commit nào trên branch đó
      cho lesson 07/NES-8/NES-81. Không coi 2 bản vi/en đang song song cho lesson này cho tới khi
      mục này được tick.

---

## ✅ Ôn tập & Quiz

> Trả lời dưới đây là **bằng chứng thực thi thay** của Claude Code (xem disclaimer đầu file), dựa
> trực tiếp trên code thật trong PR #87 và docs gốc — không phải câu trả lời tự nghĩ của Hien Duong.
> Muốn học thật, tự trả lời trước khi đọc phần này.

1. **Hỏi:** `onModuleDestroy()` của `PrismaService` không tự chạy khi bạn Ctrl+C `pnpm start:dev`,
   trừ khi thêm đúng 1 dòng ở đâu? Dòng đó làm gì về mặt cơ chế — nó không tự "gọi" `onModuleDestroy`,
   vậy nó thay đổi điều gì?
   **Trả lời:** Dòng đó là `app.enableShutdownHooks()` trong `src/main.ts` (PR #87 thêm ngay trước
   khi đọc `PORT`). Về cơ chế, nó **không** trực tiếp gọi `onModuleDestroy()` — nó đăng ký listener
   cho system signal (`SIGINT`/`SIGTERM`) lên `process`, để khi nhận được signal đó Nest tự gọi
   `app.close()`, và `app.close()` mới là thứ chạy `onModuleDestroy()` trên mọi provider implement
   interface đó (ở đây là `PrismaService.$disconnect()`). Không gọi `enableShutdownHooks()` thì
   `process` nhận `SIGINT` và thoát thẳng theo hành vi mặc định của Node — `app.close()` không bao
   giờ được gọi, nên `$disconnect()` cũng không bao giờ chạy, kết nối Postgres bị bỏ dở.

2. **Hỏi:** Lý thuyết ở Khái niệm 3 đưa ra 2 lựa chọn (A: pin Prisma cũ hơn, dùng generator cổ điển;
   B: theo đúng Prisma 7 + driver adapter). Bản implementation thật trong PR #87 chọn phương án nào —
   và vì sao nó thực ra né được toàn bộ quyết định đó thay vì chọn hẳn A hay B?
   **Trả lời:** PR #87 pin `"@prisma/client": "6.19.3"` và `"prisma": "6.19.3"` — dòng **6.x**, cũ hơn
   cả bản `7.10.0` mà Lựa chọn A đề xuất pin. Generator vẫn là `prisma-client-js` cổ điển, không có
   driver adapter (`@prisma/adapter-pg`). Vì yêu cầu driver adapter bắt buộc **chỉ bắt đầu từ Prisma
   7** (nêu ở đầu Khái niệm 3), việc ở lại 6.x khiến toàn bộ tình huống "phải chọn A hay B" chưa bao
   giờ xảy ra với implementation này — nó né bằng cách đứng trước ranh giới đó, không phải bằng cách
   chọn 1 trong 2 nhánh sau ranh giới.

3. **Hỏi:** Bản đầu của `TasksService.update()`/`remove()` trong PR #87 gọi `findOne(id)` rồi mới gọi
   `prisma.task.update()`/`.delete()` riêng. Chính xác kịch bản nào khiến cách viết này sai, và cách
   sửa (`522bab5`) loại bỏ vấn đề đó như thế nào — không phải chỉ "thêm try/catch" chung chung?
   **Trả lời:** Kịch bản sai: giữa lúc `findOne(id)` trả về task tồn tại và lúc `update`/`delete`
   thực sự chạy, một request khác (hoặc chính request đó chạy 2 lần do retry) có thể xoá đúng row đó
   — đây là race condition kiểu TOCTOU (time-of-check-to-time-of-use), thứ không thể xảy ra với mảng
   in-memory single-threaded của L04 nhưng hoàn toàn có thể xảy ra với DB nhiều connection đồng thời.
   Khi đó `prisma.task.update`/`.delete` ném `PrismaClientKnownRequestError` mã `P2025` ("record to
   update/delete not found") — không được bắt, lộ ra thành lỗi 500 chưa xử lý thay vì `404
NotFoundException` đúng ý định. Cách sửa không phải "bọc try/catch cho có" — nó **bỏ hẳn**
   `findOne()` khỏi `update()`/`remove()`, để chính `update`/`delete` là điểm kiểm tra tồn tại duy
   nhất (Postgres tự bảo đảm tính nguyên tử của thao tác đó), rồi bắt riêng mã lỗi `P2025` để dịch
   sang `NotFoundException(`Task ${id} not found`)` — các mã lỗi Prisma khác được `throw error` lại
   nguyên vẹn, không bị nuốt. Kết quả: chỉ còn 1 query DB thay vì 2, và không còn khoảng hở thời gian
   giữa "kiểm tra" và "sửa" nữa.

4. **Hỏi:** `PrismaModule` trong PR #87 có thêm `@Global()` — decorator này không xuất hiện trong Ví
   dụ minh hoạ ở Khái niệm 4. `@Global()` đổi điều gì so với một `@Module` thường, và đánh đổi đó
   giống hệt tradeoff nào bạn đã học ở L06?
   **Trả lời:** Một `@Module` thường phải được `imports: [PrismaModule]` tường minh ở **mỗi** feature
   module muốn dùng `PrismaService` (`TasksModule`, rồi sau này `UsersModule`, `ProjectsModule`...).
   `@Global()` làm cho mọi provider mà module đó export (ở đây là `PrismaService`) tự động khả dụng ở
   **mọi nơi** trong app sau khi `PrismaModule` được import đúng 1 lần ở `AppModule` — không cần lặp
   lại `imports` ở từng feature module nữa. Đây đúng là tradeoff "tiện lợi vs. tường minh" đã bàn ở
   L06 Khái niệm 3 cho `ConfigModule.forRoot({ isGlobal: true })`: đổi lấy việc không phải lặp code,
   bạn mất đi khả năng đọc riêng `imports` của một module và biết ngay nó có phụ thuộc DB hay không —
   ranh giới hexagonal (module nào cần port nào) bị mờ đi một chút để đổi lấy sự tiện lợi, hệt như
   `isGlobal: true` của `ConfigModule`.

5. **Hỏi:** CI trên PR #87 chạy xanh (`Lint · Test · Build`: install, eslint, prettier, `pnpm test`,
   `nest build`). Điều đó chứng minh được gì về việc CRUD Tasks hoạt động đúng với Postgres thật — và
   không chứng minh được gì? Chỉ ra chính xác lớp nào trong stack đã được verify, lớp nào chưa.
   **Trả lời:** CI xanh chứng minh: code biên dịch được (`nest build`), không lỗi lint/format, và
   toàn bộ **unit test** pass — nhưng `tasks.service.spec.ts` mock `PrismaService` hoàn toàn ở
   boundary (`{ task: { create: jest.fn(), ... } }`), nên nó chỉ chứng minh `TasksService` **gọi
   đúng method Prisma với đúng tham số** (ví dụ `prisma.task.update` được gọi với
   `{ where: { id }, data: updateTaskDto }`), **không** chứng minh Postgres thật trả về đúng kết quả
   khi những lệnh SQL đó thực sự chạy. Lớp **chưa** được verify: `test/tasks.e2e-spec.ts` (đòi
   `PrismaService` kết nối Postgres thật qua `app.get(PrismaService).task.deleteMany()`) chưa từng
   chạy được — không local (Docker waived khi PR #87 thực thi) và không CI (`.github/workflows/ci.yml`
   vẫn comment out service `postgres` + step E2E, một gap có từ trước PR này, không riêng L07). Nói
   ngắn gọn: CI xanh = "code đúng cú pháp và gọi đúng API Prisma", **không phải** "app CRUD được thật
   với một Postgres đang chạy".

**Ôn lại lesson trước:** L06 dạy "fail fast ở biên process" — validate biến môi trường lúc bootstrap
thay vì để lỗi lộ ra muộn. L07 áp dụng đúng nguyên tắc đó cho `DATABASE_URL`: PR #87 chọn thêm nó vào
`EnvironmentVariables` (`@IsUrl`) thay vì để `PrismaService.$connect()` tự throw — nghĩa là thiếu/sai
`DATABASE_URL` giờ bị chặn **trước** khi `NestFactory.create()` trả về, đúng chỗ chặn mà quiz L06 câu
2 đã dự đoán là cần thiết cho lesson này.

---

## 🧠 Điểm cần nhớ

1. `PrismaService` = `PrismaClient` bọc trong `@Injectable()` — Nest quản lý vòng đời và cho mock
   được, thay cho singleton toàn cục kiểu Express + `dotenv`.
2. `onModuleInit()` chạy tự động lúc module init; `onModuleDestroy()` **chỉ** chạy khi có
   `app.close()` hoặc system signal **và** đã gọi `app.enableShutdownHooks()` ở `main.ts` — quên
   dòng này là bẫy phổ biến nhất của lesson này.
3. Prisma 7 (bản ổn định hiện tại `7.10.0`) yêu cầu **driver adapter** (`@prisma/adapter-pg` cho
   Postgres) cho các database SQL — khác hẳn `new PrismaClient()` trơn của tutorial cũ. **Thực tế PR
   #87 pin `6.19.3`**, né toàn bộ quyết định A/B bằng cách đứng trước ranh giới Prisma 7 (xem "Điều
   tôi từng hiểu sai" + quiz câu 2) — nếu tự làm lại hands-on, đây vẫn là quyết định của bạn.
4. `PrismaModule` export `PrismaService` để nhiều feature module dùng chung **một** instance — cùng
   nguyên lý singleton-scope provider đã học ở L03/L04. Bản merge dùng thêm `@Global()` (đánh đổi
   tiện lợi/tường minh giống `ConfigModule.forRoot({ isGlobal: true })` ở L06 — xem quiz câu 4).
5. `DATABASE_URL` đã có trong `.env` từ L00, **chưa** được validate ở L06 — PR #87 chọn thêm nó vào
   `EnvironmentVariables` (`env.validation.ts`) thay vì để `PrismaService` tự báo lỗi khi connect.
6. **Check-then-act không an toàn với DB có nhiều request đồng thời**, dù an toàn với mảng in-memory
   single-threaded của L04: `findOne()` rồi mới `update`/`delete` riêng là race condition thật (P1,
   sửa ở `522bab5`) — nên để chính thao tác ghi báo lỗi not-found (bắt `PrismaClientKnownRequestError`
   mã `P2025`) thay vì query kiểm tra tồn tại trước.
7. **CI xanh (unit test + build) không chứng minh CRUD hoạt động với Postgres thật** — `pnpm test`
   mock `PrismaService` ở boundary; `pnpm test:e2e` (đòi Postgres sống) chưa từng chạy được ở bất kỳ
   bước nào của L07 (Docker waived cục bộ, service Postgres + step E2E vẫn tắt trên CI). Phân biệt rõ
   "code gọi đúng API Prisma" và "app thật sự CRUD được với DB đang chạy" là bài học lớn nhất closeout
   này — xem "Definition of Done" để biết chính xác gate nào còn mở.

---

## 📎 Nguồn

- [docs.nestjs.com/recipes/prisma](https://docs.nestjs.com/recipes/prisma)
- [docs.nestjs.com/fundamentals/lifecycle-events](https://docs.nestjs.com/fundamentals/lifecycle-events)
- [docs.nestjs.com/techniques/configuration](https://docs.nestjs.com/techniques/configuration) — bẫy `DATABASE_URL` chưa validate, xem bảng Liên hệ kiến thức cũ
- [prisma.io/docs — supported databases](https://www.prisma.io/docs/orm/reference/supported-databases)
- [prisma.io/docs — connection URLs](https://www.prisma.io/docs/orm/reference/connection-urls)
- [prisma.io/blog — Build a REST API with NestJS, Prisma 7, PostgreSQL and Swagger](https://www.prisma.io/blog/nestjs-prisma-rest-api-7D056s1BmOL0)
- `docs/lessons/06-configuration/README.md` — `ConfigService`/`env.validation.ts` hiện tại, liên quan trực tiếp tới `DATABASE_URL`
