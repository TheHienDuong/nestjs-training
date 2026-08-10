---
name: teach
description: Giảng một khái niệm NestJS như một người thầy — đọc docs mới nhất từ nguồn chính thống, giải thích tiếng Việt theo mạch vấn đề→giải pháp, cho ví dụ chạy được theo domain của dự án, liên hệ kiến thức Express/Prisma/hexagonal đã có, rồi quiz. Dùng khi user hỏi "giải thích X", "dạy tôi về X", "/teach X", hoặc khi cần điền phần Lý thuyết của một lesson note.
---

# teach

Giảng một khái niệm NestJS cho một backend dev mới bắt đầu, đã biết Node.js / Express / Prisma / hexagonal architecture cơ bản.

## Vì sao cần skill này

Ba lý do:

1. **Chống giảng từ trí nhớ.** Model có knowledge cutoff; NestJS và hệ sinh thái của nó đổi liên tục. Skill này biến "đọc nguồn chính thống trước khi giảng" thành một bước bắt buộc, không phải một thiện chí.
2. **Chất lượng đồng đều.** Session mới không có ký ức về session cũ. Không có skill, chất lượng bài giảng phụ thuộc vào việc hôm đó context còn gì.
3. **Ép liên hệ kiến thức cũ.** Đây là đòn bẩy học nhanh nhất cho người đã biết Express, và cũng là thứ dễ bị bỏ qua nhất.

## Bước 0 (BẮT BUỘC) — Lấy tài liệu mới nhất

Không được giảng trước khi làm bước này.

`docs.nestjs.com` là **Angular SPA**, `WebFetch` sẽ chỉ trả về thẻ title, không có nội dung. Lấy markdown gốc từ repo chính chủ:

```bash
# Nội dung trang, ví dụ /controllers
gh api "repos/nestjs/docs.nestjs.com/contents/content/controllers.md" \
  -H "Accept: application/vnd.github.raw"

# Trang trong section con, ví dụ /techniques/validation
gh api "repos/nestjs/docs.nestjs.com/contents/content/techniques/validation.md" \
  -H "Accept: application/vnd.github.raw"
```

Ánh xạ tên file ↔ URL có vài chỗ lệch, đáng chú ý:

| URL                                      | File markdown                                  |
| ---------------------------------------- | ---------------------------------------------- |
| `/middleware`                            | `content/middlewares.md`                       |
| `/fundamentals/custom-providers`         | `content/fundamentals/dependency-injection.md` |
| `/fundamentals/injection-scopes`         | `content/fundamentals/provider-scopes.md`      |
| `/fundamentals/testing`, `/unit-testing` | `content/fundamentals/unit-testing.md`         |
| `/techniques/database`                   | `content/techniques/sql.md`                    |
| `/security/encryption-and-hashing`       | `content/security/encryption-hashing.md`       |
| `/faq/common-errors`                     | `content/faq/errors.md`                        |

Không chắc file nào: `gh api "repos/nestjs/docs.nestjs.com/contents/content" --jq '.[].name'`.

Khi lesson cần thư viện ngoài, **kiểm tra version thật** thay vì đoán:

```bash
npm view @nestjs/config version
```

Ví dụ code phải khớp major version đang dùng trong `package.json` của repo.

## Cấu trúc bài giảng

### 1. Mở đầu bằng VẤN ĐỀ, không bằng cú pháp

Sai: _"Interceptor là một class implement `NestInterceptor`..."_

Đúng: _"Bạn muốn mọi response đều bọc trong `{ data: ... }`. Viết vào từng controller thì lặp 40 lần và chắc chắn có chỗ quên. Cần một chỗ chen vào giữa handler và response — đó là việc của Interceptor."_

### 2. Giải thích cơ chế

Nest làm thế nào, chạy ở đâu trong request lifecycle, đăng ký ở scope nào (method / controller / module / global).

### 3. Ví dụ theo domain của dự án

Đừng copy `cats` từ docs. Dự án này là **Task Management API** (User, Project, Task, Comment) — ví dụ phải dùng chính domain đó, để code trong bài giảng dùng được luôn cho hands-on.

Code phải **chạy được**: import đầy đủ, type đúng, khớp `tsconfig.json` của repo (`strictNullChecks: true`, `noImplicitAny: false`).

### 4. Liên hệ kiến thức cũ — không được bỏ

Luôn có một bảng đối chiếu:

| Đã biết                       | Trong NestJS                         | Khác ở đâu                                                                      |
| ----------------------------- | ------------------------------------ | ------------------------------------------------------------------------------- |
| `app.use(logger)` của Express | `middleware` + `configure(consumer)` | Nest có thêm Guard/Interceptor/Pipe/Filter, mỗi loại một vị trí và một mục đích |

Neo vào 3 nguồn kiến thức cũ của user: **Express**, **Prisma**, **hexagonal architecture** (ports & adapters, tách domain khỏi hạ tầng).

### 5. Nói cả mặt trái

Khi nào **không** nên dùng, cạm bẫy thường gặp, thứ dễ hiểu sai. Ví dụ: Guard chạy _trước_ Interceptor nên đừng mong đọc được dữ liệu đã transform; `ValidationPipe` không tự strip field lạ nếu thiếu `whitelist: true`.

### 6. Ghi vào lesson note

Điền vào mục **📚 Lý thuyết**, **🔗 Liên hệ kiến thức cũ**, **💻 Ví dụ có giải thích** của `docs/lessons/XX-*/README.md`. Mỗi khái niệm kèm link docs gốc để tra lại.

### 7. Kết bằng 3–5 câu hỏi

Câu hỏi phải kiểm tra **hiểu**, không kiểm tra **nhớ**.

- Yếu: _"Decorator để lấy body là gì?"_
- Tốt: _"Nếu đặt `ValidationPipe` ở cấp method thay vì global thì hệ quả là gì? Có trường hợp nào bạn muốn thế?"_

Ghi câu hỏi vào mục **✅ Ôn tập & Quiz**, **để trống phần trả lời** — user tự trả lời bằng lời của mình.

## Ranh giới

- **Không** làm hộ hands-on. Bài giảng cho ví dụ minh hoạ; hands-on user tự viết.
- **Không** giảng nếu bước 0 thất bại. Nói thẳng là chưa lấy được docs, đề nghị user mở link đọc cùng.
- **Không** phát minh API. Không thấy trong docs/source → nói rõ là không chắc.
- Viết **tiếng Việt**, giữ nguyên thuật ngữ tiếng Anh (provider, guard, interceptor, dependency injection) — vì đó là từ user sẽ gặp trong code và khi phỏng vấn.
