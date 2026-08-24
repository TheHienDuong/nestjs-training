<!--
TEMPLATE LESSON NOTE — copy toàn bộ file này khi mở lesson mới.
Skill /lesson-start sẽ tự làm việc copy + điền phần đầu.
Đừng xoá mục nào: mỗi mục có một lý do sư phạm riêng, ghi trong comment.
-->

# L04 — Modules + Hands-on: CRUD Tasks (in-memory)

|                |                                                            |
| -------------- | ---------------------------------------------------------- |
| **Phase**      | 1 — Nền tảng NestJS                                        |
| **Linear**     | NES-5                                                      |
| **Branch**     | `duongthehien2001/nes-5-l04-modules-crud-tasks`            |
| **Docs chính** | [docs.nestjs.com/modules](https://docs.nestjs.com/modules) |
| **Ngày học**   | 2026-08-22                                                 |

---

## 🗂 File map lesson này

> Bản đồ chính xác nhất + đọc từng file code (kèm số dòng): chạy `pnpm lesson <NN>`.
> Bảng này là bản tóm tắt để đọc nhanh; cập nhật khi lesson xong.

| File | Vai trò (lý thuyết / ref / hands-on) | Tạo ở lesson | Trạng thái |
| ---- | ------------------------------------ | ------------ | ---------- |
| ...  | ...                                  | L00          | Mới / Sửa  |

---

## 🎯 Mục tiêu

<!-- 3-5 gạch đầu dòng ĐO ĐƯỢC. "Hiểu về controller" là không đo được.
     "Tự viết được controller có 5 route CRUD, giải thích được @Param vs @Query" là đo được. -->

- [x] Giải thích được vai trò của `imports` / `exports` / `providers` / `controllers` trong `@Module` và khi nào mỗi field cần dùng.
- [x] Tách `TasksModule` ra khỏi `AppModule`, `AppModule` chỉ còn `imports: [TasksModule]`.
- [x] Hoàn thiện đủ 5 route CRUD của Tasks (in-memory) end-to-end, chạy được qua `pnpm start:dev`.
- [x] Test toàn bộ CRUD bằng Tasks Postman collection, cả 5 route trả đúng status/body.
- [x] Đọc và tóm tắt được dynamic modules (link roadmap) — chưa cần implement, chỉ cần giải thích khi nào cần.

## 📚 Lý thuyết

<!-- Giải thích bằng tiếng Việt, theo thứ tự: VẤN ĐỀ trước, GIẢI PHÁP sau.
     Mỗi khái niệm phải có link tới đúng mục docs gốc để tra lại được.
     Tránh dịch máy docs — viết như đang giảng cho người ngồi cạnh. -->

### Khái niệm 1: `@Module()` — vai trò của `imports` / `exports` / `providers` / `controllers`

**Vấn đề nó giải quyết:** Một app backend thật có hàng chục controller và service. Nếu khai báo hết vào một chỗ (kiểu Express: mọi route đăng ký thẳng vào `app`), code phình ra, không còn ranh giới domain, và không có cách nào kiểm soát ai được inject provider nào — mọi thứ nhìn thấy mọi thứ.

**Cách Nest làm:** `@Module()` gói một nhóm class liên quan thành một đơn vị, khai báo qua 4 field:

- `controllers`: controller Nest sẽ khởi tạo, thuộc phạm vi module này.
- `providers`: provider (service, factory, giá trị...) Nest injector khởi tạo, dùng được trong module này.
- `imports`: các module khác mà module này cần, để lấy provider họ export ra.
- `exports`: tập con của `providers` (hoặc chỉ token `provide`) mà module này công khai cho module khác import dùng.

Mặc định, module **encapsulate** provider của nó — chỉ inject được provider thuộc module hiện tại hoặc được export từ module đã import. `exports` chính là public API của module.

**Khi nào KHÔNG nên dùng:** Không có lựa chọn "không dùng module" — mọi app Nest luôn có ít nhất root module. Cái cần tránh là nhồi tất cả `controllers`/`providers` của mọi domain vào một module duy nhất (thường là AppModule) — mất hết lợi ích encapsulation và tổ chức.

> 📖 Nguồn: https://docs.nestjs.com/modules

### Khái niệm 2: Feature module — tách theo domain (`TasksModule` khỏi `AppModule`)

**Vấn đề nó giải quyết:** Nếu `AppModule` khai báo luôn `TasksController` + `TasksService` + `UsersController` + `UsersService`, nó sẽ phình dần mỗi khi thêm domain mới (Project, Comment ở lesson sau), và không ai nhìn `AppModule` mà biết domain nào phụ thuộc domain nào.

**Cách Nest làm:** Nhóm controller + service của cùng một domain vào module riêng (`TasksModule`, `UsersModule`), rồi module gốc chỉ còn `imports: [...]` các feature module đó — không tự khai controller/provider của domain con. Đây đúng là cấu trúc hiện có trong repo (xem Ví dụ 1 và 2 bên dưới).

**Khi nào KHÔNG nên dùng:** Với app cực nhỏ (một resource duy nhất, không có kế hoạch mở rộng), tách module chỉ thêm một file gần như rỗng, không lợi ích rõ. Nhưng Task Management API có 4 domain (User/Project/Task/Comment) nên tách module theo domain là bắt buộc — khớp quy ước repo "một feature = một folder `src/<feature>/`".

> 📖 Nguồn: https://docs.nestjs.com/modules#feature-modules

### Khái niệm 3: Shared module — dùng `exports` để chia sẻ provider giữa module

**Vấn đề nó giải quyết:** Giả sử `CommentsModule` (lesson sau) cần gọi `TasksService.findOne()` để kiểm tra task có tồn tại trước khi tạo comment. Nếu khai báo lại `TasksService` trong `providers` của `CommentsModule`, Nest sẽ tạo ra **một instance khác** — mất tính singleton. Vì `TasksService` hiện đang giữ state nội bộ (`tasks: Task[]` in-memory), hai instance sẽ thấy hai danh sách task khác nhau — bug rất khó tìm.

**Cách Nest làm:** Module đang sở hữu provider (`TasksModule` sở hữu `TasksService`) thêm provider đó vào `exports`. Module khác chỉ cần `imports: [TasksModule]` là nhận đúng cùng một instance singleton, không cần khai lại `providers`.

**Khi nào KHÔNG nên dùng:** Export mọi provider "cho chắc" là sai — nó phá vỡ encapsulation, biến provider nội bộ (chi tiết hiện thực) thành API công khai không kiểm soát được. Chỉ export provider mà module khác **thực sự** cần dùng. `TasksModule` hiện tại chưa export gì vì chưa có module nào khác cần `TasksService` — đó là lựa chọn đúng, không phải thiếu sót.

> 📖 Nguồn: https://docs.nestjs.com/modules#shared-modules

### Khái niệm 4: `@Global()` — khi nào dùng, khi nào không

**Vấn đề nó giải quyết:** Có provider gần như module nào cũng cần (logger, database connection, config). Phải import đi import lại module chứa nó ở mọi feature module là rất tedious.

**Cách Nest làm:** Đánh dấu module đó bằng `@Global()` — mọi provider nó export sẽ có sẵn ở **mọi module khác**, không cần khai `imports`. Module global chỉ nên đăng ký **một lần**, thường ở root/core module.

**Khi nào KHÔNG nên dùng:** Docs chính thức cảnh báo thẳng: "making everything global is not recommended". Global module ẩn đi quan hệ phụ thuộc thật — đọc `AppModule` không còn biết `TasksModule` cần gì hay ai cần `TasksModule`, gây coupling ngầm khó theo dõi khi app lớn lên. `TasksService` trong app này chỉ `TasksModule` (và tương lai có thể `CommentsModule`) cần — dùng `imports`/`exports` bình thường là đủ, **không** cần `@Global()`.

> 📖 Nguồn: https://docs.nestjs.com/modules#global-modules

### Khái niệm 5: Dynamic modules — pattern `forRoot()` / `register()` / `forFeature()` (khái niệm)

**Vấn đề nó giải quyết:** Static module (như `TasksModule` hiện tại) cố định lúc viết code, không nhận tham số để tự cấu hình lúc được import. Nhưng một module tổng quát như "kết nối database" hay "đọc file `.env`" cần khác nhau ở mỗi lần dùng (dev DB khác staging DB, thư mục config khác nhau giữa project) — module đó cần nhận "tham số cấu hình" ngay tại thời điểm import.

**Cách Nest làm:** Module định nghĩa một static method (quy ước tên: `forRoot()`, `register()`, hoặc `forFeature()`) trả về một `DynamicModule` — object có cùng hình dạng với metadata của `@Module()` (`providers`, `exports`, `imports`, `controllers`), cộng thêm field bắt buộc `module`. Module khác import bằng cách **gọi** method đó thay vì chỉ nêu tên class:

```ts
// tĩnh — không cấu hình được
imports: [TasksModule];

// động — truyền tham số lúc import
imports: [TasksModule.forRoot({ seedTasks: initialTasks })];
```

Quy ước cộng đồng (không phải rule cứng của framework):

- `register()`: mỗi module gọi có thể truyền config khác nhau, dùng riêng cho module gọi đó.
- `forRoot()`: cấu hình một lần, dùng lại cho toàn app (ví dụ `TypeOrmModule.forRoot()`).
- `forFeature()`: dùng lại config của `forRoot()` nhưng tinh chỉnh riêng theo module gọi.

**Khi nào KHÔNG nên dùng:** Nếu module không cần cấu hình khác nhau giữa các lần import — như `TasksModule` hiện tại, chỉ có đúng một cấu hình, luôn giống nhau — dynamic module là dư thừa và khó đọc hơn static module đang có. Chỉ chuyển sang dynamic module khi thực sự có tham số cần truyền vào lúc import.

> 📖 Nguồn: https://docs.nestjs.com/modules#dynamic-modules và bản đầy đủ https://docs.nestjs.com/fundamentals/dynamic-modules (đọc thêm khi cần `forRootAsync`/`ConfigurableModuleBuilder` — chưa cần cho lesson này)

---

## 🔗 Liên hệ kiến thức cũ

<!-- Mục quan trọng nhất của cả note. Học nhanh = neo kiến thức mới vào cái đã biết.
     Luôn đối chiếu với: Express, Prisma, hexagonal architecture. -->

| Kiến thức đã có                                                                                                   | Tương ứng trong NestJS                                                                               | Khác nhau ở đâu                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Express: `app.use('/tasks', tasksRouter)` — một router file, đăng ký thẳng vào `app`, không có khái niệm "module" | `TasksModule` với `@Module({ controllers, providers, imports, exports })`                            | Nest module không chỉ nhóm route — nó còn là một scope cho DI container. Express router không có khái niệm "provider chỉ nhìn thấy trong phạm vi module này".  |
| Express: `require('./services/taskService')` — import trực tiếp, ai cũng gọi được, không có lớp kiểm soát nào     | `exports` trong `@Module()` — chỉ đúng provider được liệt kê mới "lộ" ra ngoài                       | Nest ép khai báo rõ "public API" của module qua `exports`; `require()` của Node/Express không có biên giới encapsulation tương đương.                          |
| Hexagonal: port/adapter tách domain khỏi hạ tầng, wiring thường tự viết tay (factory, container thủ công)         | `@Module()` chính là khai báo wiring — import module = "cắm" một domain/adapter vào dependency graph | Nest tự động resolve graph phụ thuộc từ metadata `@Module()` lúc bootstrap; hexagonal thuần túy không quy định cách wiring, bạn phải tự viết composition root. |

**Điều tôi từng hiểu sai:** <viết ra ngay khi phát hiện — đây là phần bạn sẽ đọc lại nhiều nhất>

---

## 💻 Ví dụ có giải thích

<!-- Mỗi ví dụ: code CHẠY ĐƯỢC + giải thích từng dòng quan trọng + link nguồn.
     Không copy nguyên docs: sửa lại theo domain Task Management của dự án. -->

### Ví dụ 1: `TasksModule` — `controllers` + `providers` của một feature module

```ts
// file: src/tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  controllers: [TasksController],
  providers: [
    TasksService,
    {
      provide: 'TASK_ID_START',
      useFactory: (): number => 1,
    },
  ],
})
export class TasksModule {}
```

**Giải thích:**

- `controllers: [TasksController]`: Nest sẽ khởi tạo `TasksController` và đăng ký route `/tasks` của nó — controller này chỉ "sống" trong phạm vi `TasksModule`.
- `providers: [TasksService, { provide: 'TASK_ID_START', ... }]`: cả class provider (`TasksService`) và custom provider theo token (`'TASK_ID_START'`, đã học ở L03) đều khai báo ở field `providers` — Nest injector khởi tạo chúng khi module này được load.
- Không có `imports` và không có `exports`: module này chưa cần dùng provider của module khác, và chưa module nào khác cần dùng `TasksService` của nó — đúng với domain Tasks hiện tại, độc lập hoàn toàn.

> 📖 Dựa trên: https://docs.nestjs.com/modules#feature-modules — file thật trong repo, không phải ví dụ `cats` của docs.

### Ví dụ 2: `AppModule` — chỉ `imports`, không tự khai controller/provider của domain con

```ts
// file: src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule, TasksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**Giải thích:**

- `imports: [UsersModule, TasksModule]`: `AppModule` không biết và không cần biết `TasksController`/`TasksService` là gì — nó chỉ import `TasksModule`, để `TasksModule` tự lo phần khai báo của mình. Đây chính là mục tiêu "tách `TasksModule` khỏi `AppModule`".
- `controllers: [AppController]` / `providers: [AppService]`: `AppModule` vẫn giữ vai trò root module với route riêng của nó (`/`, health check...) — root module không bị cấm có controller/provider, nó chỉ không nên ôm luôn controller/provider của các domain con.
- Thứ tự trong `imports` không quan trọng với Nest (nó tự resolve dependency graph), nhưng nên nhóm theo domain để dễ đọc.

> 📖 Dựa trên: https://docs.nestjs.com/modules#feature-modules — phần "import this module into the root module".

### Ví dụ 3: `exports` — chia sẻ `TasksService` cho một module tương lai (minh hoạ, chưa có trong repo)

```ts
// file: src/tasks/tasks.module.ts (minh hoạ nếu CommentsModule ở lesson sau cần TasksService)
@Module({
  controllers: [TasksController],
  providers: [TasksService /* 'TASK_ID_START' provider ... */],
  exports: [TasksService], // <-- thêm dòng này KHI có module khác thực sự cần
})
export class TasksModule {}

// file: src/comments/comments.module.ts (chưa tồn tại — chỉ để minh hoạ)
@Module({
  imports: [TasksModule], // nhận được instance TasksService y hệt của TasksModule
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
```

**Giải thích:**

- Nếu không thêm `exports: [TasksService]`, `CommentsModule` dù có `imports: [TasksModule]` cũng **không** inject được `TasksService` — encapsulation chặn lại, vì `TasksService` chưa được công khai.
- `CommentsService` khi đó có thể `constructor(private tasksService: TasksService) {}` và gọi `this.tasksService.findOne(taskId)` để kiểm tra task tồn tại — dùng lại đúng instance singleton, đúng danh sách task in-memory hiện có.
- Đây là ví dụ minh hoạ cho khái niệm, **không** phải yêu cầu sửa `TasksModule` ở lesson này — `CommentsModule` chưa tồn tại trong roadmap tới lesson này.

> 📖 Dựa trên: https://docs.nestjs.com/modules#shared-modules

### Ví dụ 4: Dynamic module — `TasksModule.forRoot()` để seed dữ liệu (khái niệm, không implement)

```ts
// minh hoạ khái niệm — KHÔNG phải code cần viết trong hands-on lesson này
import { DynamicModule, Module } from '@nestjs/common';

@Module({
  controllers: [TasksController],
})
export class TasksModule {
  static forRoot(seedTasks: Task[] = []): DynamicModule {
    return {
      module: TasksModule,
      providers: [
        TasksService,
        { provide: 'TASK_ID_START', useFactory: (): number => 1 },
        { provide: 'SEED_TASKS', useValue: seedTasks },
      ],
      exports: [TasksService],
    };
  }
}

// app.module.ts sẽ gọi thế này để truyền dữ liệu mẫu lúc khởi động:
// imports: [TasksModule.forRoot([{ id: 1, title: 'Demo', completed: false }])]
```

**Giải thích:**

- `forRoot()` là static method trả về `DynamicModule` — object có `module: TasksModule` cộng thêm `providers`/`exports` giống metadata của `@Module()`, nhưng được **tính toán tại thời điểm gọi** dựa trên `seedTasks` truyền vào.
- Khác Ví dụ 1 ở chỗ: `imports: [TasksModule]` (tĩnh) không có cách nào truyền `seedTasks` vào; `imports: [TasksModule.forRoot([...])]` (động) thì có.
- `TasksModule` hiện tại trong repo **chưa cần** pattern này vì chưa có nhu cầu cấu hình khác nhau giữa các lần import — ví dụ này chỉ để hiểu khái niệm trước khi gặp `forRoot()`/`forFeature()` thật ở các package như `TypeOrmModule`, `ConfigModule` sau này (roadmap `/fundamentals/dynamic-modules`).

> 📖 Dựa trên: https://docs.nestjs.com/fundamentals/dynamic-modules#config-module-example

---

## 🛠 Hands-on

<!-- L04 hands-on đã được thực thi theo ủy quyền một lần của user trong session 2026-08-24. -->

**Yêu cầu và kết quả đã kiểm tra:**

1. Chạy `pnpm start:dev` thành công; Nest map đủ `GET/POST /tasks` và `GET/PATCH/DELETE /tasks/:id`.
2. `POST /tasks` với `{"title":"L04 modules"}` trả `201` và task `{id: 1, completed: false}`.
3. `GET /tasks`, `GET /tasks/1` trả `200`; `GET /tasks` có `Cache-Control: no-store`.
4. `PATCH /tasks/1` đổi title và `completed: true`, trả `200`; cả `completed=false` và `completed=true` trả đúng tập kết quả.
5. `DELETE /tasks/1` trả `204`; đọc/xóa task không tồn tại trả `404` với thông báo `Task <id> not found`.

**Cách kiểm tra:**

```bash
pnpm start:dev
curl -X POST http://localhost:3000/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"L04 modules"}'
curl http://localhost:3000/tasks
curl http://localhost:3000/tasks/1
curl -X PATCH http://localhost:3000/tasks/1 \
  -H 'content-type: application/json' \
  -d '{"title":"L04 CRUD verified","completed":true}'
curl -X DELETE http://localhost:3000/tasks/1
```

**Vướng ở đâu, gỡ thế nào:**

- Không có blocker trong lượt kiểm tra này. Nếu gặp `Nest can't resolve dependencies`, kiểm tra `TasksModule` có khai báo `TasksService` và token `TASK_ID_START` trong `providers`, đồng thời `AppModule` có import `TasksModule`.

---

## ✅ Ôn tập & Quiz

<!-- Điền sau bước /lesson-review. Trả lời bằng lời của mình, KHÔNG copy đáp án.
     Nếu không tự trả lời được thì lesson chưa xong — quay lại phần Lý thuyết. -->

1. **Hỏi:** Nếu bạn thêm `exports: [TasksService]` vào `TasksModule` nhưng **không** thêm `TasksModule` vào `imports` của `CommentsModule`, `CommentsModule` có inject được `TasksService` không? Vì sao?
   **Trả lời:** Không. `exports` chỉ công khai provider ra ngoài; module tiêu thụ vẫn phải `imports: [TasksModule]` để Nest đưa provider đó vào scope của `CommentsModule`.

2. **Hỏi:** `TasksModule` hiện tại không dùng `@Global()`. Điều gì sẽ thay đổi (tốt và xấu) nếu bạn thêm `@Global()` vào `TasksModule` ngay bây giờ?
   **Trả lời:** Module global có thể cung cấp các provider đã export cho mọi module mà không cần import lặp lại, nhưng dependency trở nên ẩn và khó truy vết. Với domain riêng như Tasks, `@Global()` là over-engineering và làm yếu encapsulation.

3. **Hỏi:** Nếu `TasksModule` chuyển thành dynamic module với `TasksModule.forRoot(seedTasks)`, dòng `imports` trong `AppModule` sẽ khác gì so với `imports: [TasksModule]` hiện tại? Cái gì trong `TasksModule` bắt buộc phải đổi để hỗ trợ điều đó?
   **Trả lời:** `AppModule` sẽ dùng `imports: [TasksModule.forRoot(seedTasks)]`. `TasksModule` phải có static `forRoot()` trả về `DynamicModule`, nhận cấu hình, và đưa provider/config tương ứng vào metadata; lesson hiện tại chưa cần đổi vì module chỉ có một cấu hình.

4. **Hỏi:** Provider `'TASK_ID_START'` trong `TasksModule` hiện chỉ nằm trong `providers`, không nằm trong `exports`. Nếu `UsersModule` cũng muốn dùng token này, bạn sẽ sửa gì — và đó có phải là thiết kế tốt không?
   **Trả lời:** Thêm token vào `exports` và cho `UsersModule` import `TasksModule`. Tuy nhiên đây thường không phải thiết kế tốt: token khởi tạo ID là chi tiết nội bộ của Tasks, nên chỉ export khi Users thực sự có use case và contract rõ ràng.

5. **Hỏi:** Với Express, một route thấy được mọi service `require()` được, không có ranh giới nào. Với Nest, `TasksController` chỉ thấy được provider nào? Điều này ảnh hưởng thế nào đến cách bạn debug lỗi `Nest can't resolve dependencies of ...`?
   **Trả lời:** `TasksController` chỉ thấy provider trong `TasksModule` hoặc provider được module mà nó import export ra. Khi debug lỗi DI, kiểm tra lần lượt provider có nằm trong `providers`, token có đúng, module sở hữu có được import, và provider đó có được export nếu đi qua module khác hay không.

**Ôn lại lesson trước:** L03 dạy cách biến một class thành provider (`@Injectable()`) và inject nó qua constructor; L04 dạy provider đó "thuộc về" module nào, module nào được phép thấy nó, và các module giao tiếp với nhau qua `imports`/`exports` như thế nào.

---

## 🧠 Điểm cần nhớ

<!-- Tối đa 5 dòng. Đây là phần bạn sẽ đọc lại khi ôn nhanh trước phỏng vấn. -->

1. `@Module()` có 4 field chính — `controllers`, `providers`, `imports`, `exports` — và encapsulate provider theo mặc định.
2. Feature module = nhóm controller + service theo domain; root module (`AppModule`) chỉ nên `imports`, không tự khai controller/provider của domain con.
3. `exports` là "public API" của module — chỉ export provider mà module khác **thực sự** cần, export thừa phá vỡ encapsulation.
4. `@Global()` tiện nhưng ẩn dependency thật — chỉ dùng cho provider gần như mọi module cần (logger, config...), không dùng cho provider của một domain riêng như `TasksService`.
5. Dynamic module (`forRoot`/`register`/`forFeature`) chỉ cần khi module phải nhận cấu hình khác nhau lúc import — `TasksModule` tĩnh hiện tại chưa cần đến pattern này.

---

## 📎 Nguồn

<!-- Mọi link đã dùng. Nguồn chính thống lên đầu. -->

- [docs.nestjs.com/modules](https://docs.nestjs.com/modules)
- [docs.nestjs.com/modules#feature-modules](https://docs.nestjs.com/modules#feature-modules)
- [docs.nestjs.com/modules#shared-modules](https://docs.nestjs.com/modules#shared-modules)
- [docs.nestjs.com/modules#global-modules](https://docs.nestjs.com/modules#global-modules)
- [docs.nestjs.com/modules#dynamic-modules](https://docs.nestjs.com/modules#dynamic-modules)
- [docs.nestjs.com/fundamentals/dynamic-modules](https://docs.nestjs.com/fundamentals/dynamic-modules)
- [nestjs/nest — sample/25-dynamic-modules](https://github.com/nestjs/nest/tree/master/sample/25-dynamic-modules)
