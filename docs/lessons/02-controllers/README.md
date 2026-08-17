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

- [ ] Tự viết được `TasksController` với route GET/POST/PATCH/DELETE, gắn đúng vào `TasksModule`
- [ ] Giải thích được cơ chế Nest dựng routing map từ `@Controller()` + method decorator qua `reflect-metadata`
- [ ] Phân biệt `@Param` (định danh tài nguyên, bắt buộc) và `@Query` (filter/sort/pagination, tùy chọn)
- [ ] Dùng đúng `ParseIntPipe` để vừa transform vừa validate route param, và biết vì sao DTO phải là `class`
- [ ] Giải thích được vì sao "thin controller" là nguyên tắc quan trọng nhất của lesson, và cái giá phải trả khi dùng `@Res()` không có `passthrough`

---

## 📚 Lý thuyết chuyên môn

### 1. Controller là gì — vai trò kiến trúc

Controller là **tầng giao tiếp biên** (interface layer) của một ứng dụng Nest: nhận HTTP request, xác định route nào xử lý, và trả response. Nest **không** tự chứa business logic ở đây — nguyên tắc "thin controller" nói rằng mọi logic nghiệp vụ, truy xuất DB, tính toán phải được ủy thác cho **Provider** (Service), controller chỉ định tuyến + trích xuất input + format output.

Về mặt cơ chế: một controller là **class** thường, đánh dấu bằng decorator `@Controller(prefix?)`. Decorator gắn metadata vào class; lúc bootstrap (`NestFactory.create(AppModule)`), Nest dùng `reflect-metadata` đọc toàn bộ metadata này để dựng **routing map** — bảng ánh xạ `(HTTP method, path) → handler function`. Đây là khác biệt cốt lõi so với Express: Express đăng ký route theo lối functional (`router.get(path, fn)`), còn Nest dùng mô hình class + decorator lấy cảm hứng từ Angular, tận dụng được static typing của TypeScript và dependency injection qua constructor.

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

**Route path cuối cùng = prefix của `@Controller()` + path trong decorator method.** Ví dụ `@Controller('products')` + `@Get('featured')` → `GET /products/featured`. Tên method (`findAll`, `create`, ...) hoàn toàn tùy ý — Nest không đọc tên method, chỉ đọc decorator.

> 📖 Nguồn: NotebookLM §1, §2.1; docs gốc [Controllers — Routing](https://docs.nestjs.com/controllers#routing)

### 2. Controller ↔ Module ↔ Provider (bức tranh IoC)

Một controller **phải** được khai báo trong mảng `controllers: []` của một `@Module()` — nếu không, Nest không biết class đó tồn tại và sẽ không mount route nào cả (404 dù code không lỗi cú pháp). Provider (service) được khai báo ở `providers: []`, và **IoC Container** của Nest tự quản lý vòng đời của cả controller lẫn provider — tiêm (inject) qua constructor, không bao giờ tự `new` thủ công.

```typescript
// tasks.module.ts
import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
```

Khi `NestFactory.create(AppModule)` chạy, Nest phân giải dependency graph (DAG) theo hướng **bottom-up**: khởi tạo provider trước, rồi tiêm vào constructor của controller phụ thuộc nó. Provider mặc định là **singleton** — một instance dùng chung cho toàn ứng dụng, trừ khi khai báo injection scope khác.

> 📖 Nguồn: NotebookLM §1 (đoạn Controller ↔ Module ↔ Provider); docs gốc [Controllers — Getting up and running](https://docs.nestjs.com/controllers#getting-up-and-running)

### 3. HTTP method decorator + route parameter token

Nest cung cấp decorator cho toàn bộ HTTP method chuẩn: `@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()`, `@Options()`, `@Head()`, và `@All()` (khớp mọi method). Route có tham số động dùng token dạng `:name` trong path.

```typescript
@Controller('tasks')
export class TasksController {
  @Get()
  findAll() {
    return 'This action returns all tasks';
  }

  @Get(':id')
  findOne(@Param() params: any) {
    console.log(params.id);
    return `This action returns task #${params.id}`;
  }
}
```

`@Param()` không truyền tham số → trả về **toàn bộ object** params (`{ id: '1' }`); truyền key (`@Param('id')`) → trả **giá trị trực tiếp**. Route tĩnh (`@Get('featured')`) phải khai **trước** route động (`@Get(':id')`) — nếu không, route động sẽ khớp trước và "nuốt" mất request lẽ ra thuộc route tĩnh (xem Pitfalls #1).

> 📖 Nguồn: NotebookLM §2.2; docs gốc [Controllers — Resources](https://docs.nestjs.com/controllers#resources), [Route parameters](https://docs.nestjs.com/controllers#route-parameters)

### 4. `@Param('id', ParseIntPipe)` — transform + validate cùng lúc

Route param luôn đến dưới dạng `string` (đặc tính của URL). `ParseIntPipe` là một **built-in pipe** đảm nhận hai vai trò cùng lúc:

1. **Transformation** — ép `"123"` (string) → `123` (number).
2. **Validation** — nếu chuỗi không parse được thành số, tự động throw `BadRequestException` (400) **trước khi** handler được gọi.

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

Handler `findOne` không bao giờ chạy với giá trị `id` sai định dạng — pipe chặn lại ở "biên" trước khi vào tới Service.

> 📖 Nguồn: NotebookLM §2.3; docs gốc [Pipes — Built-in pipes](https://docs.nestjs.com/pipes#built-in-pipes), [Binding pipes](https://docs.nestjs.com/pipes#binding-pipes)

### 5. `@Query('key')` — khác `@Param` ở bản chất

`@Query()` trích xuất tham số sau dấu `?` trong URL. Về **ngữ nghĩa**, đây là khác biệt quan trọng nhất giữa `@Param` và `@Query`:

- `@Param` = tham số đường dẫn, **bắt buộc**, dùng để **định danh** một tài nguyên cụ thể (`/tasks/101` → task số 101).
- `@Query` = tham số **tùy chọn**, dùng để filter, sort, hoặc phân trang một tập hợp tài nguyên (`/tasks?status=done&sort=desc`).

```typescript
@Get()
findAll(@Query('status') status?: string) {
  return `This action returns all tasks filtered by status: ${status}`;
}
```

> 📖 Nguồn: NotebookLM §2.4, §3 (bảng đối chiếu); docs gốc [Controllers — Query parameters](https://docs.nestjs.com/controllers#query-parameters)

### 6. `@Body()` + DTO — vì sao phải là `class`

DTO (Data Transfer Object) là object mô tả cấu trúc dữ liệu gửi qua mạng. Nest **khuyến nghị dùng class**, không dùng interface, vì lý do runtime: interface TypeScript bị **xóa hoàn toàn** khi biên dịch sang JavaScript (chỉ tồn tại ở compile-time), trong khi class vẫn còn là một constructor function thật ở runtime. `ValidationPipe` (kết hợp `class-validator` + `class-transformer`) cần đọc được **metatype** của tham số lúc runtime để biết cách transform/validate — điều này chỉ khả thi khi DTO là class.

```typescript
// create-task.dto.ts
import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  status?: string;
}
```

```typescript
@Post()
create(@Body() createTaskDto: CreateTaskDto) {
  return 'This action adds a new task';
}
```

Cơ chế validate tự động: `class-transformer` chuyển payload JSON thô thành instance của `CreateTaskDto`, `class-validator` kiểm tra từng decorator (`@IsString`, `@MinLength`, ...); nếu fail → `ValidationPipe` tự throw `BadRequestException` (400). **Điều kiện tiên quyết:** phải kích hoạt `app.useGlobalPipes(new ValidationPipe())` trong `main.ts` — nếu quên, decorator trên DTO chỉ nằm đó, không có gì thực thi validate (xem Pitfalls #2).

> 📖 Nguồn: NotebookLM §2.5; docs gốc [Controllers — Request payloads](https://docs.nestjs.com/controllers#request-payloads); kích hoạt `ValidationPipe` toàn cục — [Techniques/Validation](https://docs.nestjs.com/techniques/validation) (`app.useGlobalPipes`, dòng 149 file gốc — **không thuộc trang controllers**, verify riêng)

### 7. `@HttpCode` / `@Header` / `@Res()` — vì sao Nest ẩn `req`/`res` mặc định

Ở chế độ **Standard** (khuyến nghị), Nest tự serialize giá trị return thành JSON, tự set status 200 mặc định (201 cho POST). `@HttpCode(code)` ghi đè status; `@Header(key, value)` set header tĩnh:

```typescript
@Post()
@HttpCode(204)
@Header('Cache-Control', 'no-store')
create(@Body() createTaskDto: CreateTaskDto) {
  return 'This action adds a new task';
}
```

**Vì sao Nest ẩn `req`/`res` theo mặc định:** để giữ tính **platform-agnostic** — code controller không phụ thuộc Express hay Fastify. Khi bạn inject `@Res()` (hoặc `@Response()`), Nest chuyển route đó sang **Library-specific mode**: bạn phải tự gọi `res.send()`/`res.json()` (nếu không, request treo/hang vô thời hạn), và **vô hiệu hóa** toàn bộ cơ chế Standard response cho route đó — bao gồm Interceptor, `@HttpCode()`, `@Header()`, `CacheInterceptor`. Để vừa dùng `@Res()` vừa giữ được các tính năng này, truyền option `passthrough: true`:

```typescript
@Get()
findAll(@Res({ passthrough: true }) res: Response) {
  res.cookie('session', 'abc');
  return []; // Nest vẫn tự serialize JSON, Interceptor vẫn chạy
}
```

> 📖 Nguồn: NotebookLM §2.6; docs gốc [Controllers — Status code](https://docs.nestjs.com/controllers#status-code), [Response headers](https://docs.nestjs.com/controllers#response-headers), [Request object](https://docs.nestjs.com/controllers#request-object) (bảng `@Res()`/`@Response()` cảnh báo Library-specific mode)

### 8. Route wildcard & redirect (mở rộng — ⚠️ ít dùng ở domain Task Management nhưng có trong docs gốc)

`*` làm wildcard cuối path (`@Get('abcd/*')` khớp `abcd/123`, `abcd/abc`...). Từ Express v5, wildcard **ở giữa** route cần đặt tên (`ab{*splat}cd`); Fastify **không hỗ trợ** wildcard ở giữa route — đây là một điểm mất tính platform-agnostic hiếm hoi. `@Redirect(url, statusCode)` redirect response, mặc định `statusCode = 302`; giá trị return dạng `HttpRedirectResponse` có thể override tham số này để redirect động.

> 📖 Nguồn: docs gốc [Controllers — Route wildcards](https://docs.nestjs.com/controllers#route-wildcards), [Redirection](https://docs.nestjs.com/controllers#redirection) (không có trong tóm tắt NotebookLM §1–§6, đối chiếu trực tiếp file gốc)

---

## 🔄 Liên hệ kiến thức cũ (Express ↔ Nest)

| Tiêu chí       | Express                                       | Nest (Standard mode)                                                   | Khác nhau ở đâu                                                                                |
| -------------- | --------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Đăng ký route  | `router.get('/tasks/:id', (req, res) => ...)` | `@Get(':id')` trong class `@Controller('tasks')`                       | Route gắn với class + decorator, Nest tự dựng routing map lúc bootstrap qua `reflect-metadata` |
| Route params   | `req.params.id`                               | `@Param('id') id: string`                                              | Có thể gắn pipe (`ParseIntPipe`) ngay tại chỗ khai báo để transform + validate                 |
| Query params   | `req.query.filter`                            | `@Query('filter') filter: string`                                      | `@Param` = định danh bắt buộc, `@Query` = filter/sort/pagination tùy chọn                      |
| Body           | `req.body`                                    | `@Body() dto: CreateTaskDto`                                           | Body phải mô tả bằng DTO **class** (không phải interface) để pipe đọc metatype runtime         |
| Status code    | `res.status(204).send()`                      | `@HttpCode(204)`                                                       | Không cần inject `res`; vẫn giữ Standard response (Interceptor, serialize tự động)             |
| Custom header  | `res.set('Cache-Control', 'no-store')`        | `@Header('Cache-Control', 'no-store')`                                 | Header khai tĩnh ngay trên decorator                                                           |
| Redirect       | `res.redirect('https://nestjs.com')`          | `@Redirect('https://nestjs.com', 302)`                                 | Có thể override động bằng cách return object `HttpRedirectResponse`                            |
| Response types | `res.send()`/`res.json()` thủ công            | Tự serialize JSON; hỗ trợ `Promise`/RxJS `Observable` return trực tiếp | Handler `async` hoặc trả `Observable` đều được Nest tự resolve/subscribe                       |

> 📖 Nguồn: NotebookLM §3 (bảng gốc, đã bổ sung cột "Khác nhau ở đâu")

---

## 🔑 Key points

1. Route path = prefix `@Controller()` + path method decorator; tên method không ảnh hưởng routing.
2. Route tĩnh phải khai **trước** route động (`:id`) — thứ tự khai báo quyết định route nào khớp trước.
3. Controller phải nằm trong `controllers: []` của một Module, nếu không Nest không mount route (404 âm thầm).
4. `@Param` = định danh tài nguyên (bắt buộc); `@Query` = filter/sort/pagination (tùy chọn).
5. DTO phải là `class`, không phải `interface` — vì interface bị xóa lúc biên dịch, pipe cần metatype ở runtime.
6. `ParseIntPipe` (và họ `Parse*`) làm cả transform lẫn validate ngay tại route param/query.
7. `ValidationPipe` cần được kích hoạt global (`app.useGlobalPipes`) thì decorator trên DTO mới có tác dụng.
8. `@HttpCode`/`@Header` xử lý status/header mà không cần rơi vào chế độ `@Res()` library-specific.
9. `@Res()` không `passthrough: true` sẽ vô hiệu hóa Interceptor, `@HttpCode`, `@Header` cho route đó.
10. "Thin controller": business logic luôn ủy thác cho Provider/Service, controller chỉ định tuyến + format I/O.

> 📖 Nguồn: tổng hợp từ NotebookLM §1–§4 và docs gốc controllers/pipes đã trích ở trên

---

## 📝 Tổng kết

Controller trong Nest là lớp giao tiếp biên, nối HTTP request với business logic nằm ở Provider — không phải nơi chứa logic đó. Route được xác định tĩnh lúc bootstrap qua decorator (`@Controller` + method decorator), Nest tận dụng `reflect-metadata` để dựng routing map thay vì đăng ký hàm thủ công như Express. Các decorator trích xuất dữ liệu (`@Param`, `@Query`, `@Body`) thay thế trực tiếp `req.params`/`req.query`/`req.body`, đi kèm khả năng gắn pipe để transform + validate ngay tại điểm khai báo — đây là điểm mạnh cốt lõi so với Express thuần. Việc ẩn `req`/`res` mặc định giữ code platform-agnostic; `@Res()` chỉ nên dùng khi thật cần full control, và luôn cân nhắc `passthrough: true` để không đánh mất tính năng Standard (Interceptor, `@HttpCode`, `@Header`).

| Khía cạnh       | Điểm cốt lõi cần nhớ                                                                |
| --------------- | ----------------------------------------------------------------------------------- |
| Kiến trúc       | Controller = interface layer, thin; logic thuộc về Provider                         |
| Routing         | prefix + method path, static trước dynamic, metadata đọc lúc bootstrap              |
| Input decorator | `@Param` (định danh, bắt buộc) / `@Query` (filter, tùy chọn) / `@Body` (DTO class)  |
| Pipe            | `ParseIntPipe` = transform + validate; `ValidationPipe` cần bật global cho DTO      |
| Output control  | `@HttpCode`/`@Header` giữ Standard mode; `@Res()` cần `passthrough` nếu muốn giữ nó |

> 📖 Nguồn: tổng hợp NotebookLM §1–§4 + docs gốc [/controllers](https://docs.nestjs.com/controllers)

---

## ❓ Tự đặt câu hỏi (10–15 câu, có đáp án)

**Trắc nghiệm:**

1. **Hỏi:** Vì sao DTO nên dùng `class` thay vì `interface`?
   **Đáp án:** Interface bị xóa hoàn toàn khi biên dịch sang JS, không còn tồn tại ở runtime để pipe đọc metatype; class vẫn là constructor thật ở runtime.

2. **Hỏi:** Status code mặc định cho một request `POST` thành công (Standard mode, không có `@HttpCode`) là gì?
   **Đáp án:** 201 (Created) — khác với các method khác mặc định là 200.

3. **Hỏi:** Dùng `@Res()` mà không truyền `passthrough: true` sẽ gây hậu quả gì?
   **Đáp án:** Route rơi vào Library-specific mode: Interceptor, `@HttpCode()`, `@Header()`, `CacheInterceptor` bị vô hiệu hóa cho route đó; nếu quên gọi `res.send()`/`res.json()` thì request bị treo.

4. **Hỏi:** Route `@Get(':id')` nên khai trước hay sau route `@Get('featured')`?
   **Đáp án:** Sau — route tĩnh (`'featured'`) phải khai trước route động (`:id`), nếu không `:id` sẽ khớp `'featured'` trước và route tĩnh không bao giờ được gọi tới.

5. **Hỏi:** Pipe nào vừa ép kiểu string → number vừa validate, throw 400 nếu parse thất bại?
   **Đáp án:** `ParseIntPipe`.

6. **Hỏi:** `@Param()` không truyền key thì trả về gì?
   **Đáp án:** Toàn bộ object route params (ví dụ `{ id: '1' }`), không phải giá trị đơn lẻ.

7. **Hỏi:** Muốn `class-validator` decorator trên DTO thực sự chạy, cần cấu hình gì ở `main.ts`?
   **Đáp án:** `app.useGlobalPipes(new ValidationPipe())` — nếu thiếu, decorator trên DTO chỉ là annotation vô tác dụng.

8. **Hỏi:** `@Query` khác `@Param` ở bản chất ngữ nghĩa nào?
   **Đáp án:** `@Param` định danh một tài nguyên cụ thể, bắt buộc trong path; `@Query` là tham số tùy chọn để filter/sort/pagination.

**Tự luận:**

9. **Hỏi:** Vì sao nguyên tắc "thin controller" quan trọng, controller nên và không nên chứa gì?
   **Đáp án:** Controller chỉ nên định tuyến, trích xuất input (`@Param`/`@Query`/`@Body`), gọi Service, format output. Không nên chứa business logic, truy vấn DB trực tiếp, hay tính toán nghiệp vụ — vi phạm Single Responsibility, khó test đơn vị, khó tái sử dụng logic ở nơi khác (ví dụ CLI, cron job).

10. **Hỏi:** Giải thích cơ chế Nest phân giải dependency lúc `NestFactory.create(AppModule)` chạy.
    **Đáp án:** Nest dựng dependency graph (DAG) giữa các Module/Provider, phân giải bottom-up: khởi tạo Provider trước, rồi tiêm (inject qua constructor) vào Controller/Provider phụ thuộc nó. Provider mặc định là singleton dùng chung toàn ứng dụng.

11. **Hỏi:** Cơ chế `ValidationPipe` + DTO class hoạt động theo các bước nào?
    **Đáp án:** `class-transformer` chuyển payload JSON thô thành instance của DTO class → `class-validator` kiểm tra từng decorator ràng buộc (`@IsString`, `@MinLength`...) → nếu có decorator fail, `ValidationPipe` tự throw `BadRequestException` (400) trước khi vào handler.

12. **Hỏi:** Muốn set cookie qua `res.cookie()` mà vẫn giữ được Standard response (return value tự serialize), làm thế nào?
    **Đáp án:** Inject `@Res({ passthrough: true }) res: Response`, gọi `res.cookie(...)` để thao tác trực tiếp, rồi vẫn `return [...]` để Nest tự xử lý phần còn lại như Standard mode.

13. **Hỏi:** Nếu quên khai `TasksController` vào `controllers: []` của `TasksModule`, hiện tượng gì xảy ra khi gọi route?
    **Đáp án:** Nest không biết controller đó tồn tại, không mount route nào của nó — gọi request trả về 404, dù code TypeScript biên dịch và chạy không lỗi.

14. **Hỏi:** Vì sao Nest chọn mô hình class + decorator thay vì đăng ký route theo hàm như Express?
    **Đáp án:** Để tận dụng static typing của TypeScript, dependency injection qua constructor, và khai báo metadata rõ ràng (`reflect-metadata`) — cho phép các layer khác (pipe, guard, interceptor) gắn vào cùng một điểm khai báo một cách nhất quán.

15. **Hỏi:** `@Redirect()` mặc định trả status code nào nếu không truyền `statusCode`?
    **Đáp án:** 302 (Found).

> 📖 Nguồn: NotebookLM §5 (10 câu gốc, đã diễn giải + bổ sung câu 13–15 đối chiếu docs gốc controllers.md)

---

## 🧠 Câu hỏi mở

1. Nếu domain `TasksController` cần route `GET /tasks/export` (xuất báo cáo tĩnh) và `GET /tasks/:id` cùng lúc, thứ tự khai báo nào đúng, và điều gì xảy ra nếu khai sai?
2. `@Res({ passthrough: true })` là một "lối thoát" hợp lý — nhưng nếu một team lạm dụng nó ở phần lớn route, điều đó nói lên gì về kiến trúc controller của họ?
3. Nếu `TasksController` và `ProjectsController` có Service phụ thuộc vòng tròn lẫn nhau (circular dependency), Nest xử lý thế nào bằng `forwardRef()`, và đây có phải dấu hiệu cần tách lại boundary Module không? _(⚠️ nội dung này không nằm trong trang `/controllers`, xem [Circular dependency](https://docs.nestjs.com/fundamentals/circular-dependency) — đã verify: `forwardRef()` cho phép Nest tham chiếu class chưa được định nghĩa, dùng khi hai Service `@Inject(forwardRef(() => ...))` lẫn nhau)_
4. Task Management API của dự án có cần API versioning (`@Version('2')`) ngay từ lesson này không, hay nên hoãn đến khi có breaking change thật sự? _(⚠️ nội dung này thuộc [Versioning](https://docs.nestjs.com/techniques/versioning) — `app.enableVersioning({ type: VersioningType.URI })`, không thuộc trang `/controllers`, đã verify tồn tại nhưng chưa học ở lesson nào)_
5. Nếu sau này chuyển từ Express sang Fastify adapter, phần nào của `TasksController` (đã viết đúng chuẩn Standard mode) sẽ **không** cần sửa gì, và phần nào (nếu có dùng wildcard giữa route hoặc `@Res()`) sẽ phải viết lại?

> 📖 Nguồn: NotebookLM §6 (câu 1, 3 phỏng theo edge case gốc); câu 2, 4, 5 tự đặt dựa trên domain Task Management của dự án — đối chiếu docs gốc đã trích ở trên

---

## ⚠️ Pitfalls

1. **Sai thứ tự route tĩnh/động:** `@Get(':id')` khai trước `@Get('featured')` → request `GET /tasks/featured` bị hiểu nhầm thành `id = 'featured'`, route tĩnh không bao giờ được gọi. **Cách tránh:** luôn khai route tĩnh trước route có tham số.
2. **Quên kích hoạt `ValidationPipe` toàn cục:** thiếu `app.useGlobalPipes(new ValidationPipe())` trong `main.ts` → decorator `class-validator` trên DTO (`@IsString`, `@MinLength`...) không có tác dụng gì, dữ liệu sai vẫn lọt vào Service. **Cách tránh:** bật global pipe ngay từ lesson đầu có DTO validate.
3. **Đặt business logic trong controller:** truy vấn DB, tính toán nghiệp vụ ngay trong method của controller → vi phạm Single Responsibility, khó unit test (phải mock cả HTTP layer), khó tái dùng logic ở nơi khác. **Cách tránh:** mọi logic chuyển vào Service, controller chỉ gọi Service.
4. **Lạm dụng `@Res()` không `passthrough`:** mất toàn bộ Standard response features (Interceptor, `@HttpCode`, `@Header`, `CacheInterceptor`); nếu quên gọi `res.send()` → request treo vô thời hạn. **Cách tránh:** chỉ dùng `@Res()` khi thật sự cần full control, luôn cân nhắc `passthrough: true` trước.
5. **DTO khai bằng `interface` thay vì `class`:** interface bị xóa lúc biên dịch → `ValidationPipe` không đọc được metatype → validate im lặng không chạy (không lỗi, không cảnh báo — nguy hiểm vì khó phát hiện). **Cách tránh:** luôn dùng `class` cho DTO, đây là quy ước bắt buộc chứ không phải tùy chọn.
6. **Circular dependency giữa hai Module/Service phụ thuộc lẫn nhau:** IoC Container không phân giải được thứ tự khởi tạo → lỗi lúc bootstrap. **Cách tránh:** dùng `forwardRef()` ở cả hai chiều `@Inject()`, hoặc ưu tiên tái cấu trúc lại boundary Module nếu circular dependency là dấu hiệu thiết kế sai (xem Câu hỏi mở #3).

> 📖 Nguồn: NotebookLM §4 (pitfalls #1–#6); đối chiếu docs gốc [Controllers](https://docs.nestjs.com/controllers), [Pipes](https://docs.nestjs.com/pipes), [Circular dependency](https://docs.nestjs.com/fundamentals/circular-dependency)

---

## 📎 Nguồn

- **NotebookLM (grounded từ docs.nestjs.com/controllers)** — `/tmp/l02-notebook-answer.md`, dùng cho: Lý thuyết §1–§6, bảng liên hệ Express↔Nest, Key points, Tổng kết, Quiz trắc nghiệm+tự luận, Câu hỏi mở #1/#3, Pitfalls.
- [docs.nestjs.com/controllers](https://docs.nestjs.com/controllers) — nguồn chính thống, đối chiếu trực tiếp mọi khái niệm; dùng riêng cho Lý thuyết §8 (wildcard, redirect) không có trong tóm tắt NotebookLM.
- [docs.nestjs.com/pipes](https://docs.nestjs.com/pipes) — mục Built-in pipes / Binding pipes, cho `ParseIntPipe`.
- [docs.nestjs.com/techniques/validation](https://docs.nestjs.com/techniques/validation) — `app.useGlobalPipes(new ValidationPipe())`, verify riêng cho Lý thuyết §6 và Pitfalls #2 (không thuộc trang `/controllers`).
- [docs.nestjs.com/techniques/versioning](https://docs.nestjs.com/techniques/versioning) — verify riêng cho Câu hỏi mở #4 (⚠️ chưa học ở lesson nào, chỉ tham khảo).
- [docs.nestjs.com/fundamentals/circular-dependency](https://docs.nestjs.com/fundamentals/circular-dependency) — verify riêng cho Pitfalls #6 và Câu hỏi mở #3 (`forwardRef()`).
- NestJS version dùng trong repo: `@nestjs/core@11.2.1` (khai trong `package.json`: `^11.0.1`).
- `src/users/users.controller.ts`, `src/users/dto/create-user.dto.ts` — reference implementation hiện có trong repo (NES-2), dùng để đối chiếu pattern thật đang chạy trong dự án (⚠️ chưa dùng `class-validator` decorator, chỉ là DTO thuần — sẽ bổ sung ở lesson validation).
