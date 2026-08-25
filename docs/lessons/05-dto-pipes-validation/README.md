<!--
Lesson note L05 — scaffold từ docs/templates/lesson-note.md ở bước /lesson-start.
Đừng xoá mục nào: mỗi mục có một lý do sư phạm riêng, ghi trong comment.
Mục 🛠 Hands-on do BẠN tự làm; mục ✅ Ôn tập & Quiz điền ở bước /lesson-review.
-->

# L05 — DTO + Pipes + ValidationPipe

|                |                                                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Phase**      | 2 — Working with Data                                                                                             |
| **Linear**     | NES-6 (sub-issue: NES-57 Theory & note · NES-60 Hands-on · NES-65 Review & quiz)                                  |
| **Branch**     | `duongthehien2001/nes-6-l05-dto-pipes-validationpipe`                                                             |
| **Docs chính** | [/techniques/validation](https://docs.nestjs.com/techniques/validation) · [/pipes](https://docs.nestjs.com/pipes) |
| **Ngày học**   | 2026-08-25                                                                                                        |

---

## 🗂 File map lesson này

> Bản đồ chính xác nhất + đọc từng file code (kèm số dòng): chạy `pnpm lesson 05`.
> Bảng này là bản tóm tắt để đọc nhanh; cập nhật khi lesson xong.

| File                                             | Vai trò (lý thuyết / ref / hands-on)                           | Tạo ở lesson | Trạng thái        |
| ------------------------------------------------ | -------------------------------------------------------------- | ------------ | ----------------- |
| `docs/lessons/05-dto-pipes-validation/README.md` | Lý thuyết + hướng dẫn hands-on + quiz                          | L05          | Mới               |
| `docs/lessons/05-dto-pipes-validation/SPEC.md`   | Bản chiếu NES-6 + acceptance criteria cho reference impl       | L05          | Mới               |
| `package.json` / `pnpm-lock.yaml`                | Thêm `class-validator` + `class-transformer` (bạn tự cài)      | —            | Sẽ sửa (hands-on) |
| `src/tasks/dto/create-task.dto.ts`               | Hands-on — thêm validation decorator cho `title`               | L04          | Sẽ sửa (hands-on) |
| `src/tasks/dto/update-task.dto.ts`               | Hands-on — mọi field optional + rule cho `completed`           | L04          | Sẽ sửa (hands-on) |
| `src/tasks/tasks.controller.ts`                  | Hands-on — đổi `import type` DTO sang value import             | L02          | Sẽ sửa (hands-on) |
| `src/main.ts` **hoặc** `src/app.module.ts`       | Hands-on — đăng ký `ValidationPipe` toàn cục (xem Khái niệm 6) | L01 / L04    | Sẽ sửa (hands-on) |
| `src/tasks/pipes/<tên>.pipe.ts` + `.spec.ts`     | Hands-on — custom pipe tự viết + unit test                     | L05          | Dự kiến           |
| `test/tasks.e2e-spec.ts`                         | Hands-on — thêm case DTO invalid → 400                         | L04          | Sẽ sửa (hands-on) |

---

## 🎯 Mục tiêu

<!-- 3-5 gạch đầu dòng ĐO ĐƯỢC. "Hiểu về controller" là không đo được.
     "Tự viết được controller có 5 route CRUD, giải thích được @Param vs @Query" là đo được. -->

- [ ] Viết được `CreateTaskDto` / `UpdateTaskDto` bằng decorator của `class-validator`, giải thích được vì sao DTO phải là **class** chứ không phải `interface` hay `type`.
- [ ] Bật `ValidationPipe` toàn cục và nói rõ khác biệt hành vi giữa `whitelist`, `forbidNonWhitelisted`, `transform` — mỗi option chặn/đổi cái gì.
- [ ] Tự viết một custom pipe implement `PipeTransform`, bind đúng scope, và giải thích được vì sao pipe chạy _sau_ guard nhưng _trước_ handler.
- [ ] Chứng minh bằng test: request có DTO sai trả **HTTP 400** với `message` mô tả field lỗi, và request có field lạ bị strip (hoặc bị chặn) đúng theo cấu hình.
- [ ] Chỉ ra được 2 cái bẫy có thật trong repo này: `import type` cho DTO, và e2e test không chạy code trong `main.ts`.

## 📚 Lý thuyết

<!-- Giải thích bằng tiếng Việt, theo thứ tự: VẤN ĐỀ trước, GIẢI PHÁP sau.
     Mỗi khái niệm phải có link tới đúng mục docs gốc để tra lại được.
     Tránh dịch máy docs — viết như đang giảng cho người ngồi cạnh. -->

### Khái niệm 1: DTO — và vì sao nó bắt buộc là `class`

**Vấn đề nó giải quyết:** `@Body()` trả về đúng thứ client gửi lên — một plain object, không kiểu, không đảm bảo gì. `CreateTaskDto` hiện tại trong repo chỉ khai `title!: string`, nhưng đó là lời hứa của TypeScript **lúc compile**; lúc runtime client vẫn có thể gửi `{}`, `{"title": 123}` hay `{"title":"ok","isAdmin":true}` và `TasksService` sẽ nhận nguyên xi.

**Cách Nest làm:** DTO (Data Transfer Object) là class mô tả hình dạng dữ liệu đi qua biên HTTP. Nest đọc kiểu của tham số handler tại runtime qua `emitDecoratorMetadata` (repo đã bật trong `tsconfig.json`) và đưa nó cho pipe dưới tên `metatype`. Chỉ **class** mới còn tồn tại sau khi TypeScript biên dịch — `interface` và `type` bị xoá sạch, nên pipe không có gì để soi.

Docs nói thẳng hai điều dễ vấp:

- _"Since TypeScript does not store metadata about generics or interfaces... consider using concrete classes in your DTOs."_
- _"When importing your DTOs, you can't use a type-only import as that would be erased at runtime"_ — tức phải `import { CreateTaskDto }`, **không** `import type { CreateTaskDto }`.

Cái thứ hai đang sai ngay trong repo: `src/tasks/tasks.controller.ts` import cả 2 DTO bằng `import type`. Nếu bật `ValidationPipe` mà không sửa dòng import đó, pipe sẽ chạy nhưng **im lặng bỏ qua** — không lỗi, không cảnh báo, chỉ là không validate gì cả.

**Khi nào KHÔNG nên dùng:** DTO là cấu trúc của **biên HTTP**, không phải model domain. Đừng dùng chung một class cho cả body request, entity trong service và row của database — ba thứ đó thay đổi vì ba lý do khác nhau (đúng tinh thần ports & adapters bạn đã quen).

> 📖 Nguồn: https://docs.nestjs.com/techniques/validation#auto-validation

### Khái niệm 2: `class-validator` — rule là decorator, không phải `if`

**Vấn đề nó giải quyết:** Ở Express bạn viết `if (!body.title) return res.status(400)...` trong từng handler. 5 route là 5 khối `if` lặp lại, và mỗi lần đổi rule phải nhớ đi sửa hết mọi chỗ.

**Cách Nest làm:** `class-validator` cho phép gắn rule ngay lên property của DTO bằng decorator: `@IsString()`, `@IsNotEmpty()`, `@IsOptional()`, `@IsBoolean()`, `@IsEnum()`, `@MaxLength()`, `@IsEmail()`... Rule sống cùng chỗ với khai báo dữ liệu, nên đọc DTO là biết contract. Mọi route dùng DTO đó tự động thừa hưởng rule — không phải nhớ gọi validator ở đâu cả.

Version hiện hành: `class-validator@0.15.1`, `class-transformer@0.5.1`. Repo **chưa cài** — đây là việc đầu tiên của hands-on.

**Khi nào KHÔNG nên dùng:** Rule nghiệp vụ cần truy vấn dữ liệu ("title không được trùng với task đang mở của user này") không thuộc về DTO — đó là business logic, thuộc service. DTO chỉ lo tính hợp lệ về **hình dạng và kiểu** của payload.

> 📖 Nguồn: https://docs.nestjs.com/techniques/validation#using-the-built-in-validationpipe · danh sách decorator: https://github.com/typestack/class-validator#validation-decorators

### Khái niệm 3: `class-transformer` — mắt xích khiến decorator có tác dụng

**Vấn đề nó giải quyết:** JSON đi qua mạng về tới `@Body()` là **plain object**, không mang thông tin class. Mà decorator của `class-validator` lại được đăng ký theo class. Plain object và class không gặp nhau → decorator vô dụng.

**Cách Nest làm:** `class-transformer` cung cấp `plainToInstance(metatype, value)` — dựng một instance thật của DTO từ plain object, nhờ đó rule gắn trên class mới áp được. Đây chính xác là 2 dòng cốt lõi bên trong `ValidationPipe`, xem lại ở Ví dụ 3.

Bên cạnh đó, khi bật `transform: true`, chính `class-transformer` là thứ đổi kiểu nguyên thuỷ: `"1"` từ path param thành `1` nếu chữ ký handler khai `id: number`.

**Khi nào KHÔNG nên dùng:** Không cần gọi `plainToInstance` thủ công trong controller — `ValidationPipe` đã làm rồi. Gọi lại chỉ tạo thêm một lớp biến đổi khó lần.

> 📖 Nguồn: https://docs.nestjs.com/pipes#class-validator

### Khái niệm 4: Pipe — vị trí trong request lifecycle

**Vấn đề nó giải quyết:** Cần một chỗ chen vào **giữa** lúc Nest đã bóc được tham số từ request và lúc handler được gọi, để hoặc chặn dữ liệu sai, hoặc đổi dữ liệu về đúng dạng. Middleware của Express không làm được việc này một cách tổng quát: middleware không biết handler sắp chạy là gì, tham số nào, kiểu gì.

**Cách Nest làm:** Pipe là class có `@Injectable()` và implement `PipeTransform`, với đúng một method `transform(value, metadata)`. Nest chạy pipe **ngay trước khi gọi handler**, trên từng argument. Pipe chỉ có hai kết cục: trả về giá trị (có thể đã đổi) hoặc ném exception.

Thứ tự cần thuộc lòng (đã ghi trong ROADMAP, sẽ tổng hợp lại ở L11):

```
Middleware → Guard → Interceptor (before) → Pipe → Handler → Interceptor (after) → Exception Filter
```

Pipe chạy **trong exceptions zone**, nên `BadRequestException` bạn ném ra được exception layer bắt và biến thành response 400 chuẩn — không cần tự `res.status(400).json(...)`.

Nest có sẵn 10 pipe built-in: `ValidationPipe`, `ParseIntPipe`, `ParseFloatPipe`, `ParseBoolPipe`, `ParseArrayPipe`, `ParseUUIDPipe`, `ParseEnumPipe`, `DefaultValuePipe`, `ParseFilePipe`, `ParseDatePipe`. Repo đã dùng một cái từ L02: `@Param('id', ParseIntPipe)` trong `tasks.controller.ts` — đó là lý do `GET /tasks/abc` trả 400 chứ không phải 500.

**Khi nào KHÔNG nên dùng:** Pipe không phải chỗ chứa business logic hay tác dụng phụ (ghi DB, gửi mail). Nó chỉ nên validate/transform argument. Cần chặn theo quyền → Guard; cần bọc/đổi response → Interceptor.

> 📖 Nguồn: https://docs.nestjs.com/pipes · https://docs.nestjs.com/pipes#built-in-pipes

### Khái niệm 5: `whitelist` / `forbidNonWhitelisted` / `transform`

**Vấn đề nó giải quyết:** Mặc định `new ValidationPipe()` chỉ kiểm tra rule, **không** đụng tới field lạ. Client gửi `{"title":"ok","completed":true,"id":999}` thì `id: 999` vẫn đi thẳng vào service. Với entity thật (L07+) đây là lỗ hổng mass-assignment kinh điển.

**Cách Nest làm:** Ba option, mỗi cái một nhiệm vụ rõ ràng:

| Option                 | Làm gì                                                                        | Hệ quả khi có field lạ     |
| ---------------------- | ----------------------------------------------------------------------------- | -------------------------- |
| _(không bật gì)_       | Chỉ chạy rule đã khai                                                         | Field lạ đi qua nguyên vẹn |
| `whitelist: true`      | **Xoá** mọi property không có validation decorator khỏi object kết quả        | Field lạ bị strip, vẫn 201 |
| `forbidNonWhitelisted` | Thay vì strip thì **ném lỗi**. Chỉ có tác dụng khi `whitelist: true` cùng bật | 400 Bad Request            |
| `transform: true`      | `plainToInstance` + đổi kiểu nguyên thuỷ theo chữ ký handler                  | Không liên quan field lạ   |

Điểm dễ hiểu sai nhất: `whitelist` lọc theo **có decorator hay không**, không phải theo "có khai property trong class hay không". Một property khai trong DTO mà quên gắn decorator sẽ bị `whitelist: true` xoá mất — im lặng, không lỗi.

`transform: true` còn một tác dụng nữa: đổi kiểu nguyên thuỷ. Nếu handler khai `findOne(@Param('id') id: number)` thì `"7"` sẽ thành `7` mà không cần `ParseIntPipe`. Đây là "implicit conversion"; cách hiện tại của repo (`ParseIntPipe` viết rõ) là "explicit conversion" — cả hai đều đúng, chỉ khác ở chỗ ai đọc code cũng thấy ngay hay không.

**Khi nào KHÔNG nên dùng:** `forbidNonWhitelisted: true` làm API khắt khe với client cũ (thêm một field thừa là hỏng request). Với API nội bộ / đang học thì rất nên bật vì nó phơi lỗi sớm; với public API có nhiều client version thì cân nhắc chỉ `whitelist`.

> 📖 Nguồn: https://docs.nestjs.com/techniques/validation#stripping-properties · https://docs.nestjs.com/techniques/validation#transform-payload-objects

### Khái niệm 6: Đăng ký pipe ở scope nào — và cái bẫy e2e của repo này

**Vấn đề nó giải quyết:** Cùng một `ValidationPipe` có thể gắn ở 4 tầng: từng parameter, từng method (`@UsePipes()`), cả controller, hoặc toàn app. Chọn sai tầng thì hoặc lặp lại 40 lần, hoặc validate cả những chỗ không nên.

**Cách Nest làm:** Với validation đầu vào, docs khuyến nghị scope **global** để "all endpoints are protected from receiving incorrect data". Có 2 cách đăng ký global, **không** tương đương nhau:

| Cách                                       | Viết ở đâu                                      | Inject được dependency? | Có hiệu lực trong e2e test? |
| ------------------------------------------ | ----------------------------------------------- | ----------------------- | --------------------------- |
| `app.useGlobalPipes(new ValidationPipe())` | `src/main.ts`, ngoài mọi module                 | ❌ Không                | ❌ Không                    |
| provider token `APP_PIPE`                  | `providers` của `AppModule` (từ `@nestjs/core`) | ✅ Có                   | ✅ Có                       |

Cột cuối là cái bẫy có thật trong repo này: `test/tasks.e2e-spec.ts` dựng app bằng `Test.createTestingModule(...).createNestApplication()` — hàm `bootstrap()` trong `main.ts` **không bao giờ chạy** trong test. Nghĩa là nếu bạn chỉ làm đúng gạch đầu dòng 2 của issue ("bật ValidationPipe global trong `main.ts`") rồi viết e2e test kỳ vọng 400, test sẽ **fail** — và fail vì lý do không hiển nhiên chút nào.

Hai lối ra, chọn một và ghi lý do vào PR:

1. Đăng ký bằng `APP_PIPE` trong `AppModule` → e2e tự động có validation, đồng thời mở đường cho pipe cần inject dependency sau này.
2. Giữ `main.ts` và thêm đúng cấu hình đó vào phần setup của mỗi e2e spec → sát với issue hơn, nhưng cấu hình bị lặp ở 2 nơi và dễ lệch.

**Khi nào KHÔNG nên dùng scope global:** Khi rule chỉ đúng cho một route (ví dụ pipe tra Task theo id rồi trả về entity). Loại đó bind ở parameter/method, đừng đẩy lên global.

> 📖 Nguồn: https://docs.nestjs.com/pipes#global-scoped-pipes · https://docs.nestjs.com/techniques/validation#auto-validation

### Khái niệm 7: Custom pipe — `PipeTransform` và `ArgumentMetadata`

**Vấn đề nó giải quyết:** Built-in pipe phủ các trường hợp phổ biến, nhưng có những phép biến đổi chỉ đúng với domain của bạn: chuẩn hoá `title` (trim + gộp khoảng trắng), ép query `completed` về boolean theo quy ước riêng, hay đổi `id` thành chính entity Task.

**Cách Nest làm:** Viết class implement `PipeTransform<T, R>` với `transform(value: T, metadata: ArgumentMetadata): R`. `metadata` cho biết argument này là gì:

```ts
export interface ArgumentMetadata {
  type: 'body' | 'query' | 'param' | 'custom';
  metatype?: Type<unknown>;
  data?: string;
}
```

- `type`: đến từ `@Body()`, `@Query()`, `@Param()` hay custom decorator.
- `metatype`: kiểu khai trong chữ ký handler (`CreateTaskDto`, `String`, `Number`...) — `undefined` nếu không khai kiểu. Đây chính là thứ `import type` làm mất.
- `data`: chuỗi truyền vào decorator, ví dụ `'id'` trong `@Param('id')`.

`transform()` được phép `async` (Nest hỗ trợ pipe bất đồng bộ). Giá trị trả về **thay thế hoàn toàn** argument gốc.

**Khi nào KHÔNG nên dùng:** Đừng viết lại `ValidationPipe` hay `ParseIntPipe` của Nest — docs nói rõ bản built-in đầy đủ hơn nhiều. Viết custom pipe khi logic thực sự riêng của domain, hoặc khi bạn đang học cơ chế (đúng trường hợp lesson này).

> 📖 Nguồn: https://docs.nestjs.com/pipes#custom-pipes · https://docs.nestjs.com/pipes#transformation-use-case

---

## 🔗 Liên hệ kiến thức cũ

<!-- Mục quan trọng nhất của cả note. Học nhanh = neo kiến thức mới vào cái đã biết.
     Luôn đối chiếu với: Express, Prisma, hexagonal architecture. -->

| Kiến thức đã có                                                                               | Tương ứng trong NestJS                                                        | Khác nhau ở đâu                                                                                                                                                      |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Express: `if (!req.body.title) return res.status(400).json(...)` trong từng handler           | Decorator trên DTO + `ValidationPipe` chạy tự động trước handler              | Khai báo (declarative) thay vì mệnh lệnh (imperative): rule nằm ở một chỗ, mọi route dùng DTO đó thừa hưởng, không thể "quên gọi validator".                         |
| Express + `joi`/`zod`: schema là object riêng, phải nhớ gọi `schema.validate()` ở đầu handler | DTO class **là** schema; pipe tự tìm `metatype` và validate                   | Không có bước "nhớ gọi". Đổi lại, cơ chế phụ thuộc metadata runtime → mất metadata (dùng `interface`, `import type`) là mất validation trong im lặng.                |
| Express: `req.params.id` luôn là string, tự `parseInt` rồi tự check `isNaN`                   | `@Param('id', ParseIntPipe)` hoặc `transform: true`                           | Nest tách phần ép kiểu ra khỏi handler, và lỗi ép kiểu tự thành 400 qua exception layer thay vì bạn tự viết response lỗi.                                            |
| Prisma: `prisma.task.create({ data })` sẽ throw nếu `data` sai kiểu/thiếu field bắt buộc      | `ValidationPipe` chặn từ **biên HTTP**, trước khi chạm tới service/DB         | Prisma bảo vệ ở tầng dữ liệu và trả lỗi kỹ thuật (500 nếu không bắt); pipe bảo vệ ở tầng vào và trả 400 kèm thông điệp cho client. Hai lớp khác nhau, nên có cả hai. |
| Hexagonal: DTO/command ở lớp adapter, entity ở lớp domain, có mapper ở giữa                   | DTO trong `src/<feature>/dto/` = input port của HTTP adapter; `Task` = domain | Nest không ép bạn tách, nên rất dễ trượt sang dùng chung một class cho cả HTTP lẫn domain. Giữ tách bạch là lựa chọn của bạn, không phải mặc định của framework.     |

**Điều tôi từng hiểu sai:** <viết ra ngay khi phát hiện — đây là phần bạn sẽ đọc lại nhiều nhất>

---

## 💻 Ví dụ có giải thích

<!-- Mỗi ví dụ: code CHẠY ĐƯỢC + giải thích từng dòng quan trọng + link nguồn.
     Không copy nguyên docs: sửa lại theo domain Task Management của dự án.
     LƯU Ý: ví dụ dưới đây cố tình dùng domain Users, KHÔNG phải Tasks —
     phần Tasks là hands-on của bạn, note không viết sẵn lời giải. -->

### Ví dụ 1: DTO có rule — `CreateUserDto` (domain Users, không phải bài hands-on)

```ts
// file: src/users/dto/create-user.dto.ts — minh hoạ, KHÔNG phải yêu cầu sửa ở lesson này
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @IsEmail()
  email!: string;
}
```

**Giải thích:**

- Nhiều decorator trên cùng một property được áp **tất cả**; response 400 gom mọi lỗi vào mảng `message`, trừ khi bật `stopAtFirstError`.
- `name!` giữ nguyên dấu `!` như code hiện có trong repo vì `strictNullChecks: true` — dấu này chỉ nói với TypeScript "sẽ được gán lúc runtime", nó **không** tạo ra bất kỳ kiểm tra nào lúc chạy. Đúng lý do vì sao cần `class-validator`.
- Property nào **không** có decorator sẽ bị `whitelist: true` xoá khỏi object kết quả — kể cả khi bạn khai nó trong class.

> 📖 Dựa trên: https://docs.nestjs.com/techniques/validation#auto-validation (ví dụ `CreateUserDto` của docs, đổi theo domain repo)

### Ví dụ 2: Cùng một request, ba cấu hình pipe, ba kết quả

```ts
// minh hoạ hành vi — chọn cấu hình nào là quyết định của bạn ở hands-on
new ValidationPipe(); // (a) chỉ chạy rule
new ValidationPipe({ whitelist: true }); // (b) strip field lạ
new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }); // (c) chặn field lạ
```

Với request `POST /users` body `{ "name": "Hien", "email": "a@b.com", "role": "admin" }`:

| Cấu hình | HTTP | Service nhận được                | Ghi chú                                       |
| -------- | ---- | -------------------------------- | --------------------------------------------- |
| (a)      | 201  | `{ name, email, role: 'admin' }` | `role` lọt vào service — mass assignment      |
| (b)      | 201  | `{ name, email }`                | `role` bị xoá **im lặng**, client không biết  |
| (c)      | 400  | _(handler không chạy)_           | `message: ["property role should not exist"]` |

**Giải thích:**

- (a) là mặc định — an toàn nhất về tương thích, yếu nhất về bảo mật.
- (b) và (c) khác nhau ở chỗ client **có được báo** hay không. Chọn (c) khi bạn muốn lỗi phơi ra sớm (repo học tập → nên chọn (c)); chọn (b) khi có client cũ không sửa được.
- `forbidNonWhitelisted: true` mà quên `whitelist: true` thì không có tác dụng gì — docs ghi rõ nó phải đi **kèm**.

> 📖 Dựa trên: https://docs.nestjs.com/techniques/validation#stripping-properties

### Ví dụ 3: Bên trong `ValidationPipe` — 2 dòng cốt lõi

```ts
// file: trích từ docs — bản rút gọn của ValidationPipe để hiểu cơ chế
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class SimpleValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value; // không có metatype (interface / import type) => bỏ qua
    }
    const object = plainToInstance(metatype, value); // class-transformer
    const errors = await validate(object); // class-validator
    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```

**Giải thích:**

- Dòng `if (!metatype ...) return value;` là toàn bộ câu trả lời cho câu hỏi "vì sao bật pipe rồi mà không validate gì": không có `metatype` thì pipe trả về nguyên giá trị. `import type` và `interface` đều dẫn tới đúng nhánh này.
- `plainToInstance` là mắt xích bắt buộc — không có nó, `validate()` nhận plain object và không thấy decorator nào.
- `transform()` `async` vì `class-validator` hỗ trợ validator bất đồng bộ.
- Bản built-in của Nest làm nhiều hơn hẳn bản này (whitelist, transform, `exceptionFactory`, `errorFormat`...) — đọc bản rút gọn chỉ để hiểu cơ chế, **không** để chép lại.

> 📖 Dựa trên: https://docs.nestjs.com/pipes#class-validator

### Ví dụ 4: Custom transformation pipe — bản `ParseIntPipe` tối giản của docs

```ts
// file: trích từ docs — mẫu khung một custom pipe, KHÔNG phải pipe bạn cần nộp
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed');
    }
    return val;
  }
}
```

**Giải thích:**

- `PipeTransform<string, number>`: generic nói rõ vào `string`, ra `number` — giá trị trả về **thay thế** argument gốc trước khi handler nhận.
- Ném `BadRequestException` là đủ để có response 400 chuẩn, vì pipe chạy trong exceptions zone.
- Đây đúng là cơ chế đứng sau `@Param('id', ParseIntPipe)` mà `tasks.controller.ts` đang dùng từ L02 — bản built-in chỉ nhiều option hơn.
- Custom pipe của bạn ở hands-on nên làm việc gì đó **khác** với việc này (đừng viết lại `ParseIntPipe`) — gợi ý ở phần Hands-on.

> 📖 Dựa trên: https://docs.nestjs.com/pipes#transformation-use-case

---

## 🛠 Hands-on

<!-- BẠN tự code phần này. Agent không làm hộ.
     Note chỉ nêu yêu cầu, gợi ý và cách tự kiểm chứng — không có lời giải sẵn. -->

**Yêu cầu:**

0. Cài dependency (repo chưa có): `pnpm add class-validator class-transformer`. Kiểm tra chúng nằm ở `dependencies`, không phải `devDependencies` — vì code runtime cần chúng.
1. **`CreateTaskDto`** (`src/tasks/dto/create-task.dto.ts`): `title` bắt buộc, là string, không rỗng (kể cả `"   "`), có giới hạn độ dài. Tự quyết định dùng decorator nào và vì sao — sẽ bị hỏi lại ở quiz.
2. **`UpdateTaskDto`** (`src/tasks/dto/update-task.dto.ts`): mọi field optional; `completed` phải là boolean thật (`"true"` dạng string thì sao? bạn muốn nhận hay từ chối?). Nhớ rằng `whitelist: true` xoá property **không có decorator** — kể cả khi đã khai trong class.
3. **Bật `ValidationPipe` toàn cục** với `whitelist`, `forbidNonWhitelisted`, `transform`. Đọc lại Khái niệm 6 và **chọn** giữa `main.ts` + `useGlobalPipes` và `APP_PIPE` trong `AppModule`; ghi lý do chọn vào PR description.
4. **Sửa import DTO trong `tasks.controller.ts`** từ `import type` sang value import. Trước khi sửa, thử chạy với `import type` để tận mắt thấy validation **không** chạy — đây là bài học đắt hơn việc sửa đúng ngay từ đầu.
5. **Viết một custom pipe** đơn giản, đặt trong `src/tasks/pipes/`, kèm unit test `*.spec.ts` cạnh file nguồn. Vài hướng hợp lý — chọn một: chuẩn hoá `title` (trim + gộp khoảng trắng thừa); ép query `completed` (`'true'`/`'false'`/`'1'`/`'0'`) về boolean và ném 400 với giá trị khác; hoặc pipe kiểm tra `id` nằm trong khoảng hợp lệ. **Đừng** viết lại `ParseIntPipe`.
6. **Thêm test cho case DTO invalid → 400** trong `test/tasks.e2e-spec.ts` (xem AC7 của `SPEC.md` để biết danh sách case tối thiểu). Nếu ở bước 3 bạn chọn `main.ts`, nhớ rằng e2e không chạy `main.ts`.
7. Chạy `pnpm verify` và `pnpm test:e2e` — cả hai phải xanh trước khi mở PR.

**Cách kiểm tra:**

```bash
pnpm start:dev

# hợp lệ -> 201
curl -i -X POST http://localhost:3000/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"Học validation"}'

# thiếu title -> kỳ vọng 400 kèm message mô tả field lỗi
curl -i -X POST http://localhost:3000/tasks \
  -H 'content-type: application/json' \
  -d '{}'

# title rỗng / toàn khoảng trắng -> kỳ vọng 400
curl -i -X POST http://localhost:3000/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"   "}'

# field lạ -> 400 nếu forbidNonWhitelisted, 201 + bị strip nếu chỉ whitelist
curl -i -X POST http://localhost:3000/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"ok","hacker":true}'

# sai kiểu boolean -> kỳ vọng 400
curl -i -X PATCH http://localhost:3000/tasks/1 \
  -H 'content-type: application/json' \
  -d '{"completed":"yes"}'

# regression ParseIntPipe đã có từ L02 -> vẫn phải 400
curl -i http://localhost:3000/tasks/abc

pnpm verify
pnpm test:e2e
```

**Vướng ở đâu, gỡ thế nào:**

- **Bật pipe rồi mà request sai vẫn trả 201** → gần như chắc chắn là `import type` ở controller (Khái niệm 1), hoặc handler khai kiểu là `interface` thay vì class.
- **`curl` thì 400 nhưng e2e test lại 201** → e2e không chạy `main.ts` (Khái niệm 6). Đây là bẫy số một của lesson này.
- **Field khai trong DTO mà biến mất khỏi kết quả** → property đó thiếu validation decorator và `whitelist: true` đã strip nó.
- **`Nest can't resolve dependencies`** sau khi đổi sang `APP_PIPE` → kiểm tra đã import `APP_PIPE` từ `@nestjs/core` (không phải `@nestjs/common`).
- **ESLint đỏ vì `@typescript-eslint/no-unsafe-argument` hoặc `no-floating-promises`** → CI chạy `--max-warnings=0` nên warning cũng làm đỏ; sửa chứ đừng tắt rule.
- **Lệch giữa issue và model hiện tại:** NES-6 nhắc "status là enum" nhưng repo đang dùng `completed: boolean`. Mặc định của lesson này là **giữ `completed`** — xem mục "Điểm cần user quyết định" trong `SPEC.md` nếu bạn muốn đổi thật.

---

## ✅ Ôn tập & Quiz

<!-- Điền sau bước /lesson-review. Trả lời bằng lời của mình, KHÔNG copy đáp án.
     Nếu không tự trả lời được thì lesson chưa xong — quay lại phần Lý thuyết. -->

1. **Hỏi:** DTO trong Nest bắt buộc là `class`, không dùng được `interface`. Cơ chế nào ở runtime khiến điều đó là bắt buộc, và `import type { CreateTaskDto }` phá vỡ nó ở đúng chỗ nào trong `transform()` của pipe?
   **Trả lời:**

2. **Hỏi:** Bạn bật `whitelist: true` nhưng **không** bật `forbidNonWhitelisted`. Client gửi thừa một field. Chuyện gì xảy ra với request đó, và tại sao đây có thể là hành vi nguy hiểm hơn là trả 400?
   **Trả lời:**

3. **Hỏi:** `transform: true` làm hai việc khác nhau. Kể tên cả hai, và cho biết nếu đã bật `transform: true` thì `@Param('id', ParseIntPipe)` trong `tasks.controller.ts` còn cần thiết không — vì sao bạn vẫn muốn (hoặc không muốn) giữ nó?
   **Trả lời:**

4. **Hỏi:** Đăng ký `ValidationPipe` bằng `app.useGlobalPipes()` trong `main.ts` khác gì với đăng ký bằng provider `APP_PIPE` trong `AppModule`? Nêu **hai** khác biệt, trong đó có một khác biệt bạn đã gặp trực tiếp khi viết e2e test của lesson này.
   **Trả lời:**

5. **Hỏi:** Pipe chạy sau Guard nhưng trước Handler. Nếu bạn muốn viết một pipe tra Task từ `id` rồi trả về entity cho handler, việc đặt logic đó ở pipe có ưu/nhược gì so với để service tự `findOne()` trong handler? Khi nào bạn sẽ **không** chọn cách pipe?
   **Trả lời:**

**Ôn lại lesson trước:** <một câu nối kiến thức lesson này với lesson trước — điền ở bước `/lesson-review`>

---

## 🧠 Điểm cần nhớ

<!-- Tối đa 5 dòng. Đây là phần bạn sẽ đọc lại khi ôn nhanh trước phỏng vấn. -->

1. DTO phải là **class** và phải được import bằng **value import** — mất metadata runtime là mất validation, trong im lặng.
2. `class-validator` khai rule bằng decorator; `class-transformer` (`plainToInstance`) là mắt xích biến plain object thành instance để rule áp được.
3. `whitelist` strip field không có decorator · `forbidNonWhitelisted` (đi kèm `whitelist`) đổi strip thành 400 · `transform` dựng instance + ép kiểu nguyên thuỷ.
4. Pipe chạy ngay trước handler, trong exceptions zone → `BadRequestException` tự thành response 400 chuẩn.
5. `useGlobalPipes()` trong `main.ts` **không** áp dụng cho e2e test dựng app bằng `Test.createTestingModule`; `APP_PIPE` thì có, và còn inject được dependency.

---

## 🚧 Ranh giới cho reference implementation (coder agent)

> Chỉ áp dụng **sau khi** bạn đã tự xong hands-on (NES-60). Lời giải tham chiếu là để đối chiếu, không phải để thay thế — xem `docs/workflow/AGENT-MODEL.md`.

- Spec bàn giao: [`SPEC.md`](SPEC.md) (Phần B = acceptance criteria, Phần C = ranh giới file). Coder agent **chỉ đọc**, không sửa `SPEC.md`.
- Được sửa: `src/**`, `test/**`, và `package.json` + `pnpm-lock.yaml` (chỉ để thêm `class-validator`, `class-transformer`).
- **Không** đụng: `docs/**`, `.github/**`, `.husky/**`, `postman/**`.
- File mới phải có header comment `// [NES-6 · lesson 05] <vai trò file>`; **giữ nguyên** teaching comment hiện có trong `src/tasks/**` và `src/users/**` (bài học từ PR #60).
- Branch riêng `codex/nes-6-...`, PR có dòng `Fixes NES-6`. Review local do Claude Code, review lớp 1 tự động do Codex GitHub App connector, **chỉ user merge**.

---

## 📎 Nguồn

<!-- Mọi link đã dùng. Nguồn chính thống lên đầu. -->

- [docs.nestjs.com/techniques/validation](https://docs.nestjs.com/techniques/validation)
- [docs.nestjs.com/techniques/validation#stripping-properties](https://docs.nestjs.com/techniques/validation#stripping-properties)
- [docs.nestjs.com/techniques/validation#transform-payload-objects](https://docs.nestjs.com/techniques/validation#transform-payload-objects)
- [docs.nestjs.com/pipes](https://docs.nestjs.com/pipes)
- [docs.nestjs.com/pipes#custom-pipes](https://docs.nestjs.com/pipes#custom-pipes)
- [docs.nestjs.com/pipes#global-scoped-pipes](https://docs.nestjs.com/pipes#global-scoped-pipes)
- [typestack/class-validator — danh sách decorator](https://github.com/typestack/class-validator#validation-decorators)
- [typestack/class-transformer](https://github.com/typestack/class-transformer)
- [nestjs/nest — sample/01-cats-app](https://github.com/nestjs/nest/tree/master/sample/01-cats-app) — DTO có decorator `class-validator` + `app.useGlobalPipes(new ValidationPipe())` trong `main.ts`
- [nestjs/nest — sample/35-zod-validation](https://github.com/nestjs/nest/tree/master/sample/35-zod-validation) — cách tiếp cận schema-based bằng Zod, để đối chiếu với hướng decorator
