# L07 — Prisma + PostgreSQL: PrismaService

|                |                                                              |
| -------------- | ------------------------------------------------------------ |
| **Phase**      | 2 — Working with Data                                        |
| **Linear**     | NES-8 (sub-issue: NES-81 Theory & note)                      |
| **Branch**     | `duongthehien2001/nes-8-l07-prisma-postgresql-prismaservice` |
| **Docs chính** | [/recipes/prisma](https://docs.nestjs.com/recipes/prisma)    |
| **Ngày học**   | 2026-08-26                                                   |

> 📝 **File này chỉ mới có phần Lý thuyết (NES-81).** Hands-on (viết `PrismaService`, chuyển
> `TasksService` sang Prisma) và Ôn tập & Quiz **chưa chạy** — hai mục đó vẫn để trống, đúng vai
> "hands-on tự làm" của repo (`AGENTS.md`). Đừng đọc phần dưới như bằng chứng đã hoàn thành.

---

## 🗂 File map lesson này

> Bản đồ chính xác nhất + đọc từng file code (kèm số dòng), khi đã có commit: chạy `pnpm lesson 07`.
> Các file dưới đây **chưa tồn tại** — đây là danh sách dự kiến theo hands-on của NES-8, không phải
> file đã tạo.

| File                                          | Vai trò (lý thuyết / ref / hands-on)                                                         | Tạo ở lesson | Trạng thái            |
| --------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------ | --------------------- |
| `docs/lessons/07-prisma-postgresql/README.md` | Lý thuyết (mục này) + hướng dẫn hands-on + quiz để trống                                     | L07          | ✅ Lý thuyết (NES-81) |
| `prisma/schema.prisma`                        | Schema tối thiểu — model `Task` (không quan hệ, không migration nâng cao, việc đó thuộc L08) | L07          | Chưa tạo — hands-on   |
| `src/prisma/prisma.service.ts`                | Provider bọc `PrismaClient`, lifecycle hook `onModuleInit`/`onModuleDestroy`                 | L07          | Chưa tạo — hands-on   |
| `src/prisma/prisma.module.ts`                 | Module export `PrismaService` để các feature module khác dùng chung                          | L07          | Chưa tạo — hands-on   |
| `src/tasks/tasks.service.ts`                  | Sửa — thay mảng in-memory bằng gọi qua `PrismaService`                                       | L04          | Chưa sửa — hands-on   |

---

## 🎯 Mục tiêu

<!-- Copy nguyên văn từ NES-8 — chưa tick vì hands-on chưa chạy. -->

- [ ] Bọc `PrismaClient` thành một `@Injectable()` provider (`PrismaService`)
- [ ] Dùng lifecycle hook `onModuleInit`/`onModuleDestroy` để connect/disconnect đúng lúc
- [ ] Inject `PrismaService` vào `TasksService`, thay in-memory bằng query thật

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

**Điều tôi từng hiểu sai:** _(để trống — mục này chỉ có ý nghĩa sau khi tự code hands-on và tự va
vấp; đừng điền hộ ở bước lý thuyết)_

---

## 💻 Ví dụ có giải thích

> Toàn bộ code dưới đây là **minh hoạ dựa trên docs**, chưa được áp dụng vào repo. Quyết định cuối
> (Lựa chọn A hay B ở Khái niệm 3) là việc bạn tự làm ở hands-on.

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

---

## ✅ Definition of Done

<!-- Copy từ NES-8, giữ nguyên chưa tick — hands-on/quiz chưa chạy. -->

- [ ] Lesson note đầy đủ (mục này — lý thuyết đã xong, hands-on/quiz còn thiếu)
- [ ] `docker compose ps` healthy, CRUD Tasks chạy qua Postgres thật
- [ ] Test pass, quiz pass, PR merged

---

## ✅ Ôn tập & Quiz

<!-- Điền sau bước /lesson-review. Trả lời bằng lời của mình, KHÔNG copy đáp án.
     Nếu không tự trả lời được thì lesson chưa xong — quay lại phần Lý thuyết.
     Để trống có chủ đích ở bước Theory & note (NES-81) — KHÔNG điền hộ. -->

1. **Hỏi:** ...
   **Trả lời:** ...

**Ôn lại lesson trước:** ...

---

## 🧠 Điểm cần nhớ

1. `PrismaService` = `PrismaClient` bọc trong `@Injectable()` — Nest quản lý vòng đời và cho mock
   được, thay cho singleton toàn cục kiểu Express + `dotenv`.
2. `onModuleInit()` chạy tự động lúc module init; `onModuleDestroy()` **chỉ** chạy khi có
   `app.close()` hoặc system signal **và** đã gọi `app.enableShutdownHooks()` ở `main.ts` — quên
   dòng này là bẫy phổ biến nhất của lesson này.
3. Prisma 7 (bản ổn định hiện tại `7.10.0`) yêu cầu **driver adapter** (`@prisma/adapter-pg` cho
   Postgres) cho các database SQL — khác hẳn `new PrismaClient()` trơn của tutorial cũ; đây là
   quyết định (Lựa chọn A/B) bạn tự chốt ở hands-on, không phải mặc định có sẵn.
4. `PrismaModule` export `PrismaService` để nhiều feature module dùng chung **một** instance —
   cùng nguyên lý singleton-scope provider đã học ở L03/L04.
5. `DATABASE_URL` đã có trong `.env` từ L00 nhưng **chưa** được validate ở L06 — tự quyết định có
   thêm vào `env.validation.ts` hay để `PrismaService` tự báo lỗi khi connect.

---

## 📎 Nguồn

- [docs.nestjs.com/recipes/prisma](https://docs.nestjs.com/recipes/prisma)
- [docs.nestjs.com/fundamentals/lifecycle-events](https://docs.nestjs.com/fundamentals/lifecycle-events)
- [docs.nestjs.com/techniques/configuration](https://docs.nestjs.com/techniques/configuration) — bẫy `DATABASE_URL` chưa validate, xem bảng Liên hệ kiến thức cũ
- [prisma.io/docs — supported databases](https://www.prisma.io/docs/orm/reference/supported-databases)
- [prisma.io/docs — connection URLs](https://www.prisma.io/docs/orm/reference/connection-urls)
- [prisma.io/blog — Build a REST API with NestJS, Prisma 7, PostgreSQL and Swagger](https://www.prisma.io/blog/nestjs-prisma-rest-api-7D056s1BmOL0)
- `docs/lessons/06-configuration/README.md` — `ConfigService`/`env.validation.ts` hiện tại, liên quan trực tiếp tới `DATABASE_URL`
