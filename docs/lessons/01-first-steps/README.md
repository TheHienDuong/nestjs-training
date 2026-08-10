# L01 — Cấu trúc project & bootstrap

|                |                                                                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase**      | 1 — Foundations                                                                                                                                       |
| **Linear**     | NES-2                                                                                                                                                 |
| **Branch**     | `hien/nes-2-...` _(lấy từ Linear)_                                                                                                                    |
| **Docs chính** | [/first-steps](https://docs.nestjs.com/first-steps) · [/fundamentals/platform-agnosticism](https://docs.nestjs.com/fundamentals/platform-agnosticism) |
| **Ngày học**   | _(điền khi bắt đầu)_                                                                                                                                  |

> 📝 **Đây là bản nháp** — phần Lý thuyết đã soạn sẵn để bạn đọc trước. Chạy `/teach first-steps` khi bắt đầu lesson để đi sâu và bổ sung; phần Hands-on và Quiz bạn tự làm.

---

## 🎯 Mục tiêu

- [ ] Nói được vai trò của từng file trong 5 file `nest new` sinh ra
- [ ] Giải thích được `NestFactory.create()` làm gì, và vì sao nó là `async`
- [ ] Hiểu **platform-agnostic** nghĩa là gì và vì sao Nest thiết kế như vậy
- [ ] Phân biệt được `nest start`, `nest start --watch`, `nest build` + `node dist/main`
- [ ] Đối chiếu được `main.ts` của Nest với `index.js` của một app Express

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

1. Chạy `pnpm start:dev`, sửa chuỗi trả về trong `app.service.ts`, xem terminal tự recompile và `curl` lại thấy giá trị mới.
2. Chạy `pnpm build` rồi `pnpm start:prod`. Mở `dist/` xem JavaScript được sinh ra. So sánh với `src/` — decorator biến thành cái gì?
3. Đổi cổng bằng biến môi trường: `PORT=4000 pnpm start`. Đọc lại `main.ts` để hiểu vì sao nó hoạt động.
4. Thử `pnpm start -- -b swc`, so sánh thời gian build với lần chạy thường.
5. Đổi `NestFactory.create(AppModule)` thành `NestFactory.create<NestExpressApplication>(AppModule)` và thêm import. App vẫn chạy — giải thích được vì sao dòng này **không** đổi hành vi gì?
6. Cố tình gây lỗi: xoá `AppService` khỏi mảng `providers` trong `app.module.ts` nhưng vẫn giữ nó trong constructor của controller. Đọc **kỹ** thông báo lỗi Nest in ra — nó rất dễ hiểu và bạn sẽ gặp lại lỗi này nhiều lần. Ghi lại nội dung lỗi vào đây.

**Vướng ở đâu, gỡ thế nào:** _(điền khi làm)_

---

## ✅ Ôn tập & Quiz

_(Điền sau bước `/lesson-review`)_

1. **Vì sao `NestFactory.create()` là `async` trong khi `express()` thì không?**
   → _(tự trả lời)_

2. **Nếu app của bạn không bao giờ dùng API riêng của Express, việc Nest "platform-agnostic" mang lại lợi ích thực tế gì?**
   → _(tự trả lời)_

3. **Ở bước hands-on 6, Nest báo lỗi gì và thông báo đó nói cho bạn biết chính xác điều gì?**
   → _(tự trả lời)_

4. **`app.service.ts` chỉ có một hàm trả về chuỗi. Đưa luôn chuỗi đó vào controller thì hỏng chuyện gì? Trả lời bằng một tình huống cụ thể sẽ xảy ra sau này.**
   → _(tự trả lời)_

5. **Trong `app.controller.spec.ts`, `Test.createTestingModule` giải quyết vấn đề gì mà `jest.mock()` của Express-style code phải xử lý theo cách khác?**
   → _(tự trả lời)_

**Ôn lại lesson trước:** L00 nói CI chạy `--max-warnings=0` và vì thế `bootstrap()` phải thành `void bootstrap()`. Giờ đã đọc `main.ts` kỹ hơn — giải thích lại bằng lời của mình vì sao `bootstrap()` trả về một Promise, và vì sao ở đây không `await` nó là hợp lý.

---

## 🧠 Điểm cần nhớ

_(Điền tối đa 5 dòng sau khi học xong)_

1.

---

## 📎 Nguồn

- [NestJS — First Steps](https://docs.nestjs.com/first-steps)
- [NestJS — Platform agnosticism](https://docs.nestjs.com/fundamentals/platform-agnosticism)
- [NestJS — Controllers](https://docs.nestjs.com/controllers)
- [NestJS — Providers](https://docs.nestjs.com/providers)
- [NestJS — SWC builder](https://docs.nestjs.com/recipes/swc)
- [NestJS CLI — overview](https://docs.nestjs.com/cli/overview)
- [nestjs/nest — sample/01-cats-app](https://github.com/nestjs/nest/tree/master/sample/01-cats-app)
