# L06 — Configuration & environment variables

|                |                                                                                  |
| -------------- | -------------------------------------------------------------------------------- |
| **Phase**      | 2 — Working with Data                                                            |
| **Linear**     | NES-7 (sub-issue: NES-69 Theory & note · NES-72 Hands-on · NES-77 Review & quiz) |
| **Branch**     | `duongthehien2001/nes-7-l06-configuration-environment-variables`                 |
| **Docs chính** | [/techniques/configuration](https://docs.nestjs.com/techniques/configuration)    |
| **Ngày học**   | 2026-08-26                                                                       |

> 📝 **Toàn bộ phần Hands-on + Quiz của lesson này được thực thi thay**, không phải "bạn tự làm" như scaffold gốc. Xem disclaimer ngay dưới đây trước khi đọc tiếp — đây là tuyên bố có hiệu lực.

> ⚠️ **Disclaimer — execution substitute (2026-08-26):** Phần **🛠 Hands-on** (NES-72: cài `@nestjs/config`, viết `src/config/env.validation.ts` bằng `class-validator`, đăng ký `ConfigModule.forRoot` trong `app.module.ts`, sửa `main.ts` đọc `PORT` qua `ConfigService`) được **Hermes/Codex thực thi thay** qua PR #82 (`Fixes NES-7`, branch `codex/nes-7-l06-config-implementation`, merge commit `f496a77`). Phần **✅ Ôn tập & Quiz** (NES-77) được **Claude Code thực thi thay** ở bước closeout, dựa trên đọc lại diff PR #82 và docs gốc — không phải câu trả lời do Hien Duong tự nghĩ ra. Cả hai nằm trong **ngoại lệ user duyệt một lần (approved one-time execution-substitute authorization, 2026-08-26)** vì user đang bận. Đây là **bằng chứng thực thi thay**: code chạy thật, test pass thật (`pnpm test` 9 suites/28 tests, `pnpm test:e2e` 3 suites/13 tests, `pnpm verify` PASS — verify lại tại thời điểm closeout), lý luận quiz dựa trên code thật — **KHÔNG phải xác nhận rằng Hien Duong đã tự tay code hands-on hoặc tự trả lời quiz này**. Muốn học thật, hãy tự làm lại hands-on và tự trả lời quiz trước khi đọc phần bên dưới.

---

## 🗂 File map lesson này

> Bản đồ chính xác nhất + đọc từng file code (kèm số dòng): chạy `pnpm lesson 06`.
> Bảng này là bản tóm tắt để đọc nhanh; cập nhật khi lesson xong.

| File                                      | Vai trò (lý thuyết / ref / hands-on)                                                                                        | Tạo ở lesson | Trạng thái                               |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------- |
| `docs/lessons/06-configuration/README.md` | Lý thuyết + hướng dẫn hands-on + quiz                                                                                       | L06          | Merged (PR #81, closeout ở bước này)     |
| `docs/lessons/06-configuration/SPEC.md`   | Bản chiếu NES-7 cho coder agent                                                                                             | L06          | Merged (PR #81)                          |
| `.env.example`                            | **Đã tồn tại từ L00** — không cần thêm biến mới, chỉ `NODE_ENV`/`PORT` được dùng và validate                                | L00          | Không đổi — đã đủ biến cần validate      |
| `package.json` / `pnpm-lock.yaml`         | Thêm dependency `@nestjs/config@^4.0.4` (0 dependency validate mới — tái dùng `class-validator`/`class-transformer` từ L05) | —            | ✅ Merged (PR #82, execution substitute) |
| `src/config/env.validation.ts`            | Hands-on — schema validate bằng `class-validator` (Lựa chọn B, Khái niệm 4)                                                 | L06          | ✅ Merged (PR #82, execution substitute) |
| `src/config/env.validation.spec.ts`       | Test — config hợp lệ + 6 case invalid → throw                                                                               | L06          | ✅ Merged (PR #82, execution substitute) |
| `src/app.module.ts`                       | Hands-on — đăng ký `ConfigModule.forRoot({ isGlobal: true, validate })`                                                     | L01/L04      | ✅ Merged (PR #82, execution substitute) |
| `src/main.ts`                             | Hands-on — đổi `process.env.PORT ?? 3000` sang `app.get(ConfigService).get('PORT')`, throw nếu `undefined`                  | L01          | ✅ Merged (PR #82, execution substitute) |
| `src/main.spec.ts`                        | Test — `bootstrap()` đọc `PORT` qua `ConfigService` trước khi `listen()`                                                    | L06          | ✅ Merged (PR #82, execution substitute) |
| `test/setup-env.ts`                       | Test setup — cấp `NODE_ENV`/`PORT` không-bí-mật cho e2e (e2e không chạy `main.ts`)                                          | L06          | ✅ Merged (PR #82, execution substitute) |
| `test/jest-e2e.json`                      | Sửa — thêm `setupFiles: ["<rootDir>/setup-env.ts"]`                                                                         | L02          | ✅ Merged (PR #82, execution substitute) |

---

## 🎯 Mục tiêu

- [x] Dùng `@nestjs/config` với `ConfigModule.forRoot`
- [x] Validate schema biến môi trường (Joi hoặc class-validator) — app từ chối start nếu thiếu env
- [x] Inject `ConfigService` thay vì đọc `process.env` trực tiếp trong business logic

> Đã tick dựa trên **bằng chứng thực thi thay** (code chạy thật + test pass thật ở PR #82) — **không phải** bằng chứng Hien Duong tự tay code hands-on. Xem disclaimer đầu file.

## 📚 Lý thuyết

### Khái niệm 1: `ConfigModule.forRoot()` — tập trung việc đọc biến môi trường

**Vấn đề nó giải quyết:** Trong một app Express + `dotenv` điển hình, `process.env.X` bị đọc rải rác ở mọi file: `main.ts` đọc `PORT`, một service đọc `JWT_SECRET`, một service khác đọc `DATABASE_URL`. Không ai đảm bảo biến đó **thực sự tồn tại** lúc runtime — thiếu biến chỉ lộ ra khi đúng dòng code đó chạy tới, có khi là giữa lúc xử lý request của người dùng thật.

**Cách Nest làm:** `@nestjs/config` cung cấp sẵn một `ConfigModule` bọc quanh [`dotenv`](https://github.com/motdotla/dotenv) (chính package bạn đã dùng với Express). Import và gọi `ConfigModule.forRoot()` trong `AppModule`:

```ts
// file: src/app.module.ts (minh hoạ — chưa áp dụng vào code thật)
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // không phải import lại ConfigModule ở TasksModule, UsersModule...
    }),
  ],
})
export class AppModule {}
```

`forRoot()` đọc file `.env` ở project root, merge với `process.env` thật (biến shell export đè lên biến trong `.env`), rồi đăng ký provider `ConfigService` để đọc lại giá trị đã merge đó. Đây chính xác là pattern **dynamic module** bạn đã tự viết ở `TasksConfigModule.forRoot()` (L04, xem `src/tasks/tasks-config.module.ts`) — khác biệt duy nhất: lần này Nest đã viết module đó sẵn cho bạn, và nó có thêm validate.

**Khi nào KHÔNG nên dùng:** Nếu app chỉ có 1-2 biến môi trường và không bao giờ tăng thêm (hiếm khi đúng trong thực tế), viết trực tiếp `process.env.X` với type-guard tay cũng chấp nhận được. Ngay khi có ≥ 2 module cần đọc config hoặc bạn cần validate lúc bootstrap, lợi ích của `ConfigModule` vượt xa chi phí thêm 1 dependency.

> 📖 Nguồn: [docs.nestjs.com/techniques/configuration#getting-started](https://docs.nestjs.com/techniques/configuration#getting-started)

---

### Khái niệm 2: Inject `ConfigService` — vì sao business logic không nên đọc `process.env` trực tiếp

**Vấn đề nó giải quyết:** `process.env.X` là một biến toàn cục ẩn (giống pattern "global singleton" mà `AGENTS.md` của repo này cấm dùng cho DI: _"không import singleton toàn cục"_). Một `TasksService` đọc `process.env.TASKS_PAGE_SIZE` trực tiếp thì:

- Không thể unit test dễ dàng — muốn test 2 giá trị khác nhau phải mutate `process.env` toàn cục giữa các test (rò rỉ state giữa test case).
- Không tập trung — muốn biết app dùng bao nhiêu biến môi trường, phải grep toàn bộ `src/`.
- Không có type — `process.env.X` luôn có type `string | undefined`, dù bạn biết chắc nó là số.

**Cách Nest làm:** Inject `ConfigService` qua constructor, giống mọi provider khác trong Nest:

```ts
// file: src/tasks/tasks.service.ts (minh hoạ đoạn thêm — KHÔNG phải code thật hiện tại)
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TasksService {
  constructor(private readonly configService: ConfigService) {}

  private get defaultPageSize(): number {
    // so sánh với process.env.TASKS_PAGE_SIZE trực tiếp: có type, có default, có 1 nguồn sự thật
    return this.configService.get<number>('TASKS_PAGE_SIZE', 20);
  }
}
```

So với cách cũ (`process.env.TASKS_PAGE_SIZE`), `ConfigService.get()` cho type hint, cho default value tường minh (tham số thứ 2), và — quan trọng nhất khi test — có thể **mock `ConfigService` qua `Test.createTestingModule()`** thay vì mutate `process.env` toàn cục.

**Khi nào KHÔNG nên dùng:** `main.ts` là ngoại lệ hợp lý — nó chạy trước khi `NestFactory.create()` trả về `app`, nên vẫn có thể cần đọc `process.env` thô cho việc rất sớm (ví dụ chọn `.env` file nào để load). Nhưng **sau khi `app` đã tồn tại**, `main.ts` cũng nên lấy `ConfigService` qua `app.get(ConfigService)` thay vì tiếp tục đọc `process.env` — xem Ví dụ 2 bên dưới, vì hiện tại `src/main.ts` đang làm sai điều này.

> 📖 Nguồn: [docs.nestjs.com/techniques/configuration#using-the-configservice](https://docs.nestjs.com/techniques/configuration#using-the-configservice)

---

### Khái niệm 3: Nạp `.env`, `isGlobal`, `cache`, `ignoreEnvFile`, custom configuration — đánh đổi ở đâu

**Vấn đề nó giải quyết:** Không phải app nào cũng nạp config theo đúng 1 cách. Môi trường local đọc file `.env`; môi trường production (container/CI) thường **không có file `.env`** — biến do platform (Docker, CI secret, v.v.) inject thẳng vào `process.env`. `ConfigModule.forRoot()` có option cho từng tình huống:

| Option                | Ý nghĩa                                                                                            | Đánh đổi                                                                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `isGlobal: true`      | Đăng ký `ConfigModule`/`ConfigService` toàn app, không cần import lại ở mỗi feature module         | Tiện, nhưng che mất việc module nào thật sự phụ thuộc config — hexagonal thuần túy sẽ muốn import rõ ràng từng nơi cần                         |
| `envFilePath`         | Chỉ định file khác `.env` (vd `.env.development`), có thể là mảng — file đầu có precedence cao hơn | Cho phép nhiều môi trường, nhưng dễ nhầm thứ tự ưu tiên nếu không đọc kỹ mảng                                                                  |
| `ignoreEnvFile: true` | Bỏ qua hoàn toàn việc đọc file `.env`, chỉ dùng biến đã có sẵn trong `process.env`                 | Đúng cho production thật (deploy không kèm `.env`), nhưng **không** tắt validate — `validationSchema`/`validate()` vẫn chạy trên `process.env` |
| `cache: true`         | Cache lại `process.env` sau lần đọc đầu để `ConfigService.get()` nhanh hơn                         | Chỉ nên bật khi đã chắc config không đổi lúc runtime (đúng với hầu hết app) — không liên quan gì tới validate                                  |
| `load: [factory]`     | Nạp thêm 1 hàm factory trả về object config lồng nhau tuỳ ý (ví dụ `database.host`)                | Linh hoạt, nhưng **object trả về từ `load` không tự động bị `validationSchema` (Joi) kiểm** — validate logic phải viết tay trong factory đó    |

**Cách Nest làm:** với dự án hiện tại, `isGlobal: true` là lựa chọn hợp lý (nhiều feature module: `tasks`, `users`, và các module tương lai) — L07 (Prisma) và L13 (JWT) đều sẽ cần đọc config, import lại `ConfigModule` ở mỗi module sẽ là lặp không cần thiết.

**Khi nào KHÔNG nên dùng `isGlobal: true`:** nếu bạn đang cố tình giữ ranh giới hexagonal nghiêm ngặt — module nào cần config phải _khai báo rõ_ dependency của nó qua `imports: [ConfigModule]` — thì `isGlobal: true` làm mờ ranh giới đó (ai cũng có `ConfigService` mà không cần tuyên bố). Đây là điểm bạn có thể tự quyết định khác đi lúc hands-on; lesson note này chỉ nêu đánh đổi, không áp đặt.

> 📖 Nguồn: [docs.nestjs.com/techniques/configuration#custom-env-file-path](https://docs.nestjs.com/techniques/configuration#custom-env-file-path), [#custom-configuration-files](https://docs.nestjs.com/techniques/configuration#custom-configuration-files), [#cache-environment-variables](https://docs.nestjs.com/techniques/configuration#cache-environment-variables)

---

### Khái niệm 4: Schema validation — app từ chối start nếu thiếu env

**Vấn đề nó giải quyết:** Đây là mục tiêu chính của issue NES-7. Không validate ⇒ thiếu biến chỉ lộ ra khi code chạy tới dòng đọc biến đó (có thể là giữa lúc xử lý request thật, y hệt vấn đề ở Khái niệm 1). Muốn app **fail fast lúc bootstrap** — trước khi `app.listen()` — cần validate ngay khi `ConfigModule` nạp xong.

**Cách Nest làm — 2 lựa chọn**, cả hai chạy trong quá trình `ConfigModule.forRoot()` được resolve (nghĩa là **trước** khi `NestFactory.create()` trả về, trước khi `app.listen()` chạy):

**Lựa chọn A — Joi (`validationSchema`):**

```ts
// file: src/app.module.ts (minh hoạ — chưa áp dụng)
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';

ConfigModule.forRoot({
  isGlobal: true,
  validationSchema: Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .default('development'),
    PORT: Joi.number().port().default(3000),
  }),
});
```

**Lựa chọn B — `validate()` tuỳ biến với `class-validator`** (repo đã có `class-validator` + `class-transformer` từ L05 — chọn B nghĩa là **0 dependency mới**, khác với A cần thêm `joi`):

```ts
// file: src/config/env.validation.ts (minh hoạ — chưa tồn tại)
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, Max, Min, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;
}

export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validated;
}
```

**Hành vi từ chối start — chính xác điều gì xảy ra:** cả hai cách đều **throw một exception đồng bộ** trong lúc `ConfigModule` được khởi tạo, tức là bên trong `NestFactory.create(AppModule)` — trước khi `main.ts` chạy được tới `app.listen()`. Vì `bootstrap()` trong `main.ts` hiện tại là `async` và lời gọi cuối là `void bootstrap();` (không `await`, không `.catch()`), exception đó trồi lên thành một **unhandled promise rejection**: Node in ra stack trace (kèm message lỗi Joi/class-validator mô tả đúng biến nào sai) và tiến trình dừng — server **không bao giờ tới được `app.listen()`**, nên không port nào được mở. Đây là quan sát bạn cần tự làm ở bước hands-on (xem mục 🛠 Hands-on) — lesson note này mô tả cơ chế theo docs chính thức, không phải bạn đã chạy thử.

**Điểm dễ hiểu sai:** `validationSchema` (Joi) **chỉ soi các key nằm trong `.env`/`process.env`** đã merge — nó **không** validate object trả về từ `load: [customFactory]` (xem Khái niệm 3). Nếu bạn dùng custom configuration file cho config lồng nhau (`database.host`, v.v.), validate logic cho phần đó phải tự viết ngay trong factory function, docs nói rõ: _"configuration files aren't automatically validated, even if you're using the `validationSchema` option"_.

**Khi nào KHÔNG nên dùng:** đừng validate biến chưa được dùng ở lesson hiện tại (vd `JWT_SECRET`, `DATABASE_URL` — dùng từ L13/L07) — thêm chúng vào schema bây giờ là validate cho tính năng chưa tồn tại, vi phạm nguyên tắc "không over-engineer" của repo (`AGENTS.md`).

> 📖 Nguồn: [docs.nestjs.com/techniques/configuration#schema-validation](https://docs.nestjs.com/techniques/configuration#schema-validation), [#custom-validate-function](https://docs.nestjs.com/techniques/configuration#custom-validate-function)

---

## 🔗 Liên hệ kiến thức cũ

| Kiến thức đã có                                                                                                           | Tương ứng trong NestJS                                                                                                                                                             | Khác nhau ở đâu                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Express + `dotenv`: gọi `dotenv.config()` một lần trong `index.js`, sau đó đọc `process.env.X` rải rác khắp route/service | `ConfigModule.forRoot()` bọc `dotenv` (chính package Express đã dùng) + `ConfigService` là 1 điểm truy cập duy nhất                                                                | Nest thêm bước **validate ngay lúc bootstrap** — Express+dotenv không tự có khái niệm này, phải tự viết tay (thường bị bỏ qua)                                    |
| Prisma: `DATABASE_URL` trong `.env`, `PrismaClient` tự đọc qua `dotenv`/biến môi trường process khi khởi tạo              | Từ L07, `DATABASE_URL` sẽ được đọc qua `ConfigService` rồi truyền vào `PrismaService`, không để Prisma tự đọc `process.env` ngầm                                                   | Cùng nguồn `.env`, nhưng NestJS tập trung việc đọc + validate vào 1 lớp, Prisma chỉ nhận giá trị đã được xác nhận hợp lệ                                          |
| Hexagonal architecture: domain/business logic không phụ thuộc trực tiếp vào hạ tầng (DB, file system, env thật)           | `ConfigService` đóng vai trò **adapter** giữa "thế giới bên ngoài" (`process.env`, file `.env`) và domain code — domain chỉ biết `configService.get('X')`, không biết `.env` ở đâu | `process.env.X` gọi trực tiếp trong service = domain code rò rỉ biết về hạ tầng (đúng thứ hexagonal muốn tránh); `ConfigService` là 1 port/adapter tường minh hơn |

**Điều tôi từng hiểu sai:** Mục này thường ghi hiểu lầm **cá nhân** phát hiện lúc tự code — nhưng hands-on lesson này do Hermes/Codex thực thi thay (xem disclaimer đầu file), nên không có trải nghiệm cá nhân thật để ghi vào đây. Thay vào đó, đây là 2 điểm dễ hiểu lầm mà Claude Code phát hiện khi đọc lại diff PR #82 so với các ví dụ minh hoạ ở trên:

1. Ví dụ 2 minh hoạ `configService.get<number>('PORT', 3000)` — có default value ngay tại lời gọi `get()`. Code thật trong `src/main.ts` **không** truyền default: `app.get(ConfigService).get<number>('PORT')`, kèm throw tường minh nếu `undefined`. Đây là chủ đích, không phải thiếu sót: `validate()` đã chạy trong `ConfigModule.forRoot()` **trước** dòng này, nên tới lúc `main.ts` chạy tới `app.listen()`, `PORT` chắc chắn đã là số hợp lệ — thêm default ở đây sẽ là dead code, hoặc tệ hơn, âm thầm che một vi phạm invariant nếu nó thực sự xảy ra (bug ở chỗ khác khiến `ConfigService` trả `undefined` dù `validate()` đã pass).
2. `env.validation.ts` không dùng `enableImplicitConversion: true` như minh hoạ ở Khái niệm 4 — thay vào đó tự converts `PORT` sang `Number` bằng tay, và **chỉ** khi giá trị là string không rỗng sau `trim()`. Lý do: implicit conversion mặc định của `class-transformer` sẽ biến chuỗi rỗng `PORT=""` thành `0` (một số hợp lệ theo `@Min(0)`), khiến case "quên điền `PORT`" lọt qua validate thay vì bị chặn — một edge case tinh vi hơn ví dụ đơn giản trong phần Lý thuyết.

---

## 💻 Ví dụ có giải thích

### Ví dụ 1: Đăng ký `ConfigModule` với validate — điểm khởi đầu cho `app.module.ts`

```ts
// file: src/app.module.ts (minh hoạ phần THÊM VÀO — không phải diff đã áp dụng)
import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation'; // nếu chọn Lựa chọn B ở Khái niệm 4
// ...import các module hiện có: AppController, AppService, TasksModule, ...

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate, // hoặc validationSchema: Joi.object({...}) nếu chọn Lựa chọn A
    }),
    // UsersModule, TasksModule, TasksConfigModule.forRoot(...) — giữ nguyên như hiện tại
  ],
  // controllers, providers giữ nguyên
})
export class AppModule {}
```

**Giải thích:**

- `ConfigModule.forRoot({...})` phải là import **đầu tiên hợp lý** trong `imports` — các module khác (nếu cần đọc config ngay lúc khởi tạo) phụ thuộc vào nó đã sẵn sàng.
- `isGlobal: true` nghĩa là `TasksModule`, `UsersModule` không cần thêm `imports: [ConfigModule]` để inject `ConfigService`.
- Nếu `validate` throw (thiếu `NODE_ENV`/`PORT` hoặc giá trị sai định dạng), toàn bộ `@Module({...})` này không bao giờ hoàn thành khởi tạo — hệ quả mô tả ở Khái niệm 4.

> 📖 Dựa trên: [docs.nestjs.com/techniques/configuration#getting-started](https://docs.nestjs.com/techniques/configuration#getting-started)

### Ví dụ 2: `main.ts` hiện tại đang đọc `process.env.PORT` trực tiếp — đây là điều cần sửa

Code **thật, đang có trong repo hôm nay** (`src/main.ts`):

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000); // ⚠️ đọc process.env trực tiếp, "?? 3000" nuốt luôn trường hợp thiếu biến
}

void bootstrap();
```

Hướng sửa (minh hoạ, bạn tự viết ở hands-on):

```ts
// file: src/main.ts (minh hoạ — chưa áp dụng)
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  await app.listen(configService.get<number>('PORT', 3000));
}

void bootstrap();
```

**Giải thích:**

- `app.get(ConfigService)` lấy provider đã được `ConfigModule` đăng ký — chỉ dùng được **sau** `NestFactory.create()` đã trả về, tức là sau khi validate ở Khái niệm 4 đã pass.
- Default `3000` giờ nằm ở **1 chỗ tường minh** (tham số thứ 2 của `get()`) thay vì `??` — về hành vi runtime giống nhau khi `PORT` có giá trị hợp lệ, nhưng khi `PORT` là chuỗi rác (`PORT=abc`), `?? 3000` cũ **không phát hiện được** (chuỗi `"abc"` không phải `undefined`/`null` nên `??` không kích hoạt) — trong khi có `validate`/`validationSchema` ở Khái niệm 4, giá trị sai định dạng sẽ bị chặn **trước khi** dòng này chạy tới.

> 📖 Dựa trên: [docs.nestjs.com/techniques/configuration#using-in-the-maints](https://docs.nestjs.com/techniques/configuration#using-in-the-maints)

---

## 🛠 Hands-on

<!-- BẠN tự code phần này. Agent không làm hộ. -->

**Yêu cầu (từ issue NES-7 + NES-72):**

1. **Không tạo `.env.example` mới** — file này đã có sẵn ở root repo từ L00 (`NODE_ENV`, `PORT`, và các biến của lesson sau). Mở nó ra đọc, và chỉ **thêm biến mới** vào đó nếu bạn quyết định cần một biến chưa tồn tại (ví dụ nếu bạn tự chọn thêm `TASKS_PAGE_SIZE`). Nếu không thêm biến nào, bước này coi như đã đủ — không phải tạo file trùng.
2. Cài `@nestjs/config`, và `joi` nếu bạn chọn Lựa chọn A ở Khái niệm 4 (Lựa chọn B không cần cài gì thêm — `class-validator`/`class-transformer` đã có từ L05):
   ```bash
   pnpm add @nestjs/config
   # chỉ chạy dòng dưới nếu chọn Joi:
   pnpm add joi
   ```
3. Tạo file validate (nếu chọn Lựa chọn B) hoặc viết `validationSchema` trực tiếp trong `app.module.ts` (nếu chọn Lựa chọn A) — dựa theo Ví dụ 1.
4. Sửa `src/app.module.ts`: thêm `ConfigModule.forRoot({ isGlobal: true, validate/validationSchema })` vào đầu mảng `imports`.
5. Sửa `src/main.ts`: đổi `process.env.PORT ?? 3000` sang lấy qua `ConfigService` — dựa theo Ví dụ 2.

**Cách kiểm tra:**

```bash
pnpm start:dev
# Quan sát: app start bình thường, log Nest in ra cổng đang lắng nghe khớp PORT trong .env
```

```bash
# Thử app từ chối start khi thiếu/sai env — đây là phần quan trọng nhất của lesson
cp .env .env.bak            # backup trước khi sửa
# sửa .env: comment dòng PORT= (hoặc đổi NODE_ENV=development thành NODE_ENV=khong-hop-le)
pnpm start:dev
# Quan sát: app KHÔNG start — terminal in lỗi mô tả đúng biến nào sai (Joi hoặc class-validator message),
# tiến trình dừng, không có "Application is running on..." nào được in ra vì chưa từng tới app.listen().
mv .env.bak .env             # khôi phục lại .env đúng
pnpm start:dev                # confirm app start lại bình thường
```

```bash
pnpm test      # đảm bảo chưa phá vỡ test hiện có
pnpm test:e2e  # xem lưu ý bên dưới trước khi chạy — main.ts không được e2e chạy tới
```

**Vướng ở đâu, gỡ thế nào:**

- Nếu `pnpm test:e2e` vẫn pass **dù bạn cố tình làm sai `.env`**: bình thường — `test/*.e2e-spec.ts` dựng app qua `Test.createTestingModule().createNestApplication()`, **không chạy `src/main.ts`**, nên phần bạn sửa ở `main.ts` (đọc `PORT` qua `ConfigService`) không được e2e test nào chạy tới. Đây là đúng cái bẫy đã ghi trong lesson note L05 (`docs/lessons/05-dto-pipes-validation/README.md`) — nếu muốn có test tự động cho hành vi "từ chối start khi thiếu env", bạn cần **unit test riêng cho hàm `validate()`** (gọi trực tiếp, không cần dựng cả app) — không phải e2e test.
- Nếu app vẫn start được dù bạn xoá biến: kiểm tra lại `validate`/`validationSchema` có thực sự được truyền vào `ConfigModule.forRoot({...})` chưa — copy-paste thiếu field là lỗi phổ biến nhất.
- Nếu lỗi báo "Cannot find module 'joi'": bạn chọn Lựa chọn A nhưng quên `pnpm add joi` ở bước 2.

### ✅ Bằng chứng thực thi thay — PR #82 (kết quả thật, không phải hướng dẫn)

> Xem disclaimer đầu file: phần dưới đây mô tả code **đã chạy thật** trong PR #82 (`codex/nes-7-l06-config-implementation` → `main`, merge `f496a77`), không phải việc Hien Duong tự làm. Không tìm thấy file sentinel `.hermes/runs/*.json` cho lần thực thi này (khác các lesson trước có dispatch qua pane) — bằng chứng ở đây là PR đã merge + GitHub Actions CI xanh + verify lại tại thời điểm closeout.

**0. Dependency.** `@nestjs/config@^4.0.4` thêm vào `dependencies` của `package.json`, `pnpm-lock.yaml` cập nhật cùng commit. **Lựa chọn B** ở Khái niệm 4 (`class-validator`, không phải Joi) — 0 dependency validate mới, tái dùng `class-validator`/`class-transformer` đã có từ L05.

**1. `src/config/env.validation.ts` (AC validate).** Enum `NodeEnvironment` (`development`/`production`/`test`). Class `EnvironmentVariables`: `NODE_ENV` (`@IsDefined @IsEnum(NodeEnvironment)`), `PORT` (`@IsDefined @IsNumber({allowInfinity:false,allowNaN:false}) @IsInt @Min(0) @Max(65535)`). Hàm `validate()` tự convert `PORT` sang `Number` chỉ khi là string không rỗng sau `trim()` (tránh bug chuỗi rỗng → `0`, xem mục "Điều tôi từng hiểu sai"), rồi `plainToInstance` + `validateSync({ skipMissingProperties: false })`; throw `Error` liệt kê đủ property/message nếu invalid.

**2. `src/app.module.ts`.** `ConfigModule.forRoot({ isGlobal: true, validate })` là import đầu tiên trong mảng `imports`, kèm comment giải thích lý do chọn `class-validator` thay vì thêm Joi.

**3. `src/main.ts`.** `bootstrap()` đổi thành `export async function` (để test được), đọc `const port = app.get(ConfigService).get<number>('PORT')` — không truyền default (xem "Điều tôi từng hiểu sai" #1) — throw `Error` tường minh nếu `undefined`, rồi `app.listen(port)`.

**4. Test.** `src/config/env.validation.spec.ts`: 1 case config hợp lệ trả instance đúng type + `it.each` 5 case invalid (thiếu `NODE_ENV`, thiếu `PORT`, `NODE_ENV` sai giá trị, `PORT` không phải số, `PORT` chuỗi rỗng) đều throw đúng tên property, cộng 1 case `PORT` vượt range TCP (65536). `src/main.spec.ts`: mock `NestFactory.create`, xác nhận `bootstrap()` gọi đúng thứ tự `app.get(ConfigService)` → `configService.get('PORT')` → `app.listen(port)` với giá trị đã resolve.

**5. E2E setup.** `test/tasks.e2e-spec.ts` v.v. dựng app qua `Test.createTestingModule({ imports: [AppModule] }).createNestApplication()` — **không chạy `main.ts`**, nhưng vẫn import `AppModule` nên `ConfigModule.forRoot({ validate })` vẫn chạy validate lúc `createTestingModule()`. `test/setup-env.ts` (mới, chạy qua `setupFiles` trong `test/jest-e2e.json`) cấp `process.env.NODE_ENV ??= 'test'` và `process.env.PORT ??= '3000'` — giá trị không bí mật — để việc import đó không throw trong môi trường e2e.

**Contract giữ nguyên.** `main.ts` vẫn gọi `app.listen(port)` đúng 1 lần với port dạng số; hành vi khi `PORT` hợp lệ không đổi — chỉ đổi khi `PORT` thiếu/sai (từ chối start thay vì fallback im lặng), đúng mục tiêu của lesson, không phải phá contract.

**Kết quả verify (chạy lại tại thời điểm closeout, 2026-08-26, khớp CI của PR #82):** `pnpm test` — 9 suites / 28 tests pass. `pnpm test:e2e` — 3 suites / 13 tests pass (không có case e2e mới, đúng lưu ý ở trên: `main.ts` không chạy qua e2e). `pnpm verify` (lint `--max-warnings=0` + prettier check + jest + build) — PASS. GitHub Actions CI trên PR #82 (`Lint · Test · Build`) — SUCCESS, merge commit `f496a77543c4f2d073284ee7400127b86f8aa139`.

---

## ✅ Ôn tập & Quiz

> Trả lời dưới đây là **bằng chứng thực thi thay** của Claude Code (xem disclaimer đầu file), dựa trực tiếp trên code thật trong PR #82 và docs gốc — không phải câu trả lời tự nghĩ của Hien Duong.

1. **Hỏi:** Nếu `ConfigModule` không đặt `isGlobal: true`, điều gì xảy ra khi một feature module (ví dụ `TasksModule`) cố inject `ConfigService` mà không tự `imports: [ConfigModule]`? Việc bắt buộc mỗi module tự khai báo `imports: [ConfigModule]` có lợi gì cho ranh giới hexagonal (ports & adapters) mà `isGlobal: true` làm mất đi?
   **Trả lời:** `ConfigModule` không đặt `isGlobal: true` thì chỉ tồn tại trong phạm vi module đã import nó (ở đây là `AppModule`) — DI của Nest xét theo phạm vi module. `TasksModule` cố inject `ConfigService` mà không `imports: [ConfigModule]` sẽ khiến Nest ném lỗi ngay lúc bootstrap (`NestFactory.create`), dạng `UnknownDependenciesException`: _"Nest can't resolve dependencies of the TasksService (?). Please make sure that the argument ConfigService at index [0] is available in the TasksModule context"_ — một kiểu lỗi "từ chối start" khác, do module graph không giải được, chứ không phải do `validate()` trong Khái niệm 4. Lợi ích của việc bắt mỗi module tự khai báo `imports: [ConfigModule]`: `imports` của một module trở thành danh sách tường minh mọi port/adapter hạ tầng mà nó phụ thuộc — đọc riêng file module là biết đủ, không cần biết wiring toàn app. `isGlobal: true` đánh đổi sự tường minh đó lấy tiện lợi (không phải lặp lại import ở mọi feature module) — đúng như tradeoff đã nêu ở Khái niệm 3.

2. **Hỏi:** `validationSchema` (Joi) và `validate()` (custom, dùng `class-validator`) khác nhau ở phạm vi áp dụng như thế nào — cụ thể là với object trả về từ `load: [customFactory]`? Vì sao sự khác biệt này sẽ quan trọng khi bạn viết `database.config.ts` bằng `registerAs()` ở Lesson 07?
   **Trả lời:** Cả hai cơ chế chỉ chạy trên object phẳng `process.env`/`.env` mà `ConfigModule` gộp được **trước khi** các `load` factory chạy — không cơ chế nào tự động validate **giá trị trả về** của `load: [factory]`/`registerAs()`, vì factory đó tự tạo ra object lồng nhau tuỳ ý (không còn là raw string từ env nữa). Ở L07, nếu `database.config.ts` viết bằng `registerAs('database', () => ({ url: process.env.DATABASE_URL, ... }))`, một `DATABASE_URL` thiếu/sai sẽ **không** bị bắt bởi `validate()` hiện có trong `env.validation.ts` — hoặc phải thêm `DATABASE_URL` vào chính class `EnvironmentVariables` để nó được validate ở bước raw-env, hoặc factory phải tự throw nếu giá trị không hợp lệ; nếu bỏ qua cả hai, lỗi chỉ lộ ra muộn hơn — lúc `PrismaClient` thực sự cố connect — phá đúng mục tiêu "fail fast lúc bootstrap" mà lesson này đang xây.

3. **Hỏi:** `ignoreEnvFile: true` và có `validationSchema`/`validate` cùng lúc có mâu thuẫn không? Giải thích chính xác nguồn dữ liệu nào bị validate trong trường hợp đó.
   **Trả lời:** Không mâu thuẫn — hai option trả lời hai câu hỏi khác nhau. `ignoreEnvFile: true` chỉ quyết định **nguồn** giá trị: có đọc file `.env` hay không (đúng cho production thật, nơi platform inject thẳng vào `process.env`, không kèm file `.env`). `validate`/`validationSchema` luôn chạy trên **kết quả cuối cùng** đang có trong `process.env` tại thời điểm `ConfigModule.forRoot()` resolve — bất kể giá trị đó tới từ đâu. Khi `ignoreEnvFile: true`, tập giá trị bị validate chỉ còn là biến do platform set thẳng vào `process.env` (không có phần merge từ `.env`); khi không bật, tập đó là `process.env` đã merge với `.env` (biến shell thật đè lên `.env`). Tức là `ignoreEnvFile` quyết định **input**, còn `validate`/`validationSchema` quyết định **input đó có được chấp nhận hay không** — hai lớp độc lập, kết hợp được, không loại trừ nhau.

4. **Hỏi:** Vì sao `await app.listen(process.env.PORT ?? 3000)` (code hiện tại trong `main.ts`) được xem là một "silent fallback" nguy hiểm hơn cả việc không có fallback? Sau khi bạn sửa bằng `ConfigService` + schema validate, hành vi mong đợi khi `PORT` bị đặt thành một chuỗi không phải số (ví dụ `PORT=abc`) là gì — khác gì so với trước khi sửa?
   **Trả lời:** `??` chỉ kích hoạt khi giá trị là `null`/`undefined`. Một giá trị **có tồn tại nhưng sai định dạng** như `PORT=abc` không phải `undefined`, nên `??` không bắt được — chuỗi `"abc"` bị truyền thẳng vào `app.listen()`, khiến app bind cổng sai/không như ý mà **không hề có lỗi rõ ràng chỉ đúng vào `PORT`** — nguy hiểm hơn "không có fallback" vì nó che giấu lỗi cấu hình thật thay vì báo ngay. Sau khi sửa (PR #82): `PORT=abc` bị `validate()` trong `env.validation.ts` bắt được ngay trong `ConfigModule.forRoot()` — `@IsInt()`/`@IsNumber()` fail, `validate()` throw `Error` mô tả đúng field `PORT`, exception này trồi lên trước khi `NestFactory.create()` trả về, nên tiến trình dừng **trước khi chạm tới dòng `app.listen()`** — khác hẳn trước khi sửa, nơi request vẫn "chạy" (bind cổng sai trong im lặng) thay vì dừng hẳn với lỗi rõ ràng.

5. **Hỏi:** `test/*.e2e-spec.ts` dựng app qua `Test.createTestingModule().createNestApplication()`, không chạy qua `main.ts`. Điều này nghĩa là gì cho việc viết test tự động kiểm tra "app từ chối start khi thiếu env bắt buộc"? Bạn sẽ đặt test đó ở đâu, kiểm tra cái gì trực tiếp?
   **Trả lời:** Vì `bootstrap()` trong `main.ts` (dòng `app.get(ConfigService).get('PORT')` + throw nếu `undefined`) không bao giờ được e2e chạy tới, e2e **không thể** chứng minh "tiến trình từ chối start" theo đúng nghĩa end-to-end. Bằng chứng thật phải nằm ở tầng unit, đúng hai chỗ thực sự enforce fail-fast: `src/config/env.validation.spec.ts` gọi trực tiếp `validate(config)` với các tổ hợp `NODE_ENV`/`PORT` thiếu/sai và assert nó throw (đây là nơi chứng minh thật "app từ chối start khi env sai", không cần dựng app nào cả); `src/main.spec.ts` mock `NestFactory.create` để assert `bootstrap()` gọi đúng `app.get(ConfigService)` → `.get('PORT')` → `app.listen()` theo đúng thứ tự. Hai test này (đã có sẵn trong PR #82) cùng nhau cover đúng hai điểm mà e2e về cấu trúc không chạm tới được.

**Ôn lại lesson trước:** L05 dùng DTO + `ValidationPipe` để validate dữ liệu ở **biên HTTP request** (client gửi gì vào, chặn ngay nếu sai). L06 áp dụng đúng triết lý "fail fast ở biên" đó cho một biên khác: **biên process** (biến môi trường app nhận lúc khởi động) — cùng một nguyên tắc, hai vị trí khác nhau trong request/process lifecycle.

---

## 🧠 Điểm cần nhớ

1. `ConfigService` tập trung việc đọc biến môi trường + validate ngay lúc bootstrap, thay cho `process.env.X` rải rác không ai đảm bảo tồn tại.
2. `isGlobal: true` tránh phải `imports: [ConfigModule]` lặp lại ở mọi feature module — đổi lại là ranh giới dependency giữa các module bị mờ đi.
3. `validationSchema` (Joi) chỉ soi các key trong `.env`/`process.env`; object từ `load: [customFactory]`/`registerAs()` **không** tự được validate — phải tự viết logic đó trong factory.
4. Có 2 cách fail-fast tương đương: Joi (`validationSchema`, thêm 1 dependency mới) hoặc `validate()` với `class-validator` (0 dependency mới, đã có từ L05) — đây là lựa chọn của bạn, không có đáp án đúng duy nhất. **PR #82 chọn Lựa chọn B** (`class-validator`) — 0 dependency validate mới.
5. `src/main.ts` (trước PR #82) đọc `process.env.PORT ?? 3000` trực tiếp — đây chính là dòng lesson này yêu cầu sửa; test e2e hiện tại không phát hiện được lỗi ở dòng đó (vì e2e không chạy qua `main.ts`) — coverage thật nằm ở `env.validation.spec.ts` + `main.spec.ts` (unit), không phải e2e.

---

## 📎 Nguồn

- [docs.nestjs.com/techniques/configuration](https://docs.nestjs.com/techniques/configuration)
- [github.com/motdotla/dotenv](https://github.com/motdotla/dotenv) — package `@nestjs/config` bọc bên trong
- [github.com/sideway/joi](https://github.com/sideway/joi) — nếu chọn Lựa chọn A ở Khái niệm 4
- `docs/lessons/05-dto-pipes-validation/README.md` — bẫy `createTestingModule` không chạy `main.ts`, cùng áp dụng cho lesson này
