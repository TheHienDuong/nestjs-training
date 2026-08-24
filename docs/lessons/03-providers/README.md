<!--
TEMPLATE LESSON NOTE — copy toàn bộ file này khi mở lesson mới.
Skill /lesson-start sẽ tự làm việc copy + điền phần đầu.
Đừng xoá mục nào: mỗi mục có một lý do sư phạm riêng, ghi trong comment.
-->

# L03 — Providers & Dependency Injection

|                |                                                             |
| -------------- | ----------------------------------------------------------- |
| **Phase**      | 1 — Nền tảng NestJS                                         |
| **Linear**     | NES-4                                                       |
| **Branch**     | `duongthehien2001/nes-4-l03-providers-dependency-injection` |
| **Docs chính** | https://docs.nestjs.com/providers                           |
| **Ngày học**   | 2026-08-21                                                  |

> ⚠️ **Disclaimer — Hermes/Claude execution substitute (2026-08-24):** Phần **🛠 Hands-on** và **✅ Ôn tập & Quiz** dưới đây được **Hermes/Claude Code thực thi thay** trong một ngoại lệ **user duyệt một lần** (approved one-time exception, 2026-08-24) để dọn các gap còn sót của L01–L03. Đây là **bằng chứng thực thi thay (execution substitute)** — chạy thật test/API, đọc thật output, trả lời quiz bằng lý luận của agent — **KHÔNG phải xác nhận rằng Hien Duong đã tự tay làm phần hands-on/quiz này**. Không có thay đổi hành vi ứng dụng ngoài phạm vi đã có sẵn trong `src/` — mọi kiểm chứng chỉ **đọc** và **gọi thử** custom provider/injection scope đã tồn tại từ lesson 04 (NES-5), không sửa code.

---

## 🗂 File map lesson này

> Bản đồ chính xác nhất + đọc từng file code (kèm số dòng): chạy `pnpm lesson <NN>`.
> Bảng này là bản tóm tắt để đọc nhanh; cập nhật khi lesson xong.

| File                            | Vai trò (lý thuyết / ref / hands-on)                                        | Tạo ở lesson | Trạng thái                               |
| ------------------------------- | --------------------------------------------------------------------------- | ------------ | ---------------------------------------- |
| `src/tasks/tasks.service.ts`    | Ref — `@Injectable()` provider, singleton mặc định, business logic của Task | L02 (NES-3)  | Có sẵn, dùng làm ví dụ cho lý thuyết L03 |
| `src/tasks/tasks.controller.ts` | Ref — constructor injection `TasksService`, controller thin                 | L02 (NES-3)  | Có sẵn, dùng làm ví dụ cho lý thuyết L03 |
| `src/tasks/tasks.module.ts`     | Ref — đăng ký provider trong `providers: []`                                | L02 (NES-3)  | Có sẵn, dùng làm ví dụ cho lý thuyết L03 |

> Lưu ý: hands-on của L02 đã viết sẵn `TasksService`/`TasksController` theo đúng pattern DI, nhưng chưa giải thích **vì sao** nó hoạt động. L03 lấp phần lý thuyết đó — phần Hands-on của lesson này (điền ở bước `/lesson-review`) sẽ mở rộng bằng custom provider / injection scope thật trong `src/`.

---

## 🎯 Mục tiêu

<!-- 3-5 gạch đầu dòng ĐO ĐƯỢC. "Hiểu về controller" là không đo được.
     "Tự viết được controller có 5 route CRUD, giải thích được @Param vs @Query" là đo được. -->

- [x] Giải thích được IoC container và dependency injection qua constructor hoạt động thế nào trong Nest
- [x] Tự viết được một provider `@Injectable()` (`TasksService`) với scope singleton (mặc định)
- [x] Inject được `TasksService` vào `TasksController` qua constructor, không tự new instance
- [x] Chuyển toàn bộ business logic của task từ controller sang `TasksService`, giữ controller chỉ lo HTTP (thin controller)

> Đã tick dựa trên bằng chứng thực thi ở mục Hands-on (test + API thật) — xem disclaimer đầu file.

## 📚 Lý thuyết

<!-- Giải thích bằng tiếng Việt, theo thứ tự: VẤN ĐỀ trước, GIẢI PHÁP sau.
     Mỗi khái niệm phải có link tới đúng mục docs gốc để tra lại được.
     Tránh dịch máy docs — viết như đang giảng cho người ngồi cạnh. -->

### Khái niệm 1: IoC container & Dependency Injection qua constructor

**Vấn đề nó giải quyết:** Nếu `TasksController` tự làm `new TasksService()` bên trong constructor, controller phải biết `TasksService` được tạo ra thế nào (có cần config gì không, có phụ thuộc gì khác không). Khi `TasksService` sau này cần thêm dependency (ví dụ một logger), mọi nơi tự `new TasksService(...)` đều phải sửa. Đó là **tight coupling giữa nơi dùng và nơi tạo**.

**Cách Nest làm:** Nest có một **IoC (Inversion of Control) container** — một registry chạy khi bootstrap app, biết cách tạo instance cho từng class được đánh dấu là provider. Class chỉ cần khai báo "tôi cần một `TasksService`" trong constructor, Nest tự tìm, tạo (hoặc lấy instance đã cache) và truyền vào. Đây gọi là **constructor-based injection** — cách dùng được khuyến nghị vì constructor nêu rõ ràng mọi dependency bắt buộc, không giấu ở đâu khác.

Đúng như code đã có ở `src/tasks/tasks.controller.ts:24`:

```ts
constructor(private readonly tasksService: TasksService) {}
```

Nest thấy `TasksController` cần một `TasksService`, tra token `TasksService` trong danh sách provider đã đăng ký, resolve instance, rồi tiêm vào — controller không hề gọi `new`.

**Khi nào KHÔNG nên dùng:** Khi class không cần dependency nào (một pure function/helper thuần) thì không cần `@Injectable()` — bọc DI vào những thứ không có dependency là thừa. Nest cũng hỗ trợ property-based injection (`@Inject()` gắn trên field) cho trường hợp class con kế thừa nhiều tầng và việc truyền qua `super()` cồng kềnh, nhưng docs khuyến cáo **ưu tiên constructor injection** vì nó minh bạch hơn.

> 📖 Nguồn: [docs.nestjs.com/providers](https://docs.nestjs.com/providers), [docs.nestjs.com/fundamentals/custom-providers#di-fundamentals](https://docs.nestjs.com/fundamentals/custom-providers)

---

### Khái niệm 2: `@Injectable()` và scope singleton (mặc định)

**Vấn đề nó giải quyết:** Nếu mỗi lần có request Nest lại tạo một `TasksService` mới, danh sách `tasks` (lưu trong property của class) sẽ mất sau mỗi request — vì instance cũ bị garbage-collect. Ta cần một instance sống suốt đời app để giữ state (hoặc giữ connection pool, cache...).

**Cách Nest làm:** `@Injectable()` gắn metadata lên class để IoC container biết class này **có thể được quản lý**. Mặc định, mọi provider có scope `DEFAULT` (singleton): Nest tạo **đúng một instance** khi app bootstrap, cache lại, và trả về instance đó cho mọi nơi inject — dù inject 1 lần hay 100 lần ở 100 module khác nhau, vẫn là cùng một object. Đó là lý do mảng `tasks` trong `TasksService` (`src/tasks/tasks.service.ts:14`) giữ được state giữa các request — không cần database.

**Khi nào KHÔNG nên dùng:** Singleton **không an toàn** nếu provider giữ state riêng theo từng request mà lại share instance (ví dụ giữ `currentUser` trong property thay vì đọc từ request) — dữ liệu của request A có thể lẫn sang request B. Trường hợp đó cần scope `REQUEST` (xem Khái niệm 5).

> 📖 Nguồn: [docs.nestjs.com/providers#services](https://docs.nestjs.com/providers), [docs.nestjs.com/fundamentals/injection-scopes](https://docs.nestjs.com/fundamentals/injection-scopes)

---

### Khái niệm 3: Đăng ký provider trong `providers: []` của `@Module`

**Vấn đề nó giải quyết:** IoC container không tự "quét" toàn bộ codebase để tìm class nào có `@Injectable()` — nếu làm vậy sẽ không kiểm soát được provider nào thuộc phạm vi module nào. Cần một nơi khai báo rõ ràng: module này "sở hữu" những provider nào.

**Cách Nest làm:** `@Module({ providers: [...] })` chính là nơi đó. `src/tasks/tasks.module.ts` khai báo `providers: [TasksService]` — cú pháp ngắn này thực chất là viết tắt của dạng đầy đủ:

```ts
providers: [
  {
    provide: TasksService, // token — "chìa khoá" để tra cứu
    useClass: TasksService, // giá trị thật được trả về khi có ai inject token này
  },
],
```

Khi `TasksController` khai `constructor(private readonly tasksService: TasksService)`, Nest lấy **token** là class `TasksService`, tra trong `providers` của module đang chứa controller, thấy khớp, resolve theo `useClass`. Dạng ngắn `providers: [TasksService]` chỉ hợp lệ khi token và class là một — đúng trường hợp phổ biến nhất.

**Khi nào KHÔNG nên dùng dạng ngắn:** Khi cần token khác class thật (ví dụ để mock trong test, hoặc token là string/symbol) — lúc đó phải viết dạng đầy đủ với `useValue`/`useClass`/`useFactory` (Khái niệm 4).

> 📖 Nguồn: [docs.nestjs.com/fundamentals/custom-providers#standard-providers](https://docs.nestjs.com/fundamentals/custom-providers)

---

### Khái niệm 4: Custom providers — `useValue`, `useClass`, `useFactory`, `useExisting`

**Vấn đề nó giải quyết:** Không phải provider nào cũng là "một class tự tạo instance của chính nó". Có lúc cần: (a) thay `TasksService` thật bằng bản mock khi test, (b) chọn class implementation khác nhau theo `NODE_ENV`, (c) tạo giá trị cần tính toán lúc bootstrap (đọc config, mở connection), hoặc (d) đặt thêm một "tên gọi khác" cho provider đã có.

**Cách Nest làm:** Cú pháp dài `{ provide, ... }` hỗ trợ 4 kiểu:

- **`useValue`** — gắn token với một giá trị có sẵn (constant, object literal, hoặc mock).
- **`useClass`** — chọn **class nào** sẽ được `new` khi có ai inject token (hữu ích khi muốn đổi implementation theo môi trường).
- **`useFactory`** — chạy một hàm để **tính ra** giá trị lúc bootstrap; hàm này có thể nhận thêm dependency khác qua `inject: [...]`.
- **`useExisting`** — tạo alias: hai token khác nhau cùng trỏ về một instance đã đăng ký.

Ví dụ minh họa (chưa đưa vào `src/`, chỉ để hiểu cơ chế) — giả sử `TasksService` cần một bộ sinh ID thay cho biến `nextId` đếm tay:

```ts
// file: src/tasks/tasks.module.ts (minh hoạ, KHÔNG phải code thật trong repo)
export const TASK_ID_GENERATOR = 'TASK_ID_GENERATOR';

@Module({
  controllers: [TasksController],
  providers: [
    TasksService,
    {
      // useFactory: tính giá trị lúc bootstrap — ở đây là một closure giữ counter riêng.
      provide: TASK_ID_GENERATOR,
      useFactory: () => {
        let nextId = 1;
        return () => nextId++;
      },
    },
  ],
})
export class TasksModule {}
```

```ts
// file: src/tasks/tasks.service.ts (minh hoạ phần constructor, KHÔNG phải code thật)
@Injectable()
export class TasksService {
  constructor(
    // Token là string ('TASK_ID_GENERATOR'), không phải class — nên PHẢI dùng @Inject().
    @Inject(TASK_ID_GENERATOR) private readonly generateId: () => number,
  ) {}
}
```

Còn trong unit test (`tasks.controller.spec.ts` đang dùng theo hướng khác, nhưng đây là pattern chuẩn nếu muốn mock service), `useValue` thay hẳn `TasksService` thật:

```ts
// minh hoạ cách mock trong test, không phải code thật của spec hiện tại
const module = await Test.createTestingModule({
  controllers: [TasksController],
  providers: [{ provide: TasksService, useValue: { findAll: () => [] } }],
}).compile();
```

**Khi nào KHÔNG nên dùng:** Nếu chỉ cần "một class, tự inject chính nó" thì dùng dạng ngắn `providers: [TasksService]` — viết cú pháp dài không cần thiết chỉ làm rối code. Với token không phải class (string/symbol), interface TypeScript **không dùng được làm token** vì bị xoá lúc compile — phải dùng string/`Symbol`, hoặc dùng `abstract class` nếu muốn vừa làm type vừa làm token mà không cần `@Inject()`.

> 📖 Nguồn: [docs.nestjs.com/fundamentals/custom-providers](https://docs.nestjs.com/fundamentals/custom-providers)

---

### Khái niệm 5: Injection scopes — `DEFAULT` (singleton) vs `REQUEST` vs `TRANSIENT`

**Vấn đề nó giải quyết:** Đa số provider nên là singleton (nhanh, rẻ). Nhưng một số bài toán cần state **riêng theo từng request** — ví dụ multi-tenancy (mỗi request thuộc một tenant khác nhau) hoặc request tracking (log kèm request ID).

**Cách Nest làm:** `@Injectable({ scope })` nhận 3 giá trị từ enum `Scope`:

- `Scope.DEFAULT` — singleton, một instance cho toàn app (mặc định, không cần khai báo).
- `Scope.REQUEST` — instance mới cho **mỗi request**, bị garbage-collect sau khi request xong. `REQUEST` scope "bubble up": nếu `TasksService` là request-scoped, `TasksController` (class tiêm nó) cũng tự động thành request-scoped.
- `Scope.TRANSIENT` — mỗi **consumer** tiêm provider này nhận một instance riêng (không share giữa các consumer, nhưng cũng không tied theo request).

Ví dụ minh họa (không phải code thật, chỉ để thấy cơ chế) — một service ghi log kèm theo request:

```ts
// minh hoạ: request-scoped provider đọc request gốc
import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  getRequestId(): string {
    return (this.request.headers['x-request-id'] as string) ?? 'unknown';
  }
}
```

Nếu `TasksService` inject `RequestContextService` này, `TasksService` — và cả `TasksController` phía trên — sẽ tự động trở thành request-scoped, dù không ai khai `scope: Scope.REQUEST` cho chúng.

**Khi nào KHÔNG nên dùng:** `REQUEST` scope làm chậm app (Nest phải tạo lại instance mỗi request) — docs khuyến nghị **chỉ dùng khi thật sự cần**, mặc định luôn là singleton. `TRANSIENT` không hợp với provider cần giữ state chia sẻ (ví dụ connection pool). Và tuyệt đối không đặt WebSocket Gateway ở scope khác singleton — gateway đại diện một socket thật, không thể tạo lại nhiều lần.

> 📖 Nguồn: [docs.nestjs.com/fundamentals/injection-scopes](https://docs.nestjs.com/fundamentals/injection-scopes)

---

### Khái niệm 6: So với cách "tự quản lý dependency" kiểu Express

**Vấn đề nó giải quyết:** Ở Express, không có khái niệm container quản lý dependency — mọi thứ được nối tay.

**Cách Nest làm:** Nest thay thế việc `require()`/tự `new` bằng một dependency graph được build lúc bootstrap: Nest phân tích constructor của mọi provider (transitively — nếu `TasksService` còn phụ thuộc thứ khác, cái đó cũng được resolve), rồi khởi tạo theo đúng thứ tự "từ dưới lên". Việc "wiring" (ai cần ai) tách hẳn khỏi business logic.

**Khi nào KHÔNG nên dùng:** Với script một lần hoặc app quá nhỏ (một file, không có nhiều class phụ thuộc nhau), tự `require()`/tạo instance tay vẫn đơn giản hơn — DI container chỉ trả giá trị khi số lượng dependency và nhu cầu test/mock tăng lên.

> 📖 Nguồn: [docs.nestjs.com/fundamentals/custom-providers#di-fundamentals](https://docs.nestjs.com/fundamentals/custom-providers)

---

## 🔗 Liên hệ kiến thức cũ

<!-- Mục quan trọng nhất của cả note. Học nhanh = neo kiến thức mới vào cái đã biết.
     Luôn đối chiếu với: Express, Prisma, hexagonal architecture. -->

| Kiến thức đã có                                                                                                             | Tương ứng trong NestJS                                                                                    | Khác nhau ở đâu                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Express: `const tasksService = require('./tasksService')` rồi tự truyền vào route handler (hoặc `new TasksService(db)` tay) | Nest: khai `constructor(private readonly tasksService: TasksService)`, IoC container tự resolve           | Express — dev tự chịu trách nhiệm thứ tự tạo instance và truyền tay; Nest — container build dependency graph lúc bootstrap, dev chỉ khai "tôi cần gì"                                                                    |
| Prisma: `export const prisma = new PrismaClient()` ở một file, import chung khắp app để tái dùng đúng 1 connection pool     | Nest: provider mặc định là singleton (`Scope.DEFAULT`) — IoC container tự cache và trả về đúng 1 instance | Prisma — singleton đạt được bằng convention (module-level export, tự nhớ đừng `new` lại); Nest — singleton là hành vi **mặc định của framework**, không cần convention, và có thể đổi sang `REQUEST`/`TRANSIENT` khi cần |
| Express middleware: gắn `req.tenantDb = getDbForTenant(req)` mỗi request để có kết nối riêng theo tenant                    | Nest: provider `Scope.REQUEST` inject `REQUEST` token, đọc header rồi tự tạo instance mới mỗi request     | Express — tự tay gắn property vào `req`, không có type-safety; Nest — DI tạo instance mới đúng lúc, có type, nhưng đổi cả chain provider phía trên thành request-scoped (ảnh hưởng performance)                          |

**Điều tôi từng hiểu sai:** <viết ra ngay khi phát hiện — đây là phần bạn sẽ đọc lại nhiều nhất>

---

## 💻 Ví dụ có giải thích

<!-- Mỗi ví dụ: code CHẠY ĐƯỢC + giải thích từng dòng quan trọng + link nguồn.
     Không copy nguyên docs: sửa lại theo domain Task Management của dự án. -->

### Ví dụ 1: Đăng ký provider + constructor injection (code thật, `pnpm start:dev` chạy được)

```ts
// file: src/tasks/tasks.module.ts
@Module({
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
```

```ts
// file: src/tasks/tasks.service.ts
@Injectable()
export class TasksService {
  private readonly tasks: Task[] = [];
  private nextId = 1;
  // ...
}
```

```ts
// file: src/tasks/tasks.controller.ts
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}
  // ...
}
```

**Giải thích:**

- `providers: [TasksService]` trong `tasks.module.ts`: đăng ký token `TasksService` với IoC container — dạng ngắn của `{ provide: TasksService, useClass: TasksService }`.
- `@Injectable()` trên `TasksService`: đánh dấu class này được container quản lý, mặc định scope `DEFAULT` (singleton).
- `constructor(private readonly tasksService: TasksService)` trong `TasksController`: khai báo dependency bằng type — Nest tự tra token `TasksService`, resolve, và tiêm vào; controller không hề gọi `new TasksService()`.

> 📖 Dựa trên: `src/tasks/tasks.module.ts`, `src/tasks/tasks.service.ts`, `src/tasks/tasks.controller.ts` — pattern theo [docs.nestjs.com/providers#provider-registration](https://docs.nestjs.com/providers)

---

### Ví dụ 2: Business logic nằm trong service, controller chỉ ủy quyền (thin controller)

```ts
// file: src/tasks/tasks.controller.ts
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number): Task {
  return this.tasksService.findOne(id);
}
```

```ts
// file: src/tasks/tasks.service.ts
findOne(id: number): Task {
  const task = this.tasks.find((item) => item.id === id);
  if (!task) {
    throw new NotFoundException(`Task ${id} not found`);
  }
  return task;
}
```

**Giải thích:**

- `findOne` trong controller **không** biết task được tìm kiếm/lưu trữ ra sao — nó chỉ nhận `id` đã được `ParseIntPipe` transform, rồi gọi `this.tasksService.findOne(id)`. Đây chính là ranh giới "controller chỉ lo HTTP" trong mục tiêu của lesson này.
- Toàn bộ quyết định nghiệp vụ — tìm trong mảng, quyết định khi nào là 404 — nằm trong `TasksService`. Nếu ngày sau đổi từ mảng in-memory sang Prisma, chỉ `TasksService` cần sửa, `TasksController` không đổi một dòng nào.
- `NotFoundException` ném từ service vẫn được Nest tự chuyển thành HTTP 404 — controller không cần `try/catch`.

> 📖 Dựa trên: `src/tasks/tasks.controller.ts`, `src/tasks/tasks.service.ts` — nguyên tắc từ [docs.nestjs.com/providers](https://docs.nestjs.com/providers) ("Controllers should handle HTTP requests and delegate more complex tasks to providers")

---

### Ví dụ 3: Singleton giữ state giữa các request — kiểm chứng bằng curl

```ts
// file: src/tasks/tasks.service.ts
export class TasksService {
  private readonly tasks: Task[] = []; // sống suốt đời app, không reset mỗi request
  private nextId = 1;
}
```

**Giải thích:**

- Vì `TasksService` là singleton (`Scope.DEFAULT` mặc định), Nest chỉ tạo **một** instance khi app bootstrap. Property `tasks`/`nextId` sống trong instance đó suốt đời app.
- Gọi `POST /tasks` hai lần liên tiếp (hai request HTTP khác nhau, có thể từ hai terminal khác nhau) — task thứ hai vẫn thấy `nextId` đã tăng từ request trước, và `GET /tasks` ở request thứ ba vẫn thấy đủ 2 task. Nếu `TasksService` bị đặt `Scope.REQUEST`, mỗi request sẽ có `tasks = []` mới, dữ liệu POST trước sẽ "biến mất" ở request sau.

```bash
pnpm start:dev
curl -X POST localhost:3000/tasks -H 'Content-Type: application/json' -d '{"title":"Học DI"}'
curl -X POST localhost:3000/tasks -H 'Content-Type: application/json' -d '{"title":"Viết SPEC"}'
curl localhost:3000/tasks   # phải thấy đủ 2 task ở trên — chứng minh state được giữ giữa các request
```

> 📖 Dựa trên: `src/tasks/tasks.service.ts` — khái niệm scope ở [docs.nestjs.com/fundamentals/injection-scopes](https://docs.nestjs.com/fundamentals/injection-scopes)

---

## 🛠 Hands-on

<!-- Mặc định phần này BẠN tự code — agent không làm hộ. Ngoại lệ ở lesson này: xem ghi chú ngay dưới. -->

> Dưới ngoại lệ user duyệt một lần (2026-08-24), phần hands-on này được **Hermes/Claude Code thực thi thay và ghi lại** — KHÔNG phải bằng chứng người dùng tự làm. Bằng chứng dưới đây chạy thật trên máy (xem disclaimer đầu file) — **chỉ đọc và gọi thử** custom provider/injection scope reference đã có sẵn trong `src/tasks/` (thêm ở lesson 04, NES-5), không sửa code.

**Yêu cầu (đã thực hiện dưới ngoại lệ):**

1. Xác nhận `TasksService` nhận dependency qua constructor injection, không tự `new` — đọc `src/tasks/tasks.controller.ts:16` (`constructor(private readonly tasksService: TasksService)`).
2. Xác nhận custom provider (token string, `useFactory`) hoạt động đúng cơ chế Khái niệm 3–4: `src/tasks/tasks.module.ts` khai `{ provide: 'TASK_ID_START', useFactory: (): number => 1 }`, và `src/tasks/tasks.service.ts` nhận nó qua `@Inject('TASK_ID_START') taskIdStart: number` trong constructor — đúng pattern "token không phải class thì bắt buộc `@Inject()`".
3. Xác nhận singleton scope giữ state giữa nhiều request HTTP thật (không phải chỉ trong test).

**Cách kiểm tra:**

```bash
pnpm test        # tasks.service.spec.ts: "receives the custom provider value through constructor DI"
pnpm test:e2e     # tasks.e2e-spec.ts: CRUD flow đầy đủ qua HTTP thật

pnpm build && node dist/main
curl -X POST localhost:3000/tasks -H 'Content-Type: application/json' -d '{"title":"Hoc DI"}'
curl -X POST localhost:3000/tasks -H 'Content-Type: application/json' -d '{"title":"Viet SPEC"}'
curl -i localhost:3000/tasks
```

**Kết quả thật (2026-08-24):**

- `pnpm test`: 6/6 test suite pass (14 test), bao gồm `TasksService` — test `useValue: 100` cho token `'TASK_ID_START'` xác nhận constructor injection với custom provider **thay được** giá trị thật khi test, đúng nguyên tắc Khái niệm 4 (mock qua `useValue` không cần sửa `TasksService`).
- `pnpm test:e2e`: 3/3 pass, bao gồm flow CRUD `/tasks` đầy đủ (create → list → get-one → patch → delete → 404 sau khi xoá).
- API thật (app chạy từ `dist/`, **không phải test**): `POST /tasks` lần 1 trả `{"id":1,"title":"Hoc DI","completed":false}`; lần 2 trả `{"id":2,...}` — chứng minh `useFactory` thật của `TasksModule` (trả `1`, khác giá trị `100` dùng riêng trong unit test) khởi tạo `nextId` đúng, và **cả hai** task còn nguyên trong `GET /tasks` ở request thứ ba — đúng như lý thuyết ở Ví dụ 3: `TasksService` là singleton (`Scope.DEFAULT`), state (`tasks[]`, `nextId`) sống suốt đời app, không reset giữa các request khác nhau.

**Vướng ở đâu, gỡ thế nào:** Ban đầu dễ nhầm giá trị `id` bắt đầu từ `100` (giá trị dùng trong unit test) là hành vi thật của app — nhưng đó là giá trị **mock** override qua `useValue: 100` chỉ tồn tại trong `tasks.service.spec.ts`. App thật luôn dùng `useFactory` khai trong `tasks.module.ts` (trả `1`). Đây chính là minh chứng sống cho Khái niệm 4: cùng một token, hai giá trị khác nhau tuỳ nơi đăng ký provider (module thật vs testing module).

---

## ✅ Ôn tập & Quiz

<!-- Mặc định mục này điền sau bước /lesson-review, tự trả lời bằng lời của mình — KHÔNG copy đáp án. Ngoại lệ ở lesson này: xem ghi chú ngay dưới. -->

> Dưới ngoại lệ user duyệt một lần (2026-08-24): các câu trả lời dưới đây được **ghi lại dưới ngoại lệ đã được duyệt**, là bằng chứng thực thi thay của Hermes/Claude Code (xem disclaimer đầu file) — **KHÔNG phải bằng chứng cá nhân người dùng tự trả lời**. Đối chiếu trực tiếp với `src/tasks/` thật và kết quả chạy ở mục Hands-on.

1. **Hỏi:** `TasksController` khai `constructor(private readonly tasksService: TasksService)` nhưng không có dòng nào `new TasksService()`. Ai tạo instance đó, và dựa vào đâu để biết phải tạo class nào?
   **Trả lời:** IoC container của Nest tạo instance đó lúc `NestFactory.create(AppModule)` chạy. Nest đọc metadata kiểu tham số constructor qua `reflect-metadata` (type `TasksService`), dùng chính class đó làm **token**, tra trong `providers: [TasksService, ...]` của `TasksModule` — thấy khớp, resolve theo `useClass: TasksService` (dạng đầy đủ của khai báo ngắn), tạo instance, rồi tiêm vào constructor của `TasksController`.

2. **Hỏi:** Vì sao `TasksService` giữ được danh sách task giữa nhiều request HTTP khác nhau, trong khi mỗi request lại là một lần gọi hàm hoàn toàn mới?
   **Trả lời:** Vì `@Injectable()` không khai `scope`, nên mặc định là `Scope.DEFAULT` (singleton) — Nest chỉ tạo **một** instance `TasksService` duy nhất khi app bootstrap và dùng lại cho **mọi** request. Property `tasks: Task[]` và `nextId` nằm trong instance đó, không phải trong scope của một request nào — bằng chứng thật ở Hands-on: `POST /tasks` hai lần liên tiếp (hai HTTP request riêng biệt) vẫn cho ra `id: 1` rồi `id: 2` tăng dần, và `GET /tasks` request thứ ba thấy đủ cả hai.

3. **Hỏi:** `providers: [TasksService]` trong `@Module` là viết tắt của cú pháp đầy đủ nào? Khi nào bắt buộc phải viết dạng đầy đủ đó?
   **Trả lời:** Viết tắt của `{ provide: TasksService, useClass: TasksService }` — chỉ hợp lệ khi token và class trùng nhau. Bắt buộc viết dạng đầy đủ khi: token khác class thật (ví dụ token là string như `'TASK_ID_START'` trong `tasks.module.ts` thật của repo), cần `useValue`/`useFactory` để tính giá trị lúc bootstrap hoặc mock trong test, hoặc cần `useExisting` để alias hai token về cùng một instance.

4. **Hỏi:** Nếu đổi `TasksService` sang `@Injectable({ scope: Scope.REQUEST })`, điều gì xảy ra với `TasksController` — và vì sao?
   **Trả lời:** `TasksController` tự động trở thành request-scoped theo, dù không khai `scope` gì cho nó — cơ chế "bubble up" của Nest: bất kỳ class nào tiêm một provider request-scoped cũng bị kéo theo request-scoped, vì Nest phải tạo lại toàn bộ chain phụ thuộc đó cho mỗi request mới có được instance provider request-scoped tương ứng. Hệ quả: mỗi request tạo mới cả `TasksController` và `TasksService` → mảng `tasks[]` sẽ **mất** sau mỗi request (đúng ngược lại với hành vi hiện tại), và app chậm hơn vì phải khởi tạo lại object mỗi lần.

5. **Hỏi:** Muốn tiêm một provider có token là string (ví dụ `'TASK_ID_GENERATOR'`) vào constructor, phải dùng decorator nào thêm ngoài kiểu tham số? Vì sao class/interface làm token thường không đủ?
   **Trả lời:** Phải dùng `@Inject('TASK_ID_GENERATOR')` — đúng như code thật trong `tasks.service.ts`: `constructor(@Inject('TASK_ID_START') taskIdStart: number)`. Lý do bắt buộc: khi token là class, Nest tự lấy được type từ metadata tham số (`reflect-metadata` đọc được class vì class vẫn tồn tại ở runtime); nhưng `number`/`string` là primitive type, và **interface bị xoá hoàn toàn lúc compile** — không còn gì ở runtime để Nest tự suy ra token. `@Inject()` chỉ định token một cách rõ ràng, không phụ thuộc vào type suy luận từ tham số.

**Ôn lại lesson trước:** L02 đã viết `TasksController` với route CRUD và (không nói rõ lý do) đặt sẵn `@Injectable()` trên `TasksService` — L03 giải thích chính xác cơ chế đứng sau quyết định đó: IoC container, token, scope.

---

## 🧠 Điểm cần nhớ

<!-- Tối đa 5 dòng. Đây là phần bạn sẽ đọc lại khi ôn nhanh trước phỏng vấn. -->

1. Constructor injection = khai "tôi cần gì" bằng type, IoC container tự tạo/resolve — không tự `new`.
2. Provider mặc định là singleton (`Scope.DEFAULT`) — một instance sống suốt đời app, chia sẻ state giữa mọi request.
3. `providers: [TasksService]` là viết tắt của `{ provide: TasksService, useClass: TasksService }` — token và class trùng nhau.
4. Token không phải class (string/symbol) phải dùng `@Inject(token)`; interface không dùng được làm token vì bị xoá lúc compile, muốn vừa làm type vừa làm token thì dùng `abstract class`.
5. `Scope.REQUEST` bubble up injection chain (controller phụ thuộc provider request-scoped cũng thành request-scoped) và làm chậm app — chỉ dùng khi thật sự cần state riêng theo request.

---

## 📎 Nguồn

<!-- Mọi link đã dùng. Nguồn chính thống lên đầu. -->

- [docs.nestjs.com/providers](https://docs.nestjs.com/providers)
- [docs.nestjs.com/fundamentals/custom-providers](https://docs.nestjs.com/fundamentals/custom-providers)
- [docs.nestjs.com/fundamentals/injection-scopes](https://docs.nestjs.com/fundamentals/injection-scopes)
