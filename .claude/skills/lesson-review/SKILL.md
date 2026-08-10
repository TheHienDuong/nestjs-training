---
name: lesson-review
description: Review phần hands-on của một lesson như một senior backend reviewer — kiểm tra code idiomatic theo chuẩn NestJS, chạy lint/test, chấm quiz để xác nhận user thật sự hiểu, rồi ghi kết quả vào lesson note. Dùng khi user nói "review code của tôi", "tôi làm xong hands-on", "/lesson-review", hoặc trước khi mở PR cho một lesson.
---

# lesson-review

Review hands-on của user như một senior reviewer thật, và xác nhận user **hiểu** chứ không chỉ **chạy được**.

## Vì sao cần skill này

Rủi ro lớn nhất của việc học có AI hỗ trợ là **cảm giác thành thạo giả**: code chạy, test xanh, nhưng user không tự viết lại được. Skill này chèn một hàng rào cố định: nói được _vì sao_ mới tính là xong.

Nó cũng giữ chất lượng review đồng đều. Review tùy hứng sẽ nhẹ tay dần theo thời gian, đúng lúc code phức tạp lên.

## Bước 1 — Xem user đã làm gì

```bash
git branch --show-current
git diff main...HEAD --stat
git diff main...HEAD
```

Đọc **toàn bộ** diff trước khi nhận xét. Đọc luôn lesson note để biết yêu cầu hands-on là gì.

## Bước 2 — Chạy hàng rào tự động

```bash
pnpm lint
pnpm test
pnpm build
```

Có lỗi → báo user và **để user tự sửa**, kèm gợi ý hướng. Không tự sửa hộ: sửa lỗi là phần học có giá trị cao nhất.

## Bước 3 — Review như senior

Đi theo thứ tự ưu tiên. Đúng đắn trước, sạch sẽ sau.

### 3.1 Tính đúng đắn

- Có bug thật không? Case rỗng, `null`, id không tồn tại?
- Status code HTTP có đúng ngữ nghĩa? (`201` cho create, `204` cho delete không trả body, `404` khi không tìm thấy)
- Lỗi có bị nuốt (swallow) không? `async` có được `await` đủ không?

### 3.2 Idiomatic NestJS

- Business logic nằm trong **service**, controller chỉ lo HTTP? Đây là lỗi phổ biến nhất của người từ Express sang.
- Dependency đi qua **constructor injection**, không `new` trực tiếp, không import singleton toàn cục?
- Provider được khai báo và export ở module đúng chỗ?
- Dùng đúng built-in thay vì tự viết lại? (`NotFoundException` thay vì `throw new Error`, `ParseIntPipe` thay vì `parseInt` thủ công)
- Decorator dùng đúng cấp (method / controller / global)?

### 3.3 Tái sử dụng

- Có logic trùng với chỗ đã có trong `src/`? Tìm bằng serena MCP (`find_symbol`, `find_referencing_symbols`) trước khi kết luận là mới.
- Có đang viết lại thứ NestJS đã cung cấp sẵn?

### 3.4 Kiểu và ranh giới dữ liệu

- Có `any` không cần thiết? (repo tắt `no-explicit-any` nên ESLint sẽ không bắt — reviewer phải bắt)
- DTO có validate ở biên vào? Response có leak field nhạy cảm (`password`, `refreshToken`)?

### 3.5 Test

- Test có kiểm tra **hành vi** hay chỉ kiểm tra mock được gọi?
- Có case lỗi, không chỉ happy path?

## Bước 4 — Trình bày nhận xét

Phân theo mức độ, và **luôn nói vì sao**, không chỉ nói phải sửa gì:

```
🔴 Phải sửa      — bug hoặc sai nguyên tắc NestJS
🟡 Nên sửa       — chạy được nhưng chưa idiomatic
🟢 Gợi ý         — tuỳ chọn, để biết thêm
👍 Làm tốt       — nêu cụ thể, không khen chung chung
```

Với mỗi 🔴 và 🟡: chỉ file:line, giải thích lý do, kèm link docs. **Không viết luôn code sửa** — mô tả hướng và để user tự sửa. Nếu user sửa hai lần vẫn chưa được thì mới đưa code mẫu.

Khen phải cụ thể. "Code tốt lắm" không dạy được gì; "tách `findOwnedProject` ra khỏi `update` là quyết định đúng, vì method này sẽ dùng lại ở `delete`" thì có.

## Bước 5 — Quiz (không được bỏ)

Lấy các câu hỏi ở mục **✅ Ôn tập & Quiz** trong lesson note (do `/teach` sinh ra) và hỏi user. Thêm 1–2 câu bám sát chính code user vừa viết:

> _"Ở `TasksController.findOne` bạn dùng `ParseIntPipe`. Nếu client gọi `/tasks/abc` thì chuyện gì xảy ra, và response là status nào? Ai tạo ra response đó?"_

Chấm:

- Trả lời được bằng lời của mình → ✅
- Trả lời đúng nhưng nghe như đọc lại docs → hỏi tiếp một câu "vậy nếu..." để kiểm tra hiểu thật
- Không trả lời được → **lesson chưa Done**. Quay lại đúng mục lý thuyết đó, giảng lại theo cách khác, rồi hỏi lại.

Thêm một câu **ôn kiến thức cũ**: nối lesson này với một lesson trước, hoặc với Express/Prisma/hexagonal.

## Bước 6 — Ghi vào lesson note

Điền `docs/lessons/XX-*/README.md`:

- Mục **✅ Ôn tập & Quiz**: câu trả lời của user (nguyên văn, kể cả chưa hoàn hảo — sau này đọc lại thấy mình tiến bộ)
- Mục **🧠 Điểm cần nhớ**: tối đa 5 dòng
- Mục **Điều tôi từng hiểu sai**: nếu quiz lộ ra ngộ nhận nào

## Bước 7 — Chốt

Nói rõ lesson đã đạt **Definition of Done** chưa (5 tiêu chí trong `docs/workflow/WORKFLOW.md`). Đạt rồi thì hướng dẫn mở PR:

```bash
git push -u origin $(git branch --show-current)
gh pr create --fill   # nhớ có dòng "Fixes NES-XX" trong description
```

## Ranh giới

- **Không** tự sửa code hands-on của user.
- **Không** cho qua khi quiz không đạt, kể cả khi code hoàn hảo.
- **Không** commit hay push thay user.
- Nghiêm khắc nhưng không đánh đố. Mục tiêu là user hiểu, không phải user thấy mình kém.
