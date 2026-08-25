# L05 — DTO + Pipes + ValidationPipe

|                |                                                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Phase**      | 2 — Working with Data                                                                                             |
| **Linear**     | NES-6 (sub-issue: NES-57 Theory & note · NES-60 Hands-on · NES-65 Review & quiz)                                  |
| **Branch**     | `duongthehien2001/nes-6-l05-dto-pipes-validationpipe`                                                             |
| **Docs chính** | [/techniques/validation](https://docs.nestjs.com/techniques/validation) · [/pipes](https://docs.nestjs.com/pipes) |
| **Ngày học**   | 2026-08-25                                                                                                        |

> 📝 **Toàn bộ phần Hands-on + Quiz của lesson này được thực thi thay**, không phải "bạn tự làm" như scaffold gốc. Xem disclaimer ngay dưới đây trước khi đọc tiếp — đây là tuyên bố có hiệu lực.

> ⚠️ **Disclaimer — execution substitute (2026-08-25):** Phần **🛠 Hands-on** (NES-60: DTO validation, `ValidationPipe` toàn cục, custom pipe, test case invalid → 400) được **Hermes/Codex thực thi thay** qua PR #78 (`Fixes NES-6`, branch `codex/nes-6-dto-pipes-validation`, merge commit `b3086f4`). Phần **✅ Ôn tập & Quiz** (NES-65) được **Claude Code thực thi thay** ở bước closeout ngay sau đó, dựa trên việc đọc lại diff PR #78 và docs gốc — không phải câu trả lời do Hien Duong tự nghĩ ra. Cả hai nằm trong **ngoại lệ user duyệt một lần (approved one-time exception, 2026-08-25)** vì user đang bận. Đây là **bằng chứng thực thi thay (execution substitute)**: code chạy thật, test pass thật (`pnpm test` 7 suites/20 tests, `pnpm test:e2e` 3 suites/13 tests, `pnpm verify` PASS), lý luận quiz dựa trên code thật — **KHÔNG phải xác nhận rằng Hien Duong đã tự tay code hands-on hoặc tự trả lời quiz này**. Muốn học thật, hãy tự làm lại hands-on và tự trả lời quiz trước khi đọc phần bên dưới.

---

## 🗂 File map lesson này

> Bản đồ chính xác nhất + đọc từng file code (kèm số dòng): chạy `pnpm lesson 05`.
> Bảng này là bản tóm tắt để đọc nhanh; cập nhật khi lesson xong.

| File                                                         | Vai trò (lý thuyết / ref / hands-on)                        | Tạo ở lesson | Trạng thái                               |
| ------------------------------------------------------------ | ----------------------------------------------------------- | ------------ | ---------------------------------------- |
| `docs/lessons/05-dto-pipes-validation/README.md`             | Lý thuyết + hướng dẫn hands-on + quiz                       | L05          | Merged (PR #78)                          |
| `docs/lessons/05-dto-pipes-validation/SPEC.md`               | Bản chiếu NES-6 + acceptance criteria cho reference impl    | L05          | Merged (PR #78)                          |
| `package.json` / `pnpm-lock.yaml`                            | Thêm `class-validator` + `class-transformer`                | —            | ✅ Merged (PR #78, execution substitute) |
| `src/tasks/dto/create-task.dto.ts`                           | Hands-on — thêm validation decorator cho `title`            | L04          | ✅ Merged (PR #78, execution substitute) |
| `src/tasks/dto/update-task.dto.ts`                           | Hands-on — mọi field optional + rule cho `completed`        | L04          | ✅ Merged (PR #78, execution substitute) |
| `src/tasks/tasks.controller.ts`                              | Hands-on — đổi `import type` DTO sang value import          | L02          | ✅ Merged (PR #78, execution substitute) |
| `src/app.module.ts`                                          | Hands-on — đăng ký `ValidationPipe` toàn cục qua `APP_PIPE` | L01 / L04    | ✅ Merged (PR #78, execution substitute) |
| `src/tasks/pipes/parse-completed-query.pipe.ts` + `.spec.ts` | Hands-on — custom pipe tự viết + unit test                  | L05          | ✅ Merged (PR #78, execution substitute) |
| `test/tasks.e2e-spec.ts`                                     | Hands-on — thêm case DTO invalid → 400                      | L04          | ✅ Merged (PR #78, execution substitute) |

---

## 🎯 Mục tiêu

<!-- 3-5 gạch đầu dòng ĐO ĐƯỢC. "Hiểu về controller" là không đo được.
     "Tự viết được controller có 5 route CRUD, giải thích được @Param vs @Query" là đo được. -->

- [x] Viết được `CreateTaskDto` / `UpdateTaskDto` bằng decorator của `class-validator`, giải thích được vì sao DTO phải là **class** chứ không phải `interface` hay `type`.
- [x] Bật `ValidationPipe` toàn cục và nói rõ khác biệt hành vi giữa `whitelist`, `forbidNonWhitelisted`, `transform` — mỗi option chặn/đổi cái gì.
- [x] Tự viết một custom pipe implement `PipeTransform`, bind đúng scope, và giải thích được vì sao pipe chạy _sau_ guard nhưng _trước_ handler.
- [x] Chứng minh bằng test: request có DTO sai trả **HTTP 400** với `message` mô tả field lỗi, và request có field lạ bị strip (hoặc bị chặn) đúng theo cấu hình.
- [x] Chỉ ra được 2 cái bẫy có thật trong repo này: `import type` cho DTO, và e2e test không chạy code trong `main.ts`.

> Đã tick dựa trên **bằng chứng thực thi thay** (code chạy thật + test pass thật ở PR #78, lý luận quiz dựa trên code thật) — **không phải** bằng chứng Hien Duong tự tay code hands-on hoặc tự trả lời quiz. Xem disclaimer đầu file.

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

**Điều tôi từng hiểu sai:** Mục này thường ghi hiểu lầm **cá nhân** phát hiện lúc tự code — nhưng hands-on lesson này do Hermes/Codex thực thi thay (xem disclaimer đầu file), nên không có trải nghiệm cá nhân thật để ghi vào đây. Thay vào đó, đây là 2 điểm dễ hiểu lầm mà Claude Code phát hiện khi đọc lại diff PR #78 và issue Linear gốc — vẫn đáng đọc dù không phải bài học "xương máu" của chính người học:

1. Issue Linear NES-6 viết "status là enum" ở phần Hands-on, dễ khiến người đọc nghĩ phải đổi model `Task`. PR #78 **giữ nguyên** `completed: boolean` (đúng lựa chọn mặc định đã ghi sẵn trong `SPEC.md` trước khi code) — câu chữ đó trong issue chỉ là ví dụ minh hoạ "rule hợp lý", không phải yêu cầu đổi contract.
2. `whitelist: true` + `forbidNonWhitelisted: true` áp dụng qua `APP_PIPE` là **toàn app**, không chỉ riêng `tasks`. Vì vậy `CreateUserDto` (module khác, ngoài scope trực tiếp của NES-6) cũng phải nhận thêm decorator (`@IsEmail`, `@MaxLength`, `password?` optional) để `users.e2e-spec.ts` cũ không vỡ vì field lạ bị chặn — một thay đổi pipe global có tác dụng phụ tràn qua module không liên quan trực tiếp tới issue.

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

### ✅ Bằng chứng thực thi thay — PR #78 (kết quả thật, không phải hướng dẫn)

> Xem disclaimer đầu file: phần dưới đây mô tả code **đã chạy thật** trong PR #78 (`codex/nes-6-dto-pipes-validation` → `main`, merge `b3086f4`), không phải việc Hien Duong tự làm.

**0. Dependency (AC1).** `class-validator@0.15.1` + `class-transformer@0.5.1` nằm trong `dependencies` (không phải `devDependencies`) của `package.json`, `pnpm-lock.yaml` cập nhật cùng commit.

**1–2. DTO.** `src/tasks/dto/create-task.dto.ts`: `title` bắt buộc (`@IsString @IsNotEmpty`), chặn chuỗi toàn khoảng trắng bằng `@Matches(/\S/)` (`@IsNotEmpty()` một mình không đủ vì `"   "` không rỗng theo độ dài string), `@MaxLength(200)`. `src/tasks/dto/update-task.dto.ts`: mọi field `@IsOptional()`, `title` áp cùng rule với `create`, `completed` dùng `@IsBoolean()` — **từ chối** `"true"` dạng string, đúng lựa chọn "từ chối" đặt ra ở yêu cầu 2.

**3. `ValidationPipe` toàn cục qua `APP_PIPE` — vì sao không chọn `main.ts`.** `src/app.module.ts` đăng ký `new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` qua token `APP_PIPE` (từ `@nestjs/core`) trong `providers` của `AppModule`, kèm comment ngay trong code: _"APP_PIPE covers both src/main.ts bootstrap and createNestApplication e2e apps."_ Đây là phương án (a) của Khái niệm 6 / `SPEC.md` AC4 — bắt buộc vì `test/tasks.e2e-spec.ts` dựng app bằng `Test.createTestingModule({ imports: [AppModule] }).createNestApplication()`, **không** chạy `main.ts`; nếu chọn `app.useGlobalPipes()` trong `main.ts`, toàn bộ case 400 mới thêm ở AC7 sẽ fail trong e2e dù `curl` thủ công qua `pnpm start:dev` vẫn đúng.

**4. Value import (AC5).** `src/tasks/tasks.controller.ts` đổi `import type { CreateTaskDto }` / `import type { UpdateTaskDto }` sang value import (`import { CreateTaskDto } from './dto/create-task.dto'`), giữ `import type { Task }` riêng vì `Task` không cần metadata runtime (không phải DTO qua `@Body()`).

**5. Custom pipe (AC6).** `src/tasks/pipes/parse-completed-query.pipe.ts`: `ParseCompletedQueryPipe implements PipeTransform<string | undefined, string | undefined>` — chuẩn hoá query `completed` (`'true'|'1'` → `'true'`, `'false'|'0'` → `'false'`, giá trị khác → `BadRequestException`), bind ở `@Query('completed', ParseCompletedQueryPipe)` trong `findAll()` (scope parameter, không global — đúng gợi ý "đừng viết lại `ParseIntPipe`"). Unit test cạnh file (`parse-completed-query.pipe.spec.ts`) cover 4 giá trị canonical, giá trị `undefined`, và giá trị không hợp lệ ném exception.

**6–7. Test case DTO invalid → 400 (AC7, `test/tasks.e2e-spec.ts`).** Case thật đang chạy: `POST /tasks {}` → 400, `message` chứa `"title"`; `POST /tasks {title: ''}` và `{title: '   '}` → 400; `POST /tasks {title: 123}` (sai kiểu) → 400; `POST /tasks {title: 'x'.repeat(201)}` (vượt `MaxLength`) → 400; `POST /tasks {title: 'ok', hacker: true}` → 400 (do `forbidNonWhitelisted`, không phải strip + 201); `PATCH /tasks/:id {completed: 'yes'}` → 400; `PATCH /tasks/:id {title: '   '}` → 400; `GET /tasks?completed=maybe` → 400 (qua `ParseCompletedQueryPipe`); `GET /tasks/abc` → 400 (regression `ParseIntPipe` từ L02, vẫn còn nguyên).

**Contract giữ nguyên (AC9).** `POST /tasks` hợp lệ vẫn trả `{ id, title, completed }`; `GET /tasks` vẫn có header `Cache-Control: no-store`; `DELETE /tasks/:id` vẫn `204`. Test CRUD flow cũ (`supports the complete in-memory CRUD flow`) pass không sửa logic.

**Tác dụng phụ ngoài scope NES-6.** Vì `APP_PIPE` là global, `src/users/dto/create-user.dto.ts` cũng cần thêm decorator (`@MaxLength(80)` cho `name`, `password?` optional với `@IsString @MaxLength(200)`) để `test/users.e2e-spec.ts` cũ không vỡ vì `forbidNonWhitelisted`; `password` vẫn không xuất hiện trong response (do logic loại trừ hiện có ở service/mapping, không phải do whitelist của pipe).

**Kết quả verify (đọc lại tại thời điểm closeout, khớp PR #78):** `pnpm test` — 7 suites / 20 tests pass. `pnpm test:e2e` — 3 suites / 13 tests pass. `pnpm verify` (lint `--max-warnings=0` + prettier check + jest + build) — PASS. Merge commit `b3086f4`.

---

## ✅ Ôn tập & Quiz

> Trả lời dưới đây là **bằng chứng thực thi thay** của Claude Code (xem disclaimer đầu file), dựa trực tiếp trên code thật trong PR #78 và docs gốc — không phải câu trả lời tự nghĩ của Hien Duong.

1. **Hỏi:** DTO trong Nest bắt buộc là `class`, không dùng được `interface`. Cơ chế nào ở runtime khiến điều đó là bắt buộc, và `import type { CreateTaskDto }` phá vỡ nó ở đúng chỗ nào trong `transform()` của pipe?
   **Trả lời:** Nest đọc kiểu tham số handler lúc runtime qua `emitDecoratorMetadata` (bật trong `tsconfig.json`) và gắn kiểu đó vào `ArgumentMetadata.metatype` truyền cho pipe. Chỉ **class** còn tồn tại sau khi TypeScript biên dịch ra JS — `interface`/`type` bị xoá hoàn toàn, không còn gì để `metatype` trỏ tới. `import type { CreateTaskDto }` phá vỡ đúng ở dòng đầu tiên của `transform()` trong `ValidationPipe` (xem Ví dụ 3): `if (!metatype || !this.toValidate(metatype)) { return value; }`. Vì `import type` bị TypeScript xoá hoàn toàn lúc compile (cùng hiệu ứng với `interface`), tham số `createTaskDto: CreateTaskDto` sẽ có `metatype` là `undefined` lúc chạy thật — pipe rơi vào nhánh `return value`, trả nguyên giá trị chưa qua `plainToInstance`/`validate`. Đây chính là lỗi có thật đã tồn tại trong `tasks.controller.ts` trước PR #78, và đã được sửa bằng value import.

2. **Hỏi:** Bạn bật `whitelist: true` nhưng **không** bật `forbidNonWhitelisted`. Client gửi thừa một field. Chuyện gì xảy ra với request đó, và tại sao đây có thể là hành vi nguy hiểm hơn là trả 400?
   **Trả lời:** `whitelist: true` một mình chỉ **xoá âm thầm** property không có validation decorator khỏi object mà `class-transformer` dựng ra — request vẫn trả `201`, service nhận object đã bị strip, nhưng client **không nhận được thông báo gì** về việc field của họ bị bỏ. Nguy hiểm hơn trả 400 vì: (1) client thấy `201` = "thành công" nên tưởng field đã được lưu, trong khi dữ liệu đó đã biến mất — một bug im lặng khó debug; (2) nó che giấu lỗi thật của client (ví dụ typo tên field) thay vì báo ngay, khiến lỗi tích tụ và chỉ lộ ra muộn hơn, ở một chỗ khó truy ngược nguyên nhân. `forbidNonWhitelisted: true` (PR #78 đã chọn, luôn đi kèm `whitelist: true`) đổi hành vi đó thành `400` tức thì với `message` nêu rõ field bị chặn.

3. **Hỏi:** `transform: true` làm hai việc khác nhau. Kể tên cả hai, và cho biết nếu đã bật `transform: true` thì `@Param('id', ParseIntPipe)` trong `tasks.controller.ts` còn cần thiết không — vì sao bạn vẫn muốn (hoặc không muốn) giữ nó?
   **Trả lời:** Hai việc: (1) `plainToInstance` dựng **instance thật** của DTO từ plain object — mắt xích bắt buộc để decorator `class-validator` có tác dụng, vì `validate()` không thấy được decorator trên một plain object thuần; (2) **ép kiểu nguyên thuỷ** theo chữ ký khai trong handler, ví dụ `@Param('id') id: number` sẽ tự đổi `"7"` (string từ URL) thành `7` — "implicit conversion", không cần `ParseIntPipe` riêng. Trong `tasks.controller.ts` thật của repo, `@Param('id', ParseIntPipe)` **vẫn được giữ** dù `transform: true` đã bật toàn cục qua `APP_PIPE`. Lý do hợp lý để giữ: nó tài liệu hoá ngay tại chữ ký route rằng `id` phải là số — ai đọc code không cần biết `transform: true` đang bật ở `AppModule` mới hiểu; nó cũng là pipe đã có từ L02, và AC7 của `SPEC.md` ghi rõ case `GET /tasks/abc → 400` là "regression cho `ParseIntPipe` đã có từ L02" — PR #78 chủ định giữ nguyên làm điểm neo, không đổi sang dựa hẳn vào implicit conversion mới (đúng AC9: không đổi contract sẵn có).

4. **Hỏi:** Đăng ký `ValidationPipe` bằng `app.useGlobalPipes()` trong `main.ts` khác gì với đăng ký bằng provider `APP_PIPE` trong `AppModule`? Nêu **hai** khác biệt, trong đó có một khác biệt bạn đã gặp trực tiếp khi viết e2e test của lesson này.
   **Trả lời:** Khác biệt 1 — **inject dependency**: `app.useGlobalPipes(new ValidationPipe())` trong `main.ts` chỉ gọi hàm với instance dựng tay, không qua DI container của Nest, nên pipe đó không thể inject provider khác. `APP_PIPE` là một provider token thật trong `providers` của `AppModule` (dùng `useFactory`), nên có thể inject dependency như mọi provider khác. Khác biệt 2 — **có hiệu lực trong e2e hay không**, và đây chính là điều gặp trực tiếp khi làm lesson này: `test/tasks.e2e-spec.ts` dựng app bằng `Test.createTestingModule({ imports: [AppModule] }).createNestApplication()` — `bootstrap()` trong `main.ts` **không bao giờ chạy** trên đường này. PR #78 chọn `APP_PIPE` trong `AppModule` chính vì lý do đó (comment trong code: _"APP_PIPE covers both src/main.ts bootstrap and createNestApplication e2e apps"_) — nếu chọn `main.ts`, toàn bộ 9 case `400` mới thêm vào `tasks.e2e-spec.ts` sẽ fail hết dù `curl` thủ công qua `pnpm start:dev` vẫn đúng.

5. **Hỏi:** Pipe chạy sau Guard nhưng trước Handler. Nếu bạn muốn viết một pipe tra Task từ `id` rồi trả về entity cho handler, việc đặt logic đó ở pipe có ưu/nhược gì so với để service tự `findOne()` trong handler? Khi nào bạn sẽ **không** chọn cách pipe?
   **Trả lời:** Ưu điểm đặt logic tra cứu vào pipe: handler nhận thẳng entity đã tồn tại (không cần gọi lại `findOne()`), và lỗi "not found" bị chặn sớm hơn trong request lifecycle (ở Pipe, trước Handler); nếu nhiều route cùng cần "tra rồi mới xử lý", logic viết một lần rồi bind lại nhiều nơi. Nhược điểm: pipe chỉ nhận đúng giá trị của **một** argument (`ArgumentMetadata.data` là tên tham số đó) — nếu việc tra cứu cần thêm ngữ cảnh từ argument khác (ví dụ phải biết `userId` từ token để kiểm tra task có thuộc project của user không), pipe không có sẵn quyền truy cập toàn bộ chữ ký handler nên logic dễ bị cắt khúc. Trong repo hiện tại, `TasksService.findOne()` **đã** ném lỗi not-found sẵn — chuyển logic đó vào pipe sẽ **trùng lặp** với service, và vi phạm đúng quy tắc "business logic không nằm ngoài service" mà repo đang theo (tra entity theo id vẫn là business logic, dù nó chạy trong pipe hay controller). Sẽ **không chọn cách pipe** khi: (1) việc tra cứu cần nhiều hơn một tham số của request (auth, quyền sở hữu qua nhiều argument); (2) service đã có sẵn logic tra + lỗi chuẩn — tách ra pipe chỉ tạo thêm một chỗ nữa phải đồng bộ mỗi khi entity đổi cấu trúc.

**Ôn lại lesson trước:** _(điền ở bước `/lesson-review` — dưới đây được Claude Code điền thay ở bước closeout, dựa trên đọc code, không phải hồi tưởng cá nhân của user)_ L04 dựng xong `TasksService`/`TasksModule` với CRUD in-memory, chưa chặn gì ở biên HTTP — `POST /tasks` với body bất kỳ đều lọt tới service. L05 thêm đúng lớp còn thiếu đó: `ValidationPipe` (qua `APP_PIPE`) chặn ở tầng Pipe, **trước khi** request chạm vào chính `TasksService` mà L04 đã xây — cùng một service, không sửa logic của nó, chỉ thêm một lớp phòng thủ phía trước.

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

> Đã thực thi qua PR #78 dưới ngoại lệ execution substitute (xem disclaimer đầu file) — ranh giới dưới đây là điều kiện đã được đặt ra **trước khi** chạy, giữ nguyên làm hồ sơ, không phải việc còn phải làm.

> Bình thường chỉ áp dụng **sau khi** bạn đã tự xong hands-on (NES-60). Lời giải tham chiếu là để đối chiếu, không phải để thay thế — xem `docs/workflow/AGENT-MODEL.md`.

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
