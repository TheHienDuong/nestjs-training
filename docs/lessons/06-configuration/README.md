# L06 — Configuration & environment variables

|                |                                                                                  |
| -------------- | -------------------------------------------------------------------------------- |
| **Phase**      | 2 — Working with Data                                                            |
| **Linear**     | NES-7 (sub-issue: NES-69 Theory & note · NES-72 Hands-on · NES-77 Review & quiz) |
| **Branch**     | `duongthehien2001/nes-7-l06-configuration-environment-variables`                 |
| **Docs chính** | [/techniques/configuration](https://docs.nestjs.com/techniques/configuration)    |
| **Ngày học**   | 2026-08-26                                                                       |

---

## 🗂 File map lesson này

> Bản đồ chính xác nhất + đọc từng file code (kèm số dòng): chạy `pnpm lesson 06`.
> Bảng này là bản tóm tắt để đọc nhanh; cập nhật khi lesson xong.

| File                                            | Vai trò (lý thuyết / ref / hands-on)                                         | Tạo ở lesson | Trạng thái                       |
| ----------------------------------------------- | ---------------------------------------------------------------------------- | ------------ | -------------------------------- |
| `docs/lessons/06-configuration/README.md`       | Lý thuyết + hướng dẫn hands-on + quiz                                        | L06          | Lý thuyết xong, chờ hands-on     |
| `docs/lessons/06-configuration/SPEC.md`         | Bản chiếu NES-7 cho coder agent                                              | L06          | Mới                              |
| `.env.example`                                  | **Đã tồn tại từ L00** — inspect/mở rộng khi hands-on, KHÔNG tạo file mới     | L00          | Sẽ sửa ở hands-on nếu thiếu biến |
| `src/config/env.validation.ts` _(chưa tồn tại)_ | Hands-on — schema validate (Joi hoặc class-validator, bạn chọn)              | —            | Chưa tạo                         |
| `src/app.module.ts`                             | Hands-on — đăng ký `ConfigModule.forRoot(...)`, `isGlobal: true`             | L01/L04      | Sẽ sửa ở hands-on                |
| `src/main.ts`                                   | Hands-on — đổi `process.env.PORT` trực tiếp sang `ConfigService.get('PORT')` | L01          | Sẽ sửa ở hands-on                |

---

## 🎯 Mục tiêu

- [ ] Dùng `@nestjs/config` với `ConfigModule.forRoot`
- [ ] Validate schema biến môi trường (Joi hoặc class-validator) — app từ chối start nếu thiếu env
- [ ] Inject `ConfigService` thay vì đọc `process.env` trực tiếp trong business logic

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

**Điều tôi từng hiểu sai:** _(để trống — điền khi bạn tự làm hands-on và phát hiện chỗ hiểu nhầm thật của chính mình, không copy từ note này)_

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

---

## ✅ Ôn tập & Quiz

1. **Hỏi:** Nếu `ConfigModule` không đặt `isGlobal: true`, điều gì xảy ra khi một feature module (ví dụ `TasksModule`) cố inject `ConfigService` mà không tự `imports: [ConfigModule]`? Việc bắt buộc mỗi module tự khai báo `imports: [ConfigModule]` có lợi gì cho ranh giới hexagonal (ports & adapters) mà `isGlobal: true` làm mất đi?
   **Trả lời:** ...

2. **Hỏi:** `validationSchema` (Joi) và `validate()` (custom, dùng `class-validator`) khác nhau ở phạm vi áp dụng như thế nào — cụ thể là với object trả về từ `load: [customFactory]`? Vì sao sự khác biệt này sẽ quan trọng khi bạn viết `database.config.ts` bằng `registerAs()` ở Lesson 07?
   **Trả lời:** ...

3. **Hỏi:** `ignoreEnvFile: true` và có `validationSchema`/`validate` cùng lúc có mâu thuẫn không? Giải thích chính xác nguồn dữ liệu nào bị validate trong trường hợp đó.
   **Trả lời:** ...

4. **Hỏi:** Vì sao `await app.listen(process.env.PORT ?? 3000)` (code hiện tại trong `main.ts`) được xem là một "silent fallback" nguy hiểm hơn cả việc không có fallback? Sau khi bạn sửa bằng `ConfigService` + schema validate, hành vi mong đợi khi `PORT` bị đặt thành một chuỗi không phải số (ví dụ `PORT=abc`) là gì — khác gì so với trước khi sửa?
   **Trả lời:** ...

5. **Hỏi:** `test/*.e2e-spec.ts` dựng app qua `Test.createTestingModule().createNestApplication()`, không chạy qua `main.ts`. Điều này nghĩa là gì cho việc viết test tự động kiểm tra "app từ chối start khi thiếu env bắt buộc"? Bạn sẽ đặt test đó ở đâu, kiểm tra cái gì trực tiếp?
   **Trả lời:** ...

**Ôn lại lesson trước:** L05 dùng DTO + `ValidationPipe` để validate dữ liệu ở **biên HTTP request** (client gửi gì vào, chặn ngay nếu sai). L06 áp dụng đúng triết lý "fail fast ở biên" đó cho một biên khác: **biên process** (biến môi trường app nhận lúc khởi động) — cùng một nguyên tắc, hai vị trí khác nhau trong request/process lifecycle.

---

## 🧠 Điểm cần nhớ

1. `ConfigService` tập trung việc đọc biến môi trường + validate ngay lúc bootstrap, thay cho `process.env.X` rải rác không ai đảm bảo tồn tại.
2. `isGlobal: true` tránh phải `imports: [ConfigModule]` lặp lại ở mọi feature module — đổi lại là ranh giới dependency giữa các module bị mờ đi.
3. `validationSchema` (Joi) chỉ soi các key trong `.env`/`process.env`; object từ `load: [customFactory]`/`registerAs()` **không** tự được validate — phải tự viết logic đó trong factory.
4. Có 2 cách fail-fast tương đương: Joi (`validationSchema`, thêm 1 dependency mới) hoặc `validate()` với `class-validator` (0 dependency mới, đã có từ L05) — đây là lựa chọn của bạn, không có đáp án đúng duy nhất.
5. `src/main.ts` hiện tại đọc `process.env.PORT ?? 3000` trực tiếp — đây chính là dòng lesson này yêu cầu sửa, và test e2e hiện tại sẽ không phát hiện được nếu bạn sửa sai (vì e2e không chạy qua `main.ts`).

---

## 📎 Nguồn

- [docs.nestjs.com/techniques/configuration](https://docs.nestjs.com/techniques/configuration)
- [github.com/motdotla/dotenv](https://github.com/motdotla/dotenv) — package `@nestjs/config` bọc bên trong
- [github.com/sideway/joi](https://github.com/sideway/joi) — nếu chọn Lựa chọn A ở Khái niệm 4
- `docs/lessons/05-dto-pipes-validation/README.md` — bẫy `createTestingModule` không chạy `main.ts`, cùng áp dụng cho lesson này
