# L08 — Schema quan hệ, migration & seed

|                |                                                                                                                                                                                                                         |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase**      | 2 — Working with Data                                                                                                                                                                                                   |
| **Linear**     | NES-90 (theory, con của NES-9 — "L08 Schema, relations, migrations, seed") · sibling: NES-91 (hands-on, learner-owned) · NES-93 (review/quiz, pending)                                                                  |
| **Branch**     | `duongthehien2001/nes-90-theory-note`                                                                                                                                                                                   |
| **Docs chính** | [/recipes/prisma](https://docs.nestjs.com/recipes/prisma) · [Prisma — Relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations) · [Prisma — Migrate](https://www.prisma.io/docs/orm/prisma-migrate) |
| **Ngày học**   | 2026-08-27                                                                                                                                                                                                              |

---

> ⚠️ **Note này CHỈ là lý thuyết (NES-90).** Không có hands-on nào được thực thi thay, không có quiz nào được trả lời thay. Khác với L05/L06/L07 — nơi user đã duyệt một ngoại lệ execution-substitute một lần cho từng lesson đó — **live ticket của L08 (NES-9/NES-90/NES-91/NES-93) không có bất kỳ ngoại lệ nào**, nên agent này không đụng vào `prisma/schema.prisma`, không chạy `prisma migrate`, không viết seed script, không tự trả lời quiz. Mục `🛠 Hands-on` và `✅ Ôn tập & Quiz` bên dưới còn nguyên — **Hien Duong phải tự làm ở NES-91 rồi tự trả lời quiz ở NES-93**. Trạng thái L08 trên `docs/ROADMAP.md` giữ ở 🟦 (đang học), không phải ✅.
>
> **Nguồn đã kiểm tra hôm nay (2026-08-27):** một số URL `prisma.io/docs` hiện trả về nội dung bản preview thế hệ sau (ví dụ trang `relations` tổng và trang `workflows/development-and-production` có nhắc `db migrate`, "contract spaces", `@@discriminator`/`@@base`, và tuyên bố sai là many-to-many ngầm định "chưa hỗ trợ"). Repo này pin `prisma@6.19.3` / `@prisma/client@6.19.3` — bản ổn định "classic". Note dưới đây bám theo hành vi ổn định của 6.x, đã đối chiếu qua [CLI reference](https://www.prisma.io/docs/orm/reference/prisma-cli-reference) và trang chuyên biệt [many-to-many-relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/many-to-many-relations) — không dùng nội dung preview.

---

## 🗂 File map lesson này

> Lesson này **không tạo/sửa code**. `prisma/schema.prisma` hiện tại vẫn chỉ có model `Task` phẳng (không quan hệ) — mọi schema/seed/service bên dưới là **minh hoạ, chưa áp dụng vào repo**. NES-91 (hands-on) sẽ là nơi các file này thật sự được tạo.

| File                              | Vai trò (lý thuyết / ref / hands-on)                                          | Tạo ở lesson           | Trạng thái      |
| --------------------------------- | ----------------------------------------------------------------------------- | ---------------------- | --------------- |
| `prisma/schema.prisma`            | Sẽ thêm model `User`/`Project`/`ProjectMember`/`Comment` + quan hệ vào `Task` | L08 (NES-91, chưa làm) | Chưa đổi        |
| `prisma/migrations/<timestamp>_*` | Migration file cho schema quan hệ mới                                         | L08 (NES-91, chưa làm) | Chưa có         |
| `prisma/seed.ts`                  | Seed script idempotent cho 4 model                                            | L08 (NES-91, chưa làm) | Chưa có         |
| `src/tasks/tasks.service.ts`      | Sẽ cần `include`/`connect` khi Task có quan hệ `Project`/`User`               | L07 (đã có, flat)      | Sẽ sửa ở NES-91 |

---

## 🎯 Mục tiêu

- [ ] Thiết kế được schema Prisma cho 4 model `User` / `Project` / `Task` / `Comment` với đúng cardinality và đúng bên sở hữu khoá ngoại (`@relation(fields, references)`)
- [ ] Phân biệt được **relation field** (ảo, chỉ tồn tại phía Prisma Client) và **relation scalar field** (cột FK thật trong DB)
- [ ] Giải thích được sự khác nhau giữa `prisma migrate dev` (dev, có shadow database) và `prisma migrate deploy` (CI/production, không shadow database, không hỏi)
- [ ] Viết được (ở NES-91) một seed script chạy lại nhiều lần không sinh dữ liệu trùng (idempotent qua `upsert`)
- [ ] Biết được khi thêm quan hệ, DTO và service phải đổi thế nào: `connect` vs nested `create`, `include`/`select` để tránh N+1

## 📚 Lý thuyết

### Khái niệm 1: Relation field vs relation scalar field

**Vấn đề nó giải quyết:** Trong Prisma schema, một quan hệ luôn được biểu diễn bằng **hai loại field khác nhau**, và người mới hay nhầm chúng là một.

- **Relation scalar field**: cột thật trong bảng (ví dụ `authorId Int`) — đây mới là khoá ngoại (FK) thật sự tồn tại trong PostgreSQL.
- **Relation field**: field kiểu model (ví dụ `author User @relation(fields: [authorId], references: [id])`) — **không tồn tại như một cột trong DB**, nó chỉ là "lối đi" để Prisma Client biết cách `include`/`select` dữ liệu liên quan lúc query. Phía "many" (ví dụ `Task` trỏ tới `Project`) có cả relation field lẫn relation scalar field; phía "one" (ví dụ `Project` có `tasks Task[]`) chỉ có relation field ảo, không có cột nào tương ứng.

**Cách Prisma làm:** Attribute `@relation(fields: [...], references: [...])` đặt ở **bên nào giữ FK** — đó cũng là bên "sở hữu" quan hệ theo nghĩa DB. Bên còn lại chỉ khai báo field ảo kiểu `Model` hoặc `Model[]`, không có `@relation(fields: ...)`.

**Khi nào KHÔNG nên dùng:** Không cần tự thêm cột `xxxId` thủ công nếu đã khai báo `@relation` đúng — Prisma tự sinh migration tạo cột đó. Tự thêm tay dễ lệch tên với field Prisma generate.

> 📖 Nguồn: [Prisma — Relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations)

---

### Khái niệm 2: Cardinality — 1-1, 1-n, n-n (implicit vs explicit)

**Vấn đề nó giải quyết:** Task Management API cần đúng 3 kiểu quan hệ, và chọn sai kiểu (đặc biệt là n-n) sẽ khiến sau này phải viết lại migration.

- **1-n (một-nhiều)**: phổ biến nhất trong domain này. `Project` 1 — n `Task` (một project có nhiều task, một task chỉ thuộc một project). FK (`projectId`) nằm ở model "nhiều" (`Task`).
- **1-1 (một-một)**: FK ở bên nào cũng được nhưng **phải có `@unique`** trên field đó — đây là điểm phân biệt 1-1 với 1-n (không có `@unique` thì Prisma hiểu nhầm thành 1-n). Domain hiện tại chưa cần 1-1, nhưng ví dụ kinh điển là `User` 1-1 `Profile`.
- **n-n (nhiều-nhiều)**: `Project` n — n `User` (một project có nhiều thành viên, một user tham gia nhiều project). Prisma hỗ trợ 2 cách:
  - **Implicit m-n** (Prisma tự tạo bảng join ẩn): chỉ cần khai `members User[]` ở `Project` và `projects Project[]` ở `User`, không cần model trung gian. Đơn giản nhưng **không thêm được field phụ** (ví dụ role của member trong project) vào bảng join.
  - **Explicit m-n** (tự viết model join): bắt buộc khi cần field phụ trên quan hệ, khi cần đặt `onDelete`/`onUpdate` riêng, hoặc khi model không có `@id` đơn. Đây là lựa chọn cho `ProjectMember` trong schema minh hoạ bên dưới, vì cần lưu `role` (OWNER/MEMBER) của từng thành viên.

**Cách Prisma làm:** Implicit m-n **vẫn được hỗ trợ đầy đủ** ở bản ổn định (đã xác minh lại qua trang chuyên biệt many-to-many-relations — một số trang preview khác của Prisma nói sai là "chưa hỗ trợ", xem cảnh báo nguồn ở đầu note).

**Khi nào KHÔNG nên dùng implicit m-n:** Ngay khi cần lưu thêm dữ liệu về _bản thân quan hệ_ (ví dụ ngày tham gia, vai trò) — đó là lúc phải chuyển sang explicit join model với `@@id([projectId, userId])`.

> 📖 Nguồn: [Prisma — Many-to-many relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/many-to-many-relations)

---

### Khái niệm 3: Referential actions (`onDelete` / `onUpdate`)

**Vấn đề nó giải quyết:** Khi một record cha bị xoá/sửa khoá chính, các record con tham chiếu tới nó phải xử lý ra sao? Đây là quyết định nghiệp vụ, không phải chi tiết kỹ thuật vặt.

- `Cascade`: xoá/sửa cha thì xoá/sửa theo con. Dùng khi con **không có nghĩa nếu thiếu cha** — ví dụ `Comment` phụ thuộc `Task`: xoá `Task` thì xoá luôn `Comment` của nó.
- `Restrict`: chặn xoá cha nếu còn con tham chiếu. Dùng khi xoá nhầm cha sẽ làm mất dữ liệu quan trọng một cách âm thầm — ví dụ không cho xoá `User` nếu vẫn còn `Project` họ sở hữu.
- `SetNull`: xoá cha thì FK ở con chuyển về `NULL` — chỉ hợp lệ khi FK đó **optional** (`Int?`). Dùng cho quan hệ "gán cho" thay vì "sở hữu" — ví dụ xoá `User` là assignee của `Task` thì `Task` không mất, chỉ mất người được giao (`assigneeId` về `null`).
- `NoAction` / `SetDefault`: ít dùng hơn trong domain đơn giản này.
- **Mặc định khi không khai báo:** quan hệ optional → `onDelete: SetNull`; quan hệ bắt buộc → `onDelete: Restrict`. `onUpdate: Cascade` là mặc định cho cả hai loại.

**Cách Prisma làm:** Khai trực tiếp trong `@relation(..., onDelete: Cascade, onUpdate: Cascade)`.

**Khi nào KHÔNG nên dùng `Cascade` tuỳ tiện:** `Cascade` cho quan hệ "sở hữu" (`User` → `Project`) rất nguy hiểm — xoá nhầm một user sẽ xoá im lặng toàn bộ project của họ. Đó là lý do domain này chọn `Restrict` cho `Project.owner`, không phải `Cascade`.

> 📖 Nguồn: [Prisma — Referential actions](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/referential-actions)

---

### Khái niệm 4: Prisma Migrate — `dev` vs `deploy` vs `reset` vs `status`

**Vấn đề nó giải quyết:** "Chỉnh `schema.prisma` rồi sao?" — Prisma Migrate là cầu nối giữa schema (khai báo) và DB thật (trạng thái), và **dev / production dùng lệnh khác nhau có chủ đích**, không phải tuỳ tiện.

- **`prisma migrate dev`** (chỉ dùng local/dev):
  1. So sánh schema hiện tại với lịch sử migration bằng một **shadow database** (DB tạm, Prisma tự tạo/xoá) để phát hiện _schema drift_ (DB thật đã bị chỉnh tay, lệch khỏi migration history).
  2. Sinh file migration SQL mới trong `prisma/migrations/<timestamp>_<name>/migration.sql`.
  3. Áp dụng migration đó lên DB dev.
  4. Chạy lại `prisma generate` (Prisma Client mới khớp schema).
  5. **Tự động chạy seed script** nếu đã cấu hình (xem Khái niệm 5).
  6. Nếu phát hiện thay đổi có thể mất dữ liệu (ví dụ đổi kiểu cột) hoặc drift, **sẽ hỏi xác nhận** trước khi reset DB — không chạy được trong CI vì cần tương tác.
- **`prisma migrate deploy`** (dùng cho CI/production): chỉ **áp dụng các file migration đã có sẵn trên đĩa**, theo đúng thứ tự, **không** tính shadow database, **không** sinh file mới, **không** hỏi gì — vì vậy an toàn để chạy non-interactive trong pipeline.
- **`prisma migrate reset`** (chỉ dev): xoá sạch DB, tạo lại từ đầu, áp toàn bộ migration history + seed. Dùng khi muốn "làm lại từ đầu" ở máy dev — **không bao giờ** chạy ở production.
- **`prisma migrate status`**: so sánh migration history trên đĩa với bảng `_prisma_migrations` trong DB, cho biết còn migration nào chưa áp dụng.

**Cách Nest làm:** NestJS không có lệnh riêng cho migration — `PrismaService` (đã có từ L07) chỉ lo kết nối/lifecycle; migration là việc của Prisma CLI, chạy độc lập với `pnpm start:dev`.

**Khi nào KHÔNG nên dùng `migrate dev` ở production:** Không bao giờ — nó cần shadow database (thường không có quyền tạo DB tạm ở môi trường production) và có thể hỏi tương tác, làm treo pipeline CI.

> 📖 Nguồn: [Prisma — Migrate overview](https://www.prisma.io/docs/orm/prisma-migrate) · [CLI reference](https://www.prisma.io/docs/orm/reference/prisma-cli-reference)

---

### Khái niệm 5: Seed script & idempotency

**Vấn đề nó giải quyết:** Sau `migrate dev`/`migrate reset`, DB rỗng — cần dữ liệu mẫu để test thủ công (Postman) mà không phải tạo tay từng record, và **chạy lại nhiều lần không được nhân đôi dữ liệu**.

- **Cấu hình:** khai `"prisma": { "seed": "ts-node prisma/seed.ts" }` trong `package.json` (repo đã có `ts-node` trong devDependencies từ trước) hoặc trong `prisma.config.ts` ở bản mới hơn. Có cấu hình này thì `migrate dev` và `migrate reset` **tự động chạy seed** sau khi migrate xong; `prisma db seed` chạy seed thủ công bất kỳ lúc nào.
- **Idempotent bằng `upsert`:** với model có field `@unique` tự nhiên (ví dụ `User.email`), dùng `prisma.user.upsert({ where: { email }, update: {}, create: {...} })` — chạy lại bao nhiêu lần cũng chỉ có đúng 1 record cho mỗi email.
- **Model không có unique tự nhiên** (ví dụ `Task`, `Comment` — tiêu đề trùng nhau vẫn hợp lệ về nghiệp vụ): hai lựa chọn, đều phải cân nhắc đánh đổi:
  1. Gán `id` cố định trong seed rồi `upsert` theo `id` — idempotent thật, nhưng id "giả" trộn với id thật do app sinh ra dễ gây nhầm lẫn.
  2. `deleteMany()` toàn bộ bảng trước khi `createMany()` lại — đơn giản, an toàn cho seed chỉ chạy ở dev, nhưng **không phải idempotent theo nghĩa chặt** (là "reset rồi tạo lại", không phải "bỏ qua nếu đã có") và tuyệt đối không được chạy ở production.

**Cách Nest làm:** Không liên quan tới NestJS — seed là tính năng của Prisma CLI, độc lập với ứng dụng Nest.

**Khi nào KHÔNG nên seed bằng `deleteMany` + `createMany`:** Khi seed script có khả năng chạy nhầm vào DB có dữ liệu thật (production/staging) — lúc đó bắt buộc dùng `upsert` theo unique field, không xoá gì cả.

> 📖 Nguồn: [Prisma — Seeding](https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding)

---

### Khái niệm 6: Quan hệ đổi DTO/service ra sao

**Vấn đề nó giải quyết:** Khi `Task` có thêm `projectId`/`assigneeId`, `TasksService` hiện tại (flat, L07) không còn đủ — cần biết 2 kỹ thuật mới của Prisma Client khi làm việc với quan hệ.

- **Ghi dữ liệu có quan hệ — `connect` vs nested `create`:**
  - `connect`: gắn vào record **đã tồn tại**, ví dụ tạo `Task` mới cho một `Project` có sẵn: `prisma.task.create({ data: { title, project: { connect: { id: projectId } } } })`.
  - Nested `create`: tạo record cha và con **cùng lúc**, ví dụ tạo `Project` kèm luôn `ProjectMember` đầu tiên (owner): `data: { name, owner: { connect: { id: ownerId } }, members: { create: [{ userId: ownerId, role: 'OWNER' }] } }`.
- **Đọc dữ liệu có quan hệ — `include` / `select`:** `prisma.project.findUnique({ where: { id }, include: { tasks: true, members: { include: { user: true } } } })` — Prisma dịch thành JOIN (hoặc nhiều query gộp, tuỳ engine), **tránh được N+1** miễn là dùng `include`/`select` thay vì tự vòng lặp gọi `findUnique` cho từng task.
- **Tác động tới DTO:** nếu API cho phép tạo `Project` kèm danh sách member ngay trong 1 request, `CreateProjectDto` cần nested DTO (`@ValidateNested()` + `@Type(() => AddMemberDto)` từ `class-validator`/`class-transformer`) để validate từng phần tử mảng.

**Khi nào KHÔNG nên dùng nested write/nested DTO:** Với người mới, nested write dễ làm DTO phình to và validate phức tạp không cần thiết. MVP nên tách endpoint riêng theo resource (`POST /projects` rồi `POST /projects/:id/members`) — mỗi endpoint một trách nhiệm, dễ test, dễ validate — chỉ gộp nested write khi có lý do UX rõ ràng (ví dụ form tạo project 1 bước).

> 📖 Nguồn: [Prisma Client — Relation queries](https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries) · [NestJS — Prisma recipe](https://docs.nestjs.com/recipes/prisma)

---

## 🔗 Liên hệ kiến thức cũ

| Kiến thức đã có                                                                                            | Tương ứng trong NestJS + Prisma                                                                                                                     | Khác nhau ở đâu                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Express + Prisma: quan hệ khai trong `schema.prisma`, gọi `prisma.model.include` thẳng trong route handler | Vẫn cùng một `schema.prisma`, cùng API `include`/`connect` — Prisma không đổi theo framework                                                        | Khác ở **chỗ** query relation sống: route handler (Express) → `*.service.ts` (Nest). Controller Nest chỉ gọi service, không tự query Prisma — giữ business logic ngoài controller. |
| Sequelize/TypeORM: khai quan hệ qua decorator (`@ManyToMany`, `@HasMany`) đặt trên entity class            | Prisma khai quan hệ trong file `schema.prisma` riêng, không phải decorator trên class TS                                                            | Prisma tách schema khỏi code TypeScript hoàn toàn — schema là nguồn chân lý, `PrismaClient` là code **sinh ra** từ schema, không viết tay entity class.                            |
| Raw SQL: tự viết `JOIN` để lấy Task kèm Project/Comment                                                    | `include`/`select` trong Prisma Client                                                                                                              | Prisma sinh JOIN/nhiều query tối ưu thay bạn — nhưng vẫn phải tự chọn đúng field cần (`select`) để tránh over-fetching, y hệt lỗi `SELECT *` trong raw SQL.                        |
| Hexagonal: repository trả về domain entity, không lộ chi tiết ORM ra ngoài lớp domain                      | `include`/`select` shape của Prisma Client **là chi tiết infrastructure** — không nên trả thẳng ra controller/response DTO mà không qua một lớp map | Ở Phase 5+ (OpenAPI/serialization), sẽ cần response DTO tách khỏi Prisma model — L08 mới dừng ở tầng schema, chưa tới bước đó.                                                     |

**Điều tôi từng hiểu sai:** _(để trống — đây là phần Hien Duong tự viết sau khi làm hands-on NES-91, không phải phần agent điền)._

---

## 💻 Ví dụ có giải thích

> ⚠️ Toàn bộ code trong mục này là **minh hoạ cho việc học, CHƯA áp dụng vào repo**. `prisma/schema.prisma` thật hiện chỉ có model `Task` phẳng. Việc tạo các file dưới đây là phần việc của NES-91 (hands-on, Hien Duong tự làm).

### Ví dụ 1: Schema quan hệ đầy đủ cho Task Management API

```prisma
// file minh hoạ: prisma/schema.prisma (CHƯA áp dụng)

enum ProjectRole {
  OWNER
  MEMBER
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
}

model User {
  id          Int            @id @default(autoincrement())
  email       String         @unique
  name        String
  password    String
  ownedProjects   Project[]      @relation("ProjectOwner")
  memberships     ProjectMember[]
  assignedTasks   Task[]         @relation("TaskAssignee")
  comments        Comment[]
  createdAt   DateTime       @default(now())
}

model Project {
  id          Int             @id @default(autoincrement())
  name        String
  description String?
  owner       User            @relation("ProjectOwner", fields: [ownerId], references: [id], onDelete: Restrict)
  ownerId     Int
  members     ProjectMember[]
  tasks       Task[]
  createdAt   DateTime        @default(now())
}

// Explicit m-n: cần field phụ "role" nên không dùng implicit m-n
model ProjectMember {
  project   Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId Int
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    Int
  role      ProjectRole @default(MEMBER)
  joinedAt  DateTime    @default(now())

  @@id([projectId, userId])
}

model Task {
  id          Int          @id @default(autoincrement())
  title       String
  description String?
  status      TaskStatus   @default(TODO)
  priority    TaskPriority @default(MEDIUM)
  dueDate     DateTime?
  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId   Int
  assignee    User?        @relation("TaskAssignee", fields: [assigneeId], references: [id], onDelete: SetNull)
  assigneeId  Int?
  comments    Comment[]
  createdAt   DateTime     @default(now())
}

model Comment {
  id        Int      @id @default(autoincrement())
  content   String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  taskId    Int
  author    User     @relation(fields: [authorId], references: [id], onDelete: Restrict)
  authorId  Int
  createdAt DateTime @default(now())
}
```

**Giải thích:**

- `Project.owner` dùng `onDelete: Restrict` (Khái niệm 3): không cho xoá `User` nếu họ còn sở hữu `Project` — bắt buộc phải chuyển quyền sở hữu hoặc xoá project trước.
- `ProjectMember` là explicit m-n (Khái niệm 2) vì cần lưu `role`; `@@id([projectId, userId])` làm khoá chính kép, đảm bảo một user không join một project hai lần.
- `ProjectMember.project`/`.user` dùng `Cascade`: xoá `Project` hay xoá `User` thì dòng thành viên tương ứng cũng biến mất — hợp lý vì `ProjectMember` không có ý nghĩa gì nếu thiếu 1 trong 2 phía.
- `Task.assignee` là optional (`User?`) với `SetNull`: xoá người được giao không xoá `Task`, chỉ bỏ trống người giao (Khái niệm 3).
- `Task.project` là bắt buộc (`Project`, không phải `Project?`) với `Cascade`: `Task` không có nghĩa nếu thiếu `Project`.
- `Comment.author` dùng `Restrict` thay vì `Cascade` — quyết định có chủ đích: giữ lại lịch sử comment kể cả khi tài khoản tác giả bị vô hiệu hoá là hành vi phổ biến của app quản lý công việc thật; đây là điểm nên hỏi lại ở NES-93 (xem Quiz câu 4).
- Hai relation trỏ cùng model `User` từ `Project` và `Task` (`owner` và `assignee`) cần **tên quan hệ tường minh** (`@relation("ProjectOwner", ...)`, `@relation("TaskAssignee", ...)`) vì Prisma không tự đoán được field nào ở `User` khớp với field nào — thiếu tên này Prisma sẽ báo lỗi ambiguous relation.

> 📖 Dựa trên: [Prisma — Relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations), domain lấy từ mô tả Task Management API ở đầu `docs/ROADMAP.md`

### Ví dụ 2: Seed script idempotent

```ts
// file minh hoạ: prisma/seed.ts (CHƯA tồn tại trong repo)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      email: 'owner@example.com',
      name: 'Project Owner',
      password: 'seed-only-not-real-hash',
    },
  });

  const project = await prisma.project.upsert({
    where: { id: 1 }, // Project chưa có unique tự nhiên ngoài id trong bản minh hoạ này
    update: {},
    create: {
      id: 1,
      name: 'Demo Project',
      ownerId: owner.id,
      members: { create: [{ userId: owner.id, role: 'OWNER' }] },
    },
  });

  console.log({ owner: owner.email, project: project.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Giải thích:**

- `user.upsert` theo `email` (unique thật) — idempotent đúng nghĩa.
- `project.upsert` theo `id` cố định là đánh đổi đã nói ở Khái niệm 5 (Project chưa có field unique tự nhiên trong thiết kế minh hoạ này) — chạy lại nhiều lần không tạo project trùng, nhưng id "1" là giả định, cần cẩn thận nếu app thật cũng cho user tạo project với id tự tăng từ 1.
- Nested `create` cho `members` chỉ chạy nhánh `create`, không chạy khi `project` đã tồn tại (nhánh `update: {}`) — nghĩa là seed lần 2 sẽ **không** thêm lại `ProjectMember`, đúng ý đồ idempotent.

> 📖 Dựa trên: [Prisma — Seeding](https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding)

---

## 🛠 Hands-on

<!-- BẠN tự code phần này (NES-91). Agent không làm hộ — theo đúng ngoại lệ: live ticket L08 không có execution-substitute authorization. -->

**Yêu cầu (theo NES-9 / NES-91):**

1. Mở `prisma/schema.prisma`, thêm đủ 4 model `User`, `Project`, `ProjectMember`, `Task`, `Comment` (có thể dùng Ví dụ 1 ở trên làm điểm tham chiếu, nhưng nên tự gõ lại, không copy-paste, để nhớ cú pháp `@relation`).
2. Chạy `pnpm exec prisma migrate dev --name add-user-project-task-comment-relations` — đọc kỹ output: Prisma có hỏi gì không, migration file sinh ra ở đâu, tên file là gì.
3. Viết `prisma/seed.ts`, cấu hình `"prisma": { "seed": "ts-node prisma/seed.ts" }` trong `package.json`, chạy `pnpm exec prisma db seed` — rồi chạy lại **lần hai** để tự kiểm chứng không có dữ liệu trùng.

**Cách kiểm tra:**

```bash
docker compose up -d               # cần Postgres sống — chưa từng verify được ở L07, xem callout ROADMAP L07
pnpm exec prisma migrate status
pnpm exec prisma studio            # xem dữ liệu vừa migrate/seed trực quan
```

**Vướng ở đâu, gỡ thế nào:**

- Nếu `prisma migrate dev` báo drift/hỏi reset DB: đọc kỹ message trước khi đồng ý — reset sẽ **xoá sạch dữ liệu dev hiện có**.
- Nếu seed không tự chạy sau `migrate dev`: kiểm tra lại đã khai đúng key `"prisma": { "seed": ... }` trong `package.json` chưa (không phải trong `dependencies`/`devDependencies`).
- Nếu gặp lỗi ambiguous relation (Prisma đòi tên `@relation("...")`) khi 2 field cùng trỏ 1 model: xem lại phần "Giải thích" ở Ví dụ 1 — đây là lỗi rất hay gặp khi có 2 quan hệ tới cùng `User`.

---

## ✅ Ôn tập & Quiz

<!-- Điền sau bước /lesson-review (NES-93). CHƯA có câu trả lời nào ở đây — đúng theo yêu cầu: không được claim quiz đã hoàn thành. -->

1. **Hỏi:** Vì sao `Project.tasks` (kiểu `Task[]`) không cần `@relation(fields: ...)` trong khi `Task.project` (kiểu `Project`) thì cần?
   **Trả lời:** _(chưa trả lời — làm ở NES-93)_

2. **Hỏi:** Nếu đổi `ProjectMember` từ explicit m-n sang implicit m-n (`members User[]` / `projects Project[]` trực tiếp), bạn sẽ mất khả năng làm gì?
   **Trả lời:** _(chưa trả lời — làm ở NES-93)_

3. **Hỏi:** Vì sao `pnpm exec prisma migrate deploy` không hỏi xác nhận gì trong khi `migrate dev` thì có?
   **Trả lời:** _(chưa trả lời — làm ở NES-93)_

4. **Hỏi:** Ví dụ 1 chọn `Restrict` cho `Comment.author` thay vì `Cascade`. Nếu đổi sang `Cascade`, hệ quả nghiệp vụ là gì? Bạn nghĩ lựa chọn nào đúng cho app quản lý công việc thật?
   **Trả lời:** _(chưa trả lời — làm ở NES-93)_

5. **Hỏi:** Seed script trong Ví dụ 2 dùng `upsert` theo `id` cố định cho `Project`. Nêu một cách khác để làm idempotent mà không cần id giả định trước.
   **Trả lời:** _(chưa trả lời — làm ở NES-93)_

**Ôn lại lesson trước:** L07 đã bọc `PrismaClient` thành `PrismaService` (provider quản lý lifecycle qua `OnModuleInit`); L08 dùng lại chính `PrismaService` đó, chỉ thêm quan hệ vào schema — không cần đổi cách khởi tạo Prisma.

---

## 🧠 Điểm cần nhớ

1. Relation field (ảo) và relation scalar field (cột FK thật) là hai thứ khác nhau — `@relation(fields, references)` luôn đặt ở bên giữ FK thật.
2. 1-1 cần `@unique` trên FK để phân biệt với 1-n; m-n implicit chỉ dùng được khi quan hệ không cần field phụ.
3. `onDelete` mặc định: `SetNull` cho quan hệ optional, `Restrict` cho quan hệ bắt buộc — đổi mặc định là một quyết định nghiệp vụ, không phải chi tiết kỹ thuật.
4. `migrate dev` (dev, shadow DB, có thể hỏi) khác `migrate deploy` (CI/prod, chỉ áp file có sẵn, không hỏi) — không bao giờ chạy `migrate dev` ở production.
5. Seed idempotent = `upsert` theo field `@unique` tự nhiên; thiếu field đó thì phải chọn có ý thức giữa id cố định hay `deleteMany` + tạo lại.
6. `include`/`select` thay cho vòng lặp gọi query — đây là cách Prisma tránh N+1 khi đọc dữ liệu có quan hệ.

---

## 📎 Nguồn

- [docs.nestjs.com/recipes/prisma](https://docs.nestjs.com/recipes/prisma)
- [Prisma — Relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations)
- [Prisma — Many-to-many relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/many-to-many-relations)
- [Prisma — Referential actions](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/referential-actions)
- [Prisma — Migrate overview](https://www.prisma.io/docs/orm/prisma-migrate)
- [Prisma — CLI reference](https://www.prisma.io/docs/orm/reference/prisma-cli-reference)
- [Prisma — Seeding](https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding)
- [Prisma — Relation queries](https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries)
