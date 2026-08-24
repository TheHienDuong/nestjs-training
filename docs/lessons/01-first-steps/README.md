# L01 — Cấu trúc project & bootstrap

|                |                                                                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase**      | 1 — Foundations                                                                                                                                       |
| **Linear**     | NES-2                                                                                                                                                 |
| **Branch**     | `duongthehien2001/nes-2-l01-cau-truc-project-bootstrap`                                                                                               |
| **Docs chính** | [/first-steps](https://docs.nestjs.com/first-steps) · [/fundamentals/platform-agnosticism](https://docs.nestjs.com/fundamentals/platform-agnosticism) |
| **Ngày học**   | 2026-08-12                                                                                                                                            |

> 📝 **Phần Lý thuyết** đã soạn sẵn để bạn đọc trước. Chạy `/teach first-steps` khi cần đào sâu hoặc bổ sung. Tình trạng thực tế của phần Hands-on/Quiz bên dưới: xem disclaimer ngay sau đây — đây là tuyên bố có hiệu lực, không phải dòng "bạn tự làm" cũ.

> ⚠️ **Disclaimer — Hermes/Claude execution substitute (2026-08-24):** Phần **🛠 Hands-on** và **✅ Ôn tập & Quiz** dưới đây được **Hermes/Claude Code thực thi thay** trong một ngoại lệ **user duyệt một lần** (approved one-time exception, 2026-08-24) để dọn các gap còn sót của L01–L03 trước khi sang phase tiếp theo. Đây là **bằng chứng thực thi thay (execution substitute)** — chạy thật lệnh, đọc thật output, trả lời thật quiz bằng lý luận của agent — **KHÔNG phải xác nhận rằng Hien Duong đã tự tay làm phần hands-on/quiz này**. Nội dung dưới đây dùng để đóng gap tài liệu, không thay thế việc bạn tự làm lại các bước này khi ôn tập.

---

## 🗂 File map lesson này

| File                                    | Vai trò                        | Tạo ở lesson | Trạng thái |
| --------------------------------------- | ------------------------------ | ------------ | ---------- |
| `src/users/dto/create-user.dto.ts`      | Ref — DTO                      | L01          | Mới        |
| `src/users/users.controller.spec.ts`    | Ref — unit test                | L01          | Mới        |
| `src/users/users.controller.ts`         | Ref — controller               | L01          | Mới        |
| `src/users/users.module.ts`             | Ref — module                   | L01          | Mới        |
| `src/users/users.service.ts`            | Ref — service                  | L01          | Mới        |
| `test/users.e2e-spec.ts`                | Ref — e2e test                 | L01          | Mới        |
| `src/app.module.ts`                     | Ref — đăng ký UsersModule      | L00          | Sửa        |
| `README.md`                             | Docs — mô tả dự án + hướng dẫn | L00          | Sửa        |
| `docs/ROADMAP.md`                       | Docs — cập nhật tiến độ L01    | L00          | Sửa        |
| `docs/lessons/_agent-log.md`            | Docs — ghi lần dispatch NES-2  | L00          | Sửa        |
| `docs/lessons/01-first-steps/README.md` | Lesson note L01                | L01          | Mới        |

> Bản đồ chính xác nhất + đọc code từng dòng (kèm số dòng): chạy `pnpm lesson 01`.

---

## 🎯 Mục tiêu

- [x] Nói được vai trò của từng file trong 5 file `nest new` sinh ra
- [x] Giải thích được `NestFactory.create()` làm gì, và vì sao nó là `async`
- [x] Hiểu **platform-agnostic** nghĩa là gì và vì sao Nest thiết kế như vậy
- [x] Phân biệt được `nest start`, `nest start --watch`, `nest build` + `node dist/main`
- [x] Đối chiếu được `main.ts` của Nest với `index.js` của một app Express

> Đã tick dựa trên bằng chứng thực thi ở mục Hands-on (chạy thật lệnh, đọc thật output) — xem disclaimer đầu file.

---

## 📚 Lý thuyết

### 1. Năm file mà `nest new` sinh ra

```
src/
├── main.ts                 # entry point — bootstrap ứng dụng
├── app.module.ts           # root module — nơi khai báo và gắn kết mọi thứ
├── app.controller.ts       # controller — nhận request HTTP
├── app.service.ts          # service — chứa business logic
└── app.controller.spec.ts  # unit test cho controller
```

Tài liệu chính thống mô tả đúng như sau:

| File                     | Vai trò                                                  |
| ------------------------ | -------------------------------------------------------- |
| `app.controller.ts`      | Một controller cơ bản với một route                      |
| `app.controller.spec.ts` | Unit test cho controller                                 |
| `app.module.ts`          | Root module của ứng dụng                                 |
| `app.service.ts`         | Một service cơ bản với một method                        |
| `main.ts`                | Entry file — dùng `NestFactory` để tạo instance ứng dụng |

Điều đáng chú ý ngay: **framework áp đặt sự phân lớp lên bạn từ file đầu tiên.** Express không làm thế — với Express bạn có một file `index.js` trống và tự quyết định mọi thứ. Tự do đó nghe hay, nhưng cái giá là mỗi project Express tổ chức một kiểu, và người mới vào phải học lại cấu trúc từ đầu.

> 📖 Nguồn: [/first-steps](https://docs.nestjs.com/first-steps)

### 2. `main.ts` — điểm khởi động

```ts
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
```

Từng dòng:

- **`NestFactory.create(AppModule)`** — nhận vào **root module** và trả về một object thoả interface `INestApplication`. Bên trong, Nest quét toàn bộ cây module bắt đầu từ `AppModule`, đọc metadata trên các decorator, khởi tạo mọi provider và **nối dây phụ thuộc** giữa chúng. Đây chính là **IoC container** đang làm việc.
- **Vì sao `async`?** Vì quá trình khởi tạo có thể chứa việc bất đồng bộ: kết nối database, đọc config từ nguồn ngoài, `useFactory` trả về Promise. Nest phải chờ toàn bộ những việc đó xong trước khi ứng dụng nhận request đầu tiên.
- **`app.listen(port)`** — mở HTTP listener. Đến bước này thì ứng dụng mới bắt đầu nhận request.
- **`void bootstrap()`** — `void` nói với TypeScript rằng ta cố ý không `await` Promise này. Xem giải thích ở [L00](../00-setup/README.md#một-sửa-đổi-nhỏ-trong-src-đáng-để-ý).

**Một tuỳ chọn đáng biết:** mặc định, nếu có lỗi trong lúc khởi tạo ứng dụng, app thoát với exit code `1`. Muốn nó **throw** lỗi ra thay vì thoát (ví dụ để tự xử lý trong test):

```ts
const app = await NestFactory.create(AppModule, { abortOnError: false });
```

> 📖 Nguồn: [/first-steps](https://docs.nestjs.com/first-steps)

### 3. Platform-agnostic — vì sao Nest tách khỏi Express?

Nest **không phải** một framework HTTP. Nó là một lớp kiến trúc **đặt bên trên** một framework HTTP. Có hai platform được hỗ trợ sẵn:

| Platform           | Đặc điểm                                                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `platform-express` | Express — minimalist, đã qua thực chiến nhiều năm, cộng đồng lớn, nhiều thư viện. **Mặc định**, không cần làm gì để bật.                     |
| `platform-fastify` | Fastify — hiệu năng cao, overhead thấp, tập trung vào tốc độ. Xem [/techniques/performance](https://docs.nestjs.com/techniques/performance). |

Vì sao thiết kế như vậy: để **logic ứng dụng của bạn không phụ thuộc vào framework HTTP**. Controller, service, module của bạn không biết gì về Express. Đổi sang Fastify về nguyên tắc chỉ là đổi adapter, không phải viết lại business logic.

Bình thường bạn không cần quan tâm platform. Chỉ khi muốn chạm vào API của platform bên dưới mới cần khai báo generic:

```ts
import { NestExpressApplication } from '@nestjs/platform-express';

const app = await NestFactory.create<NestExpressApplication>(AppModule);
// giờ mới gọi được các method riêng của Express, ví dụ app.set('trust proxy', 1)
```

> 🧠 **Đây chính là hexagonal architecture** ở cấp framework. Express/Fastify là **adapter** cho port "HTTP server"; ứng dụng của bạn là **core** không biết adapter nào đang được dùng. Bạn từng tự tay dựng mô hình này trong dự án Express trước — ở đây Nest dựng sẵn.

> 📖 Nguồn: [/first-steps](https://docs.nestjs.com/first-steps) · [/fundamentals/platform-agnosticism](https://docs.nestjs.com/fundamentals/platform-agnosticism)

### 4. Cách chạy ứng dụng

| Lệnh                             | Làm gì                                                        | Dùng khi                   |
| -------------------------------- | ------------------------------------------------------------- | -------------------------- |
| `pnpm start`                     | Compile rồi chạy một lần                                      | Kiểm tra nhanh             |
| `pnpm start:dev`                 | `nest start --watch` — tự compile lại và restart khi file đổi | **Vòng lặp dev chính**     |
| `pnpm start:debug`               | Như trên, kèm `--debug` để attach debugger                    | Đặt breakpoint             |
| `pnpm build` → `pnpm start:prod` | `nest build` ra `dist/`, rồi `node dist/main`                 | Giống cách chạy production |

Tài liệu có một mẹo đáng biết: dùng **SWC builder** để build nhanh hơn (docs ghi tới ~20 lần):

```bash
pnpm start -- -b swc
```

SWC là compiler viết bằng Rust, nhanh hơn `tsc` rất nhiều nhưng **không type-check** — nó chỉ dịch code. Đánh đổi hợp lý cho vòng lặp dev, vì bạn vẫn có type-check từ IDE và từ `pnpm build` ở CI.

> 📖 Nguồn: [/first-steps](https://docs.nestjs.com/first-steps) · [/recipes/swc](https://docs.nestjs.com/recipes/swc)

### 5. `app.module.ts` — root module

```ts
@Module({
  imports: [], // các module khác mà module này cần
  controllers: [AppController], // controller thuộc module này
  providers: [AppService], // provider (service…) mà DI container quản lý
})
export class AppModule {}
```

`@Module` chỉ là **metadata**. Bản thân class `AppModule` rỗng. Nest đọc metadata này lúc khởi động để biết phải khởi tạo cái gì và tiêm cái gì vào đâu.

Chi tiết đi sâu ở L03 (Providers & DI) và L04 (Modules). Ở lesson này chỉ cần thấy: **đây là nơi khai báo "có những gì trong ứng dụng"**, tách rời khỏi nơi cài đặt chúng.

### 6. Controller và Service — vì sao tách làm hai?

```ts
// app.controller.ts — chỉ lo HTTP
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

```ts
// app.service.ts — chỉ lo business logic
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
```

Với một hàm trả về `'Hello World!'` thì việc tách này trông vô nghĩa. Nhưng đây là **quy ước có chủ đích**, và lý do lộ ra khi hệ thống lớn lên:

- **Controller** trả lời câu hỏi _"request HTTP này map vào đâu, tham số lấy từ đâu, trả status nào?"_
- **Service** trả lời câu hỏi _"nghiệp vụ này thực sự làm gì?"_ — và nó **không biết gì về HTTP**. Nhờ vậy, cùng một service dùng được cho cả HTTP controller, một CLI command, một message queue consumer, hay một cron job.

`constructor(private readonly appService: AppService)` là **constructor injection**. Bạn không `new AppService()` ở đâu cả — Nest thấy kiểu `AppService` trong constructor, tự tìm provider tương ứng và tiêm vào. Đây là điểm khác biệt lớn nhất so với Express, và là nội dung chính của L03.

> 📖 Nguồn: [/controllers](https://docs.nestjs.com/controllers) · [/providers](https://docs.nestjs.com/providers)

### 7. `app.controller.spec.ts` — test có sẵn từ đầu

```ts
const app: TestingModule = await Test.createTestingModule({
  controllers: [AppController],
  providers: [AppService],
}).compile();

appController = app.get<AppController>(AppController);
```

Chú ý: test **cũng dựng một DI container**, chỉ nhỏ hơn — chỉ gồm những gì test cần. Đây là hệ quả trực tiếp của việc dùng DI: vì controller nhận dependency qua constructor, bạn thay được `AppService` thật bằng một mock mà không phải sửa một dòng nào trong controller.

**Đây là câu trả lời thực chất cho câu hỏi "DI để làm gì?"** — không phải để code trông "chuyên nghiệp", mà để **thay được phụ thuộc từ bên ngoài**, và test là trường hợp dùng rõ nhất. Chi tiết ở L16.

> 📖 Nguồn: [/fundamentals/unit-testing](https://docs.nestjs.com/fundamentals/unit-testing)

---

## 🔗 Liên hệ kiến thức cũ

| Express                                          | NestJS                                            | Khác nhau ở đâu                                                                                                                              |
| ------------------------------------------------ | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `const app = express()`                          | `const app = await NestFactory.create(AppModule)` | Nest **async** vì phải khởi tạo cả cây phụ thuộc; Express đồng bộ vì không quản lý gì hộ bạn                                                 |
| `app.listen(3000)`                               | `await app.listen(3000)`                          | Giống nhau về ý nghĩa                                                                                                                        |
| `app.get('/', handler)`                          | `@Get()` trong `@Controller()`                    | Express: route đăng ký bằng **lời gọi hàm** lúc runtime. Nest: route khai báo bằng **metadata** trên class, Nest đọc metadata rồi tự đăng ký |
| Tự tổ chức thư mục                               | `.module.ts` / `.controller.ts` / `.service.ts`   | Nest áp đặt phân lớp → mọi project Nest trông giống nhau, người mới vào đọc được ngay                                                        |
| `const svc = require('./service')`               | `constructor(private readonly svc: Service)`      | Express: bạn tự đi lấy phụ thuộc. Nest: phụ thuộc **được đưa tới** cho bạn (Inversion of Control)                                            |
| Đổi Express → Fastify = viết lại app             | Đổi platform = đổi adapter                        | Nest tách logic khỏi HTTP framework ngay từ thiết kế                                                                                         |
| Test phải `jest.mock('./service')` ở tầng module | `Test.createTestingModule({ providers: [mock] })` | Thay phụ thuộc ở tầng container, không phải hack module loader                                                                               |

**Điều đáng suy nghĩ:** trong dự án Express + hexagonal của bạn, việc "nối dây" phụ thuộc phải làm bằng tay ở entry point — tự tạo instance repository, truyền vào use case, truyền use case vào handler. `NestFactory.create(AppModule)` làm **đúng việc đó**, nhưng đọc metadata từ decorator để biết nối cái gì vào đâu. Bạn đã hiểu _vì sao_ cần nối dây; ở đây chỉ đổi _cách_ nối.

**Điều tôi từng hiểu sai:** _(điền khi phát hiện)_

---

## 🛠 Hands-on

Lesson này **chỉ đọc và thử**, chưa viết feature mới (CRUD ở L04).

> Bằng chứng dưới đây chạy thật trên máy trong ngoại lệ 2026-08-24 (xem disclaimer đầu file). Mọi sửa đổi tạm trong `src/` đã được **revert lại nguyên trạng ngay sau khi kiểm chứng** — `git status` sau cùng sạch, `pnpm build` + `pnpm test` + `pnpm test:e2e` pass.

1. **`pnpm start:dev` + sửa `app.service.ts` + curl:** chạy `pnpm start:dev`, log bootstrap in đủ route map (`AppController {/}` → `Mapped {/, GET} route`, cùng route của `UsersModule`/`TasksModule`). Sửa `getHello()` trả về `'Hello World! (L01 hands-on check)'` — watcher tự recompile trong ~3s (log in lại toàn bộ `InstanceLoader`/`RoutesResolver`), `curl localhost:3000` trả đúng chuỗi mới ngay lập tức. Revert lại `'Hello World!'`, curl lại xác nhận đã về nguyên trạng.
2. **`pnpm build` + `pnpm start:prod`:** `nest build` sinh `dist/` (`main.js`, `app.module.js`, `app.controller.js`, `app.service.js`, kèm `.d.ts`/`.js.map`, và thư mục `tasks/`, `users/`). Mở `dist/app.service.js`: decorator `@Injectable()` biến thành `__decorate([(0, common_1.Injectable)()], AppService)` — bằng chứng decorator chỉ là **cú pháp cho compiler gọi hàm gắn metadata**, JS thuần không có khái niệm decorator runtime. `node dist/main` (tương đương `pnpm start:prod`) chạy, `curl localhost:3000` → `Hello World!`.
3. **`PORT=4000`:** `PORT=4000 node dist/main`, `curl localhost:4000` → `Hello World!`; `curl localhost:3000` lúc này connection refused (không có gì lắng nghe cổng 3000) — xác nhận `process.env.PORT ?? 3000` trong `main.ts` hoạt động đúng.
4. **`pnpm start -- -b swc`:** chạy được, app bootstrap và map route bình thường, **không có lỗi**. Nhưng kiểm tra `node_modules/@swc` → **không tồn tại**, và `@swc/core`/`@swc/cli` **không nằm trong `devDependencies`** của `package.json` (chỉ xuất hiện trong `pnpm-lock.yaml` như optional peer dependency của `@nestjs/cli`, chưa được cài). Kết luận trung thực: cờ `-b swc` được CLI chấp nhận nhưng **không có gói SWC nào được cài trong repo này**, nên không thể đo được "nhanh hơn tsc" — đây là gap thật cần biết, không phải lỗi của bạn. Không tự thêm `@swc/core`/`@swc/cli` vào `package.json` ở đây vì đổi dependency ngoài phạm vi ngoại lệ này; muốn dùng SWC thật, phải chủ động cài rồi test lại.
5. **`NestExpressApplication` generic:** đổi `NestFactory.create(AppModule)` → `NestFactory.create<NestExpressApplication>(AppModule)` (thêm `import { NestExpressApplication } from '@nestjs/platform-express'`). `pnpm build` biên dịch sạch (0 lỗi), `node dist/main` chạy, `curl localhost:3000` → `Hello World!` giống hệt trước. Đã revert lại bản gốc sau khi xác nhận. **Vì sao không đổi hành vi:** generic type chỉ cho **TypeScript compile-time** biết `app` có đầy đủ method của `INestApplication` **và** các method riêng của Express adapter (`app.set(...)`, `app.engine(...)`...) — nó không đổi bất kỳ giá trị hay logic nào ở runtime, vì `platform-express` vẫn luôn là adapter mặc định dù có khai generic hay không. Generic chỉ mở khoá **type-checking**, không mở khoá **hành vi mới**.
6. **Cố tình gây lỗi DI:** xoá `AppService` khỏi `providers: []` của `AppModule` (giữ nguyên constructor injection trong `AppController`), chạy app trực tiếp bằng `ts-node`. Nest in đúng lỗi thật:

   ```
   [Nest] ERROR [ExceptionHandler] UnknownDependenciesException [Error]: Nest can't resolve
   dependencies of the AppController (?). Please make sure that the argument AppService at
   index [0] is available in the AppModule module.

   Potential solutions:
   - Is AppModule a valid NestJS module?
   - If AppService is a provider, is it part of the current AppModule?
   - If AppService is exported from a separate @Module, is that module imported within AppModule?
   ```

   Đọc kỹ: Nest biết **chính xác** class nào thiếu (`AppService`), **ở đâu** (constructor của `AppController`, tham số index 0), và **module nào** đang thiếu nó (`AppModule`) — vì lúc build dependency graph, Nest đọc được type của tham số constructor qua `reflect-metadata`, tra token đó trong `providers` của module chứa controller, không thấy thì throw `UnknownDependenciesException` ngay lúc bootstrap (fail-fast), không đợi tới lúc có request. Đã khôi phục lại `providers: [AppService]` sau khi xác nhận lỗi.

**Vướng ở đâu, gỡ thế nào:** Bước 4 (SWC) ban đầu tưởng là lỗi môi trường — hoá ra chỉ là gói chưa được cài, không phải cấu hình sai. Bài học: `-b swc` không tự báo lỗi rõ ràng khi thiếu gói, phải tự kiểm tra `node_modules`/`package.json` mới biết chắc.

---

## ✅ Ôn tập & Quiz

> Trả lời dưới đây là bằng chứng thực thi thay của Hermes/Claude Code (xem disclaimer đầu file), dựa trực tiếp trên kết quả chạy thật ở mục Hands-on.

1. **Vì sao `NestFactory.create()` là `async` trong khi `express()` thì không?**
   → `express()` chỉ tạo một object rỗng, không làm gì bất đồng bộ. `NestFactory.create()` phải quét toàn bộ cây module từ `AppModule`, đọc metadata decorator, và **khởi tạo mọi provider** — bước này có thể chứa việc bất đồng bộ thật (factory provider trả `Promise`, mở connection DB...). Nest phải `await` xong toàn bộ dependency graph trước khi trả về `app` có thể `listen()`.

2. **Nếu app của bạn không bao giờ dùng API riêng của Express, việc Nest "platform-agnostic" mang lại lợi ích thực tế gì?**
   → Toàn bộ `controllers/services/modules` không có bất kỳ import nào từ `express`, nên đổi sang `platform-fastify` (nếu cần hiệu năng cao hơn) chỉ là đổi một dòng ở `main.ts`, không phải viết lại business logic. Ngay cả khi không đổi platform, lợi ích vẫn có: test dễ hơn (không phải mock `req`/`res` thật của Express), và code không vô tình rò rỉ chi tiết implementation của HTTP framework vào tầng nghiệp vụ.

3. **Ở bước hands-on 6, Nest báo lỗi gì và thông báo đó nói cho bạn biết chính xác điều gì?**
   → `UnknownDependenciesException`: "Nest can't resolve dependencies of the AppController (?). Please make sure that the argument AppService at index [0] is available in the AppModule module." Thông báo cho biết chính xác 3 điều: **class nào** đang thiếu (`AppService`), **ở đâu** (tham số index 0 trong constructor của `AppController`), và **cần sửa ở module nào** (`AppModule`) — vì Nest build dependency graph bằng cách đọc type tham số constructor qua `reflect-metadata`, không tìm thấy provider khớp token thì fail-fast ngay lúc bootstrap.

4. **`app.service.ts` chỉ có một hàm trả về chuỗi. Đưa luôn chuỗi đó vào controller thì hỏng chuyện gì? Trả lời bằng một tình huống cụ thể sẽ xảy ra sau này.**
   → Tình huống cụ thể: khi có thêm một cron job hoặc một CLI command cũng cần lấy "hello message" (không qua HTTP), logic đó phải copy-paste lại vì nó bị khoá trong method của controller (chỉ gọi được qua HTTP request). Nếu logic nằm trong `AppService`, cron job/CLI chỉ cần inject cùng service đó, không viết lại gì. Đây chính là tình huống thật đã xảy ra trong domain Task Management của dự án: `TasksService` (L02/L03) được cả `TasksController` dùng, và về nguyên tắc dùng lại được cho consumer khác không qua HTTP.

5. **Trong `app.controller.spec.ts`, `Test.createTestingModule` giải quyết vấn đề gì mà `jest.mock()` của Express-style code phải xử lý theo cách khác?**
   → `jest.mock('./service')` phải hack ở tầng **module loader** (thay thế toàn bộ module trước khi file import nó chạy) — cách này gắn chặt vào cơ chế `require`/ES module của Node, dễ vỡ khi refactor đường dẫn import. `Test.createTestingModule` thay mock ở tầng **DI container**: chỉ cần khai `providers: [{ provide: AppService, useValue: mockService }]`, Nest tự đưa mock vào đúng chỗ controller cần — không đụng tới cách file import lẫn nhau, nhất quán với đúng cơ chế mà `AppController` đã dùng để nhận dependency lúc runtime thật.

**Ôn lại lesson trước:** L00 nói CI chạy `--max-warnings=0` và vì thế `bootstrap()` phải thành `void bootstrap()`. Giờ đã đọc `main.ts` kỹ hơn — giải thích lại bằng lời của mình vì sao `bootstrap()` trả về một Promise, và vì sao ở đây không `await` nó là hợp lý.

---

## 🧠 Điểm cần nhớ

1. `NestFactory.create(AppModule)` là `async` vì nó phải build + khởi tạo xong toàn bộ dependency graph trước khi app sẵn sàng nhận request.
2. Platform-agnostic = controller/service/module không biết Express hay Fastify đang chạy bên dưới; chỉ `main.ts` mới chạm tới platform cụ thể (`NestExpressApplication`), và việc khai generic đó **không đổi hành vi runtime**, chỉ mở khoá type-checking.
3. Decorator (`@Injectable()`, `@Controller()`...) chỉ tồn tại ở compile-time — JS sinh ra dùng `__decorate(...)` để gọi hàm gắn metadata, không có khái niệm decorator ở runtime thuần.
4. Thiếu provider trong `providers: []` nhưng vẫn inject nó ở constructor → Nest fail-fast lúc bootstrap với `UnknownDependenciesException`, chỉ rõ class/vị trí/module thiếu — không phải lỗi runtime khó dò.
5. `-b swc` không tự báo lỗi khi thiếu `@swc/core`/`@swc/cli` — phải tự kiểm tra `node_modules`/`package.json` mới biết compiler nào thực sự đang chạy.

---

## 📎 Nguồn

- [NestJS — First Steps](https://docs.nestjs.com/first-steps)
- [NestJS — Platform agnosticism](https://docs.nestjs.com/fundamentals/platform-agnosticism)
- [NestJS — Controllers](https://docs.nestjs.com/controllers)
- [NestJS — Providers](https://docs.nestjs.com/providers)
- [NestJS — SWC builder](https://docs.nestjs.com/recipes/swc)
- [NestJS CLI — overview](https://docs.nestjs.com/cli/overview)
- [nestjs/nest — sample/01-cats-app](https://github.com/nestjs/nest/tree/master/sample/01-cats-app)
