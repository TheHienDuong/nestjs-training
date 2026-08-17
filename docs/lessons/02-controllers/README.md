<!--
TEMPLATE LESSON NOTE — copy toàn bộ file này khi mở lesson mới.
Skill /lesson-start sẽ tự làm việc copy + điền phần đầu.
Đừng xoá mục nào: mỗi mục có một lý do sư phạm riêng, ghi trong comment.
-->

# L02 — Controllers & Routing

|                |                                                     |
| -------------- | --------------------------------------------------- |
| **Phase**      | 1 — Foundations                                     |
| **Linear**     | NES-3                                               |
| **Branch**     | `duongthehien2001/nes-3-l02-controllers-routing`    |
| **Docs chính** | [/controllers](https://docs.nestjs.com/controllers) |
| **Ngày học**   | 2026-08-17                                          |

---

## 🎯 Mục tiêu

- [ ] Tự viết được `TasksController` với route GET/POST/PATCH/DELETE, gắn đúng vào module
- [ ] Phân biệt được `@Param`, `@Query`, `@Body` — biết khi nào dùng cái nào
- [ ] Biết cách set status code (`@HttpCode`), custom header (`@Header`) qua decorator thay vì object `res` của Express
- [ ] Dùng được `ParseIntPipe` để vừa validate vừa transform route param sang `number`
- [ ] Giải thích được vì sao **không** nên đặt business logic trong controller, và khi nào `@Res()` là lựa chọn hợp lý

## 📚 Lý thuyết

### Khái niệm 1: Controller là gì trong Nest

**Vấn đề nó giải quyết:** một ứng dụng HTTP cần một cơ chế nhận request đến, xác định request đó thuộc route nào, và gọi đúng hàm xử lý. Ở Express bạn tự khai báo `router.get(path, handler)`. Nest cần một cách khai báo tương đương nhưng có thể tận dụng dependency injection, decorator metadata, và các layer khác (pipe, guard, interceptor) bao quanh mỗi route.

**Cách Nest làm:** một controller là một **class** thường, được đánh dấu bằng decorator `@Controller(prefix?)`. Decorator này gắn metadata vào class, cho Nest biết: "class này là nơi định tuyến request, prefix của mọi route bên trong là `prefix`". Bản thân class không có gì đặc biệt — Nest dùng `reflect-metadata` để đọc decorator lúc bootstrap và dựng routing map.

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('tasks')
export class TasksController {
  @Get()
  findAll(): string {
    return 'This action returns all tasks';
  }
}
```

Route path cuối cùng = prefix của `@Controller()` + path trong decorator method. `@Controller('tasks')` + `@Get()` (không path) → `GET /tasks`. Nếu method là `@Get(':id')` → `GET /tasks/:id`.

**Khi nào KHÔNG nên dùng:** không có "không nên" ở mức khái niệm — mọi route trong Nest đều phải nằm trong một controller. Cái cần tránh là **nhét business logic vào controller** (xem phần "Khi nào KHÔNG nên" bên dưới).

> 📖 Nguồn: [Controllers — Routing](https://docs.nestjs.com/controllers#routing)

### Khái niệm 2: Method decorator cho từng HTTP verb

**Vấn đề nó giải quyết:** một resource (`tasks`) thường cần nhiều thao tác (list, tạo mới, sửa, xoá) — mỗi thao tác ứng với một HTTP method khác nhau trên cùng một path hoặc path có tham số.

**Cách Nest làm:** Nest cung cấp decorator cho toàn bộ HTTP method chuẩn: `@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()`, `@Options()`, `@Head()`, và `@All()` (khớp mọi method). Tên hàm xử lý (`findAll`, `create`, ...) là tuỳ ý — Nest không quan tâm tên hàm, chỉ quan tâm decorator.

```typescript
@Controller('tasks')
export class TasksController {
  @Get()
  findAll() {
    return 'This action returns all tasks';
  }

  @Post()
  create() {
    return 'This action adds a new task';
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `This action returns task #${id}`;
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return `This action updates task #${id}`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return `This action removes task #${id}`;
  }
}
```

Lưu ý thứ tự khai báo: route tĩnh (`@Get()`) nên khai trước route có tham số (`@Get(':id')`), nếu không route tham số có thể "nuốt" mất request lẽ ra thuộc route tĩnh.

> 📖 Nguồn: [Controllers — Resources](https://docs.nestjs.com/controllers#resources), [Route parameters](https://docs.nestjs.com/controllers#route-parameters)

### Khái niệm 3: Lấy dữ liệu từ request — `@Param`, `@Query`, `@Body`

**Vấn đề nó giải quyết:** hầu hết route cần dữ liệu động: id trong URL, filter trên query string, payload trong body. Bạn có thể inject nguyên `@Req() request` rồi tự đọc `request.params`/`request.query`/`request.body`, nhưng Nest khuyến khích dùng decorator chuyên biệt vì code rõ ràng hơn và tách khỏi platform cụ thể (Express hay Fastify).

**Cách Nest làm:**

- `@Param(key?)` — đọc route param. Không truyền key → object đầy đủ (`{ id: '1' }`); truyền key → giá trị trực tiếp (`id: string`).
- `@Query(key?)` — đọc query string. Cùng logic: không key → toàn bộ object query.
- `@Body(key?)` — đọc request body, thường kết hợp với một **DTO class** để có type khi biên dịch.

```typescript
@Get()
findAll(@Query('status') status?: string) {
  return `This action returns tasks filtered by status: ${status}`;
}

@Post()
create(@Body() createTaskDto: CreateTaskDto) {
  return 'This action adds a new task';
}
```

**Vì sao DTO phải là class, không phải interface:** interface TypeScript bị xoá hoàn toàn sau khi biên dịch sang JS (chỉ tồn tại lúc compile-time). Class thì vẫn còn ở runtime dưới dạng constructor function thật. Pipe (ví dụ `ValidationPipe`) cần đọc được "metatype" của tham số lúc runtime để biết cách validate/transform — điều này chỉ khả thi với class.

**Khi nào KHÔNG nên dùng:** đừng dùng `@Req()` để tự parse `request.body`/`request.query` khi đã có `@Body()`/`@Query()` — mất đi lợi ích của pipe và làm code phụ thuộc platform.

> 📖 Nguồn: [Request object](https://docs.nestjs.com/controllers#request-object), [Request payloads](https://docs.nestjs.com/controllers#request-payloads), [Query parameters](https://docs.nestjs.com/controllers#query-parameters)

### Khái niệm 4: Status code & response header qua decorator

**Vấn đề nó giải quyết:** ở chế độ **Standard** (khuyến nghị), Nest tự serialize giá trị return thành JSON và set status 200 mặc định (201 cho POST). Nhưng đôi khi bạn cần status code khác (204 No Content) hoặc header tuỳ chỉnh (`Cache-Control`) mà không muốn rơi vào chế độ library-specific (`@Res()`).

**Cách Nest làm:** `@HttpCode(code)` ghi đè status code mặc định của handler; `@Header(key, value)` thêm một response header cố định.

```typescript
@Post()
@HttpCode(204)
@Header('Cache-Control', 'no-store')
create(@Body() createTaskDto: CreateTaskDto) {
  return 'This action adds a new task';
}
```

**Khi nào KHÔNG nên dùng:** nếu status code hoặc header cần tính toán động phức tạp theo nhiều điều kiện lồng nhau, cân nhắc `@Res({ passthrough: true })` để vẫn giữ được response chuẩn của Nest (interceptor, exception filter...) mà vẫn thao tác trực tiếp trên object `res`.

> 📖 Nguồn: [Status code](https://docs.nestjs.com/controllers#status-code), [Response headers](https://docs.nestjs.com/controllers#response-headers)

### Khái niệm 5: `ParseIntPipe` — vừa validate vừa transform

**Vấn đề nó giải quyết:** route param và query string luôn đến dưới dạng `string` (đặc tính của URL). Nếu service cần `number` (ví dụ `id: number`), bạn phải tự `parseInt` và tự kiểm tra `NaN` ở mọi handler — lặp code, dễ quên.

**Cách Nest làm:** `ParseIntPipe` là một **built-in pipe** thuộc nhóm transform: gắn vào tham số, nó tự convert string → number, và nếu convert thất bại thì **tự throw exception 400** trước khi handler được gọi — handler không bao giờ nhận giá trị sai định dạng.

```typescript
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return `This action returns task #${id}`;
}
```

Gọi `GET /tasks/abc` sẽ nhận:

```json
{
  "statusCode": 400,
  "message": "Validation failed (numeric string is expected)",
  "error": "Bad Request"
}
```

Cách bind tương tự cũng áp dụng cho query: `@Query('limit', ParseIntPipe) limit: number`.

**Khi nào KHÔNG nên dùng:** khi id là UUID (chuỗi, không phải số) — dùng `ParseUUIDPipe` thay vì `ParseIntPipe`. Pipes chạy trong "exceptions zone" nên đây là nơi hợp lý để validate dữ liệu ở biên hệ thống, không phải nơi để nhét business rule (ví dụ "task phải thuộc project đang active").

> 📖 Nguồn: [Pipes — Built-in pipes](https://docs.nestjs.com/pipes#built-in-pipes), [Binding pipes](https://docs.nestjs.com/pipes#binding-pipes)

---

## 🔗 Liên hệ kiến thức cũ

| Kiến thức đã có                                              | Tương ứng trong NestJS                                     | Khác nhau ở đâu                                                                                                                                |
| ------------------------------------------------------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `router.get('/tasks/:id', (req, res) => ...)`                | `@Get(':id')` là method trong class `@Controller('tasks')` | Route không nằm rời rạc theo file router mà gắn với class + decorator; Nest tự dựng routing map lúc bootstrap thay vì bạn tự `app.use(router)` |
| `req.params.id`                                              | `@Param('id') id: string`                                  | Không cần đọc qua object `req`; có thể thêm pipe (`ParseIntPipe`) ngay tại chỗ khai báo tham số để convert + validate                          |
| `req.query`                                                  | `@Query()` hoặc `@Query('key')`                            | Tương tự `@Param` — inject trực tiếp giá trị cần, không phải object `req.query` đầy đủ (trừ khi không truyền key)                              |
| `req.body`                                                   | `@Body()` kết hợp DTO **class**                            | Body phải được mô tả bằng class (không phải interface) để Nest/pipe đọc được metatype lúc runtime cho validate                                 |
| `res.status(204).send()`                                     | `@HttpCode(204)`                                           | Không cần inject object `res`; giữ nguyên chế độ Standard response (return value vẫn được Nest serialize / đi qua interceptor)                 |
| `res.set('Cache-Control', ...)`                              | `@Header('Cache-Control', ...)`                            | Header khai báo tĩnh ngay trên decorator, không cần gọi API của `res` object                                                                   |
| Middleware Express tự viết để validate `req.params.id` là số | `ParseIntPipe` built-in                                    | Không cần tự viết logic parse/validate — pipe làm cả hai việc (transform + validate) và tự throw 400 khi sai                                   |

**Điều tôi từng hiểu sai:** _(điền sau khi làm hands-on — ví dụ: nghĩ `@Body()` tự validate luôn cả kiểu dữ liệu bên trong DTO, nhưng thực ra `class-validator` + `ValidationPipe` là lớp riêng, học ở lesson pipes/validation sau)._

---

## 💻 Ví dụ có giải thích

### Ví dụ 1: So sánh với `UsersController` đã có trong repo (`src/users/users.controller.ts`)

Repo đã có `UsersModule` từ lesson trước (NES-2) làm reference implementation. Nó dùng đúng các decorator vừa học, nhưng mới chỉ có `@Get()` và `@Post()`:

```ts
// src/users/users.controller.ts (đã có trong repo)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): User[] {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto): User {
    return this.usersService.create(createUserDto);
  }
}
```

**Giải thích:**

- `constructor(private readonly usersService: UsersService)`: controller **không** tự chứa logic — nó nhận `UsersService` qua dependency injection và gọi ra. Đây là điểm mấu chốt của "business logic không nằm trong controller".
- `create(@Body() createUserDto: CreateUserDto)`: `CreateUserDto` là class (`src/users/dto/create-user.dto.ts`), không phải interface — đúng lý do đã giải thích ở Khái niệm 3.
- Module chưa có `findOne`, `update`, `remove` — đó chính là phần `TasksController` bạn sẽ tự viết ở Hands-on, áp dụng đủ 5 route CRUD thay vì chỉ 2.

> 📖 Dựa trên: `src/users/users.controller.ts`, `src/users/dto/create-user.dto.ts` (repo hiện tại)

### Ví dụ 2: Route đầy đủ cho `TasksController` (minh hoạ — không phải code để copy)

```ts
// Minh hoạ hình dạng route đầy đủ, phỏng theo "Full resource sample" của docs
@Controller('tasks')
export class TasksController {
  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return 'This action adds a new task';
  }

  @Get()
  findAll(@Query('status') status?: string) {
    return `This action returns all tasks (status: ${status})`;
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return `This action returns task #${id}`;
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return `This action updates task #${id}`;
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return `This action removes task #${id}`;
  }
}
```

**Giải thích:**

- Route tĩnh `@Get()` (findAll) khai trước route tham số `@Get(':id')` (findOne) — đúng khuyến nghị "static path trước, param path sau".
- `remove` dùng `@HttpCode(204)` vì DELETE thành công thường không trả body — khác mặc định của Nest (POST → 201, còn lại → 200).
- Đây chỉ là **minh hoạ hình dạng**, không phải code để dán vào repo — phần code thật nằm ở mục Hands-on, bạn tự viết.

> 📖 Dựa trên: [Controllers — Full resource sample](https://docs.nestjs.com/controllers#full-resource-sample)

---

## 🛠 Hands-on

**Yêu cầu:**

1. Tạo `TasksModule` + `TasksController` (dùng `nest g controller tasks` hoặc tự tạo file) với route CRUD cơ bản, **chưa cần service/DB thật** — trả dữ liệu tĩnh giống ví dụ ở docs:
   - `GET /tasks` — trả list tĩnh, hỗ trợ query filter `?status=`
   - `GET /tasks/:id` — dùng `ParseIntPipe` cho `id`
   - `POST /tasks` — nhận `CreateTaskDto` qua `@Body()`
   - `PATCH /tasks/:id` — nhận `id` (ParseIntPipe) + `UpdateTaskDto`
   - `DELETE /tasks/:id` — trả `204 No Content` qua `@HttpCode`
2. Đăng ký `TasksController` vào `TasksModule`, và đăng ký `TasksModule` vào `AppModule`.

**Cách kiểm tra:**

```bash
pnpm start:dev
curl http://localhost:3000/tasks
curl http://localhost:3000/tasks?status=done
curl http://localhost:3000/tasks/1
curl http://localhost:3000/tasks/abc   # kỳ vọng 400 nhờ ParseIntPipe
curl -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"demo"}'
curl -X DELETE http://localhost:3000/tasks/1 -i   # kỳ vọng 204
```

**Vướng ở đâu, gỡ thế nào:**

- _(điền trong lúc code — ví dụ: quên đăng ký module vào `AppModule` → Nest không nhận route, 404)_

---

## ✅ Ôn tập & Quiz

1. **Hỏi:** Route path cuối cùng của một handler được tính như thế nào?
   **Trả lời:** _(gợi ý: prefix của `@Controller()` + path trong decorator method, ví dụ `@Controller('tasks')` + `@Patch(':id')` → `PATCH /tasks/:id`)_

2. **Hỏi:** Khác nhau giữa `@Param('id')` và `@Param()` (không truyền key) là gì?
   **Trả lời:** _(gợi ý: có key → giá trị trực tiếp; không key → toàn bộ object params)_

3. **Hỏi:** Vì sao DTO nên định nghĩa bằng `class` thay vì `interface` trong TypeScript?
   **Trả lời:** _(gợi ý: interface bị xoá lúc biên dịch, class vẫn tồn tại ở runtime — pipe cần đọc metatype)_

4. **Hỏi:** `ParseIntPipe` giải quyết đồng thời hai việc gì cho một route param?
   **Trả lời:** _(gợi ý: transform string → number, và validate — throw 400 nếu không parse được)_

5. **Hỏi:** Khi nào dùng `@Res()` là hợp lý, và cái giá phải trả khi dùng nó là gì?
   **Trả lời:** _(gợi ý: khi cần full control response mà Nest chưa hỗ trợ qua decorator; cái giá: mất tính năng Standard response — như interceptor, `@HttpCode`, `@Header` — trừ khi bật `passthrough: true`; code cũng phụ thuộc platform (Express/Fastify) hơn)_

**Ôn lại lesson trước:** L01 đã dựng project + `UsersModule` với `@Get()`/`@Post()`, chưa có route theo id. L02 hoàn thiện phần còn thiếu đó: route có tham số, query filter, status code, và pipe transform — áp dụng đúng lên domain `Task` tiếp theo trong roadmap.

---

## 🧠 Điểm cần nhớ

1. Route = prefix `@Controller()` + path của method decorator; route tĩnh phải khai trước route có tham số.
2. `@Param`/`@Query`/`@Body` thay thế `req.params`/`req.query`/`req.body` — rõ ràng hơn và không phụ thuộc platform.
3. DTO phải là `class`, không phải `interface`, vì pipe cần đọc metatype lúc runtime.
4. `@HttpCode`/`@Header` xử lý status/header mà không cần rơi vào chế độ `@Res()` library-specific.
5. `ParseIntPipe` (và họ `Parse*`) vừa transform vừa validate ngay tại route param/query — validate nên nằm ở biên, không phải trong controller hay service.

---

## 📎 Nguồn

- [docs.nestjs.com/controllers](https://docs.nestjs.com/controllers)
- [docs.nestjs.com/pipes](https://docs.nestjs.com/pipes) (mục Built-in pipes / Binding pipes — cho `ParseIntPipe`)
- NestJS version dùng trong repo: `@nestjs/core@11.2.1` (khai trong `package.json`: `^11.0.1`)
- [nestjs/nest — sample/01-cats-app](https://github.com/nestjs/nest/tree/master/sample/01-cats-app)
- `src/users/users.controller.ts`, `src/users/dto/create-user.dto.ts` (reference implementation trong repo, NES-2)
