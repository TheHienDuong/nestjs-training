# L00 — Setup dự án & quy trình làm việc chuyên nghiệp

|                |                                                     |
| -------------- | --------------------------------------------------- |
| **Phase**      | 0 — Setup & Professional Workflow                   |
| **Linear**     | NES-1                                               |
| **Branch**     | `lesson/00-setup`                                   |
| **Docs chính** | [/first-steps](https://docs.nestjs.com/first-steps) |
| **Ngày học**   | 2026-08-10                                          |

---

## 🎯 Mục tiêu

- [ ] Giải thích được từng công cụ trong repo này **giải quyết vấn đề gì** — không chỉ biết nó tồn tại
- [ ] Chạy được vòng lặp phát triển đầy đủ: sửa code → commit → push → CI → PR → merge
- [ ] Hiểu vì sao có nhiều **hàng rào chất lượng** ở nhiều tầng khác nhau
- [ ] Dựng được PostgreSQL + Redis bằng `docker compose` mà không cài gì vào máy
- [ ] Biết cách tra tài liệu NestJS đúng nguồn (và vì sao Google/trí nhớ AI không đủ)

---

## 📚 Lý thuyết

Lesson này không có khái niệm NestJS nào. Nó trả lời một câu hỏi khác: **một dự án backend thật khác một thư mục chứa code ở chỗ nào?**

Câu trả lời ngắn: ở **những thứ xung quanh code**. Và những thứ đó tồn tại vì mỗi cái đã từng có một sự cố sinh ra nó.

### 1. Vì sao cần một PM tool riêng (Linear), không phải file TODO?

Một file `TODO.md` có ba vấn đề mà bạn chỉ thấy sau vài tuần:

1. **Không có trạng thái đáng tin.** Bạn sửa nó khi nhớ ra, tức là thường không sửa.
2. **Không nối được với code.** Không biết task nào ứng với PR nào.
3. **Không đo được gì.** Không biết một tuần mình làm được bao nhiêu, ước lượng lệch bao nhiêu.

Linear giải quyết cả ba:

| Khái niệm Linear | Trong dự án này                                                |
| ---------------- | -------------------------------------------------------------- |
| **Initiative**   | Cả khoá học "NestJS Mastery"                                   |
| **Project**      | Một phase (Phase 1 — Foundations…)                             |
| **Issue**        | Một lesson, có description đầy đủ + Definition of Done         |
| **Sub-issue**    | Ba bước trong lesson: Theory & note · Hands-on · Review & quiz |
| **Cycle**        | Một tuần học — cho biết **velocity** thật của bạn              |
| **Estimate**     | Điểm ước lượng → so với thực tế để tập ước lượng               |

**Điểm hay nhất, và cũng là bài học nghề:** trạng thái task chuyển động **do sự kiện git**, không do ai bấm tay.

```
Tạo branch  hien/nes-12-controllers   →  issue NES-12 tự sang In Progress
PR có dòng  "Fixes NES-12"  được merge →  issue NES-12 tự sang Done
```

Đây là lý do **tên branch và PR description là dữ liệu, không phải văn bản trang trí**. Đặt tên branch sai thì tự động hoá im lặng ngừng hoạt động — không có thông báo lỗi nào, và đó là kiểu lỗi khó phát hiện nhất.

> 📖 Lý do chọn Linear thay vì Trello / GitHub Projects: [ADR-0002](../../adr/0002-linear-as-source-of-truth.md)

### 2. Vì sao Git chỉ có một nhánh chính (`main`)?

Bạn có thể đã nghe về **Git Flow** với `main` + `develop` + `feature/*` + `release/*`. Repo này cố tình **không** dùng nó.

Chúng ta dùng **trunk-based development**: chỉ `main` là nhánh dài hạn, mỗi lesson một nhánh sống vài ngày rồi biến mất.

Lý do: nhánh sống càng lâu thì càng xa `main`, và merge càng đau. Git Flow sinh ra cho thời phần mềm phát hành theo bản (release 2.1, 2.2…). Đa số web service ngày nay deploy nhiều lần một ngày, nên trunk-based phổ biến hơn.

**Squash and merge** — mỗi lesson để lại đúng một commit trên `main`:

```bash
git log --oneline main
# a1b2c3d docs(lesson-02): controllers và routing
# e4f5g6h docs(lesson-01): cấu trúc project NestJS
# 7h8i9j0 chore: setup workflow, CI, docker và tài liệu học tập
```

`git log` đọc ra chính lộ trình học của bạn. Nếu giữ mọi commit "wip", "fix typo" thì mất tính chất này.

> 📖 [ADR-0003](../../adr/0003-trunk-based-one-lesson-one-pr.md)

### 3. Conventional Commits — vì sao bị chặn khi viết commit message sai?

Thử gõ:

```bash
git commit -m "update code"
# ✖ subject may not be empty / type may not be empty
# husky - commit-msg script failed (code 1)
```

Commit bị **từ chối ngay tại máy**, chưa kịp vào lịch sử git.

Định dạng bắt buộc:

```
<type>(<scope>): <mô tả>

feat(tasks): add CRUD endpoints for tasks
docs(lesson-02): note về controllers và routing
fix(auth): xử lý trường hợp token hết hạn
```

Vì sao ràng buộc chặt:

- **Lịch sử git là tài liệu.** `git log --oneline` đọc được như changelog, không phải một danh sách "update", "fix bug", "asdf".
- **Type cho biết ngay bản chất một commit** mà không cần mở diff. Đi tìm nguyên nhân một bug, `fix:` và `refactor:` là hai loại nghi phạm rất khác nhau.
- **Là tiền đề tự động hoá.** Có type chuẩn thì sau này sinh CHANGELOG và tính semantic version được bằng máy.

Vì sao chặn ở **hook trên máy** thay vì ở CI: message đã push rồi mà muốn sửa thì phải rewrite history — đắt hơn nhiều so với viết đúng ngay lần đầu.

### 4. Bốn tầng hàng rào chất lượng — vì sao không chỉ một?

| Tầng           | Công cụ                           | Chặn gì                            | Mất bao lâu |
| -------------- | --------------------------------- | ---------------------------------- | ----------- |
| 1. Khi commit  | `lint-staged` (hook `pre-commit`) | Code chưa format / lint lỗi        | ~2 giây     |
| 2. Khi commit  | `commitlint` (hook `commit-msg`)  | Commit message sai chuẩn           | ~1 giây     |
| 3. Khi push/PR | GitHub Actions CI                 | Lint, format, test, build fail     | ~2 phút     |
| 4. Khi merge   | Branch protection                 | Push thẳng `main`, merge lúc CI đỏ | tức thì     |

Nguyên tắc đằng sau: **phát hiện lỗi càng sớm càng rẻ.**

Cùng một lỗi thiếu dấu chấm phẩy:

- Bắt ở tầng 1 → mất 2 giây, không ai biết
- Bắt ở tầng 3 → mất 2 phút chờ CI + một commit "fix lint" rác trong lịch sử
- Bắt ở review → mất nửa ngày của người khác
- Bắt ở production → mất một buổi tối của cả team

Đây chính là lý do các team đầu tư vào hook và CI: không phải vì thích quy trình, mà vì **rẻ hơn**.

Hai chi tiết đáng chú ý trong repo này:

- `lint-staged` chỉ chạy trên **file đang staged**, không phải toàn bộ repo. Vì hook chậm là hook sẽ bị bỏ qua bằng `--no-verify` — và một hàng rào bị bỏ qua thì bằng không.
- CI chạy `eslint --max-warnings=0`, nghĩa là **warning cũng làm CI đỏ**. Warning mà không ai sửa sẽ tích tụ thành hàng trăm dòng nhiễu, rồi che mất warning thật sự quan trọng.

> **Một cảnh báo:** `git commit --no-verify` bỏ qua được mọi hook. Đừng dùng nó ở repo này. Cảm giác "bị chặn" chính là phần dạy nhanh nhất.

### 5. CI là gì và vì sao nó quan trọng?

**CI (Continuous Integration)** = mỗi lần push, code được build và test lại trên **một máy sạch hoàn toàn**.

Vấn đề nó giải quyết có tên riêng trong nghề: _**"trên máy tôi vẫn chạy mà"**_. Nguyên nhân thường là một trong ba thứ:

- Bạn có file `.env` mà repo không có
- Bạn cài một package global mà `package.json` không ghi
- Bạn quên commit một file mới

CI chạy trên máy chỉ có đúng những gì có trong git → mọi khác biệt lộ ra ngay.

Đọc `.github/workflows/ci.yml`, chú ý vài chi tiết:

```yaml
- run: pnpm install --frozen-lockfile
```

`--frozen-lockfile` = cài **đúng** theo `pnpm-lock.yaml`, không tự nâng version. Nếu `package.json` và lockfile lệch nhau, job **fail** thay vì âm thầm cài phiên bản khác. Đây là điều bạn muốn: bản chạy trên CI phải giống hệt bản chạy trên máy bạn.

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

Push commit mới vào cùng PR → huỷ lần chạy cũ. Không ai quan tâm kết quả của commit đã bị thay thế.

#### Lần chạy CI đầu tiên của repo này đã ĐỎ — và đó là một bài học

PR đầu tiên fail ngay ở bước thứ hai:

```
Error: No pnpm version specified.
Please specify one of these ways:
  - in GitHub Action config key "version"
  - in package.json key "packageManager"
```

`pnpm/action-setup` **không tự đoán** version pnpm. Nó đọc field `packageManager` trong `package.json` — mà scaffold của `nest new` không sinh ra field đó. Cách sửa:

```json
"packageManager": "pnpm@11.18.0"
```

Điều đáng chú ý: lỗi này **không thể phát hiện ở máy bạn**, vì máy bạn đã có pnpm cài sẵn. Chỉ một môi trường sạch mới lộ ra rằng repo chưa nói cho ai biết nó cần pnpm phiên bản nào.

Đây chính là **giá trị của CI, thể hiện ngay lần chạy đầu**: nó không tìm bug trong logic của bạn, nó tìm những **giả định ngầm** mà bạn không biết mình đang dựa vào.

Field `packageManager` cũng là chuẩn chung của Node.js (Corepack đọc nó), nên thêm vào là ghim luôn version pnpm cho mọi người và mọi máy — cùng mục đích với `--frozen-lockfile`.

### 6. Vì sao chạy database bằng Docker thay vì cài vào máy?

`docker-compose.yml` khai báo hai service: PostgreSQL 16 và Redis 7.

Bốn lý do:

1. **Xoá sạch được.** `docker compose down -v` và máy trở lại như chưa từng có gì.
2. **Version cố định.** Bạn và CI dùng đúng Postgres 16, không phải "bản nào máy tôi có".
3. **Không tranh nhau.** Nhiều project song song, mỗi cái database riêng, không đè nhau.
4. Đây là **cách các team thật dựng môi trường dev**. Người mới vào team chỉ cần `docker compose up`.

Hai chi tiết cố ý trong file:

```yaml
ports:
  - '${POSTGRES_PORT:-5433}:5432'
```

Map ra cổng **5433**, không phải 5432. Nếu máy bạn đã có PostgreSQL nào đang chạy thì nó đang giữ 5432 — và lỗi "port already in use" là lỗi rất hay gặp lúc mới học Docker. Vì thế `DATABASE_URL` trong `.env` phải trỏ tới `5433`.

```yaml
healthcheck:
  test: ['CMD-SHELL', 'pg_isready -U postgres']
```

Healthcheck cho Docker biết container đã **sẵn sàng nhận query**, không chỉ "đã khởi động". Khác biệt này quan trọng: Postgres mất vài giây mới nhận kết nối, và app khởi động trong khoảng đó sẽ chết vì `connection refused`.

### 7. `.env` và `.env.example` — hai file, hai mục đích

| File           | Có trong git? | Vai trò                                              |
| -------------- | ------------- | ---------------------------------------------------- |
| `.env.example` | ✅ có         | **Tài liệu** — liệt kê app cần biến nào, giá trị giả |
| `.env`         | ❌ không      | **Bí mật** — giá trị thật, chỉ tồn tại trên máy bạn  |

```bash
cp .env.example .env   # rồi điền giá trị thật
```

> ⚠️ **Quy tắc vàng:** secret bị commit là secret **đã bị lộ**. Xoá ở commit sau không cứu được — nó vẫn nằm trong lịch sử git và trong mọi bản clone. Cách xử lý đúng là **thu hồi (revoke) secret đó** và tạo cái mới.

Đây là một trong những lỗi bảo mật phổ biến nhất của dev mới. Có cả bot quét GitHub tìm API key bị commit.

### 8. ADR — ghi lại **vì sao**, không chỉ **cái gì**

`docs/adr/` chứa các **Architecture Decision Record**: mỗi file một quyết định kỹ thuật + lý do + các phương án đã loại.

Vì sao cần: câu hỏi khó nhất khi quay lại một codebase sau 6 tháng không phải _"code này làm gì?"_ — đọc code là biết. Câu hỏi khó là _**"tại sao lại làm thế này mà không làm cách kia?"**_

Code chỉ ghi **kết quả** của quyết định. Nó không ghi các phương án đã loại, ràng buộc lúc đó, hay đánh đổi đã chấp nhận. Không có ADR thì người sau (kể cả chính bạn) sẽ đảo ngược một quyết định đúng vì không biết lý do của nó.

Với bạn còn một giá trị riêng: **viết ADR buộc bạn diễn đạt được lý do lựa chọn**. Nếu không viết nổi ADR cho một quyết định, thường là vì bạn chưa thật hiểu tại sao mình chọn nó. Đây là một trong những khác biệt rõ nhất giữa junior và senior — không phải biết nhiều hơn, mà là **biết mình đang đánh đổi cái gì lấy cái gì**.

> 📖 [Cách viết ADR + template](../../adr/README.md)

### 9. Mô hình nhiều agent — vì sao tách vai?

Repo này dùng ba agent với vai khác nhau:

| Agent           | Vai                                      |
| --------------- | ---------------------------------------- |
| **Claude Code** | Mentor · PM · Reviewer                   |
| **codex**       | Coder (nhận issue có nhãn `agent:codex`) |
| **opencode**    | Agent đối chứng, từ Phase 7              |

Hai nguyên tắc:

> **Không agent nào vừa viết code vừa tự review code của chính nó.**

Cùng lý do team thật không cho tác giả tự approve PR của mình: người vừa viết ra một giải pháp đã cam kết với giả định của nó, nên rất khó tự nhìn ra lỗ hổng trong giả định đó.

> **Agent không làm hộ phần hands-on.**

Nếu AI viết code thay bạn, cái duy nhất được huấn luyện là AI. Cách dùng codex có ích nhất: **bạn tự làm xong trước**, rồi mới xem "lời giải tham chiếu" của codex và so sánh. Khác biệt giữa hai bản là bài học đắt giá nhất trong lesson.

> 📖 [AGENT-MODEL.md](../../workflow/AGENT-MODEL.md)

### 10. Tra tài liệu NestJS cho đúng

`docs.nestjs.com` là một **Angular SPA**: nội dung được render bằng JavaScript. Fetch HTML sẽ chỉ ra thẻ `<title>`, không có nội dung. AI nào fetch trang đó rồi "giảng" cho bạn thì đang giảng từ trí nhớ, không phải từ tài liệu.

Nguồn markdown gốc nằm trong repo chính chủ:

```bash
gh api "repos/nestjs/docs.nestjs.com/contents/content/controllers.md" \
  -H "Accept: application/vnd.github.raw"
```

Vài chỗ tên file **lệch** với URL — biết trước để không mất thời gian:

| URL trên web                       | File markdown                                  |
| ---------------------------------- | ---------------------------------------------- |
| `/middleware`                      | `content/middlewares.md`                       |
| `/fundamentals/custom-providers`   | `content/fundamentals/dependency-injection.md` |
| `/fundamentals/injection-scopes`   | `content/fundamentals/provider-scopes.md`      |
| `/techniques/database`             | `content/techniques/sql.md`                    |
| `/security/encryption-and-hashing` | `content/security/encryption-hashing.md`       |
| `/faq/common-errors`               | `content/faq/errors.md`                        |

Và luôn kiểm tra version thật thay vì tin vào ví dụ trên blog:

```bash
npm view @nestjs/config version
```

---

## 🔗 Liên hệ kiến thức cũ

| Ở dự án Express/Prisma trước                  | Ở repo này                                                     | Khác nhau ở đâu                                                                                      |
| --------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Chạy `node index.js` hoặc `nodemon`           | `pnpm start:dev` (`nest start --watch`)                        | Nest CLI lo compile TypeScript + watch, không cần tự cấu hình                                        |
| `npm install`                                 | `pnpm install`                                                 | pnpm dùng hard link nên nhanh và tiết kiệm đĩa; lockfile khác nên **không trộn** hai package manager |
| Cài PostgreSQL trực tiếp vào máy              | `docker compose up -d`                                         | Version cố định, xoá sạch được, giống môi trường CI                                                  |
| Commit trực tiếp vào `main`                   | Branch → PR → CI → squash merge                                | Có chỗ để review; `main` luôn ở trạng thái chạy được                                                 |
| Nhớ trong đầu việc cần làm                    | Linear issue có Definition of Done                             | Trạng thái tự chuyển theo sự kiện git                                                                |
| Prisma dùng như một singleton import khắp nơi | _(L07)_ `PrismaService` là một **provider** trong DI container | Nest quản lý vòng đời — connect/disconnect đúng lúc                                                  |
| Hexagonal: tự tay tách domain khỏi hạ tầng    | Nest có DI container sẵn                                       | Nest **có sẵn** cơ chế đảo ngược phụ thuộc mà bạn từng phải tự dựng                                  |

**Điều đáng suy nghĩ:** khi làm hexagonal với Express, bạn phải tự viết phần "tiêm phụ thuộc" — tự tạo interface cho port, tự dựng adapter, tự nối dây ở entry point. NestJS xây hệ thống đó vào framework. Đến L25 bạn sẽ refactor một module theo ports & adapters và thấy rất rõ: **cái bạn từng làm bằng tay chính là cái `@Module` + `@Injectable` đang làm cho bạn.**

---

## 💻Điểm quan trọng trong repo sau khi setup

```
docs/
  ROADMAP.md              # 8 phase, 26 lesson, link docs từng lesson
  workflow/WORKFLOW.md    # quy trình 6 bước, convention, Definition of Done
  workflow/AGENT-MODEL.md # phân vai Claude / codex / opencode
  adr/                    # 3 ADR + template
  lessons/                # note tiếng Việt từng lesson (file này là L00)
  templates/              # template lesson note + retro
.github/
  workflows/ci.yml        # lint → format → test → build
  pull_request_template.md
  dependabot.yml          # bot tự mở PR nâng dependency mỗi tuần
.claude/skills/           # 4 skill: lesson-start · teach · lesson-review · sync-progress
.husky/
  pre-commit              # lint-staged
  commit-msg              # commitlint
commitlint.config.mjs
docker-compose.yml        # postgres:16 + redis:7 (+ adminer, profile "tools")
.env.example
postman/README.md
AGENTS.md                 # hợp đồng chung cho mọi AI agent
CLAUDE.md                 # chỉ dẫn riêng cho Claude Code
```

### Một sửa đổi nhỏ trong `src/` đáng để ý

CI chạy `eslint --max-warnings=0`, và scaffold gốc của `nest new` có một warning:

```ts
// src/main.ts — trước
bootstrap();

// sau
void bootstrap();
```

`bootstrap()` là hàm `async`, tức là nó trả về một `Promise`. Gọi mà không xử lý Promise đó thì rule `@typescript-eslint/no-floating-promises` cảnh báo: nếu bên trong có lỗi xảy ra, không ai bắt, và Node.js sẽ báo unhandled rejection.

`void` là cách nói với TypeScript: _"tôi biết đây là Promise, và tôi cố ý không chờ nó."_ Ở `bootstrap()` thì hợp lý — đây là điểm khởi động của cả app, không có ai ở trên để `await`.

**Bài học nhỏ nhưng thật:** hàng rào chất lượng vừa bắt được một vấn đề trong code do chính công cụ chính thống sinh ra. Đó là lý do đặt hàng rào.

---

## 🛠 Hands-on

Chạy trọn một vòng workflow để thấy tất cả các mảnh khớp vào nhau.

**1. Dựng môi trường**

```bash
pnpm install                  # husky tự cài git hook qua script "prepare"
cp .env.example .env
docker compose up -d
docker compose ps             # cả hai service phải ở trạng thái (healthy)
```

**2. Chạy app**

```bash
pnpm start:dev
curl http://localhost:3000    # → Hello World!
```

**3. Thử phá hàng rào (làm thật, để thấy nó chặn)**

```bash
# Thử commit message sai chuẩn -> phải BỊ TỪ CHỐI
echo "test" > /tmp/x && git add -A && git commit -m "update stuff"

# Thử commit đúng chuẩn -> phải ĐƯỢC CHẤP NHẬN
git commit -m "chore: thử conventional commit"
```

**4. Chạy đúng những gì CI sẽ chạy** — trước khi push, để không phải chờ mới biết đỏ

```bash
pnpm verify
```

**5. Xem database bằng mắt** (tuỳ chọn)

```bash
docker compose --profile tools up -d
# mở http://localhost:8080
# System: PostgreSQL · Server: postgres · User: postgres · Password: postgres
```

**6. Dọn dẹp**

```bash
docker compose down           # giữ dữ liệu
```

---

## ✅ Ôn tập & Quiz

Trả lời bằng lời của mình, đừng copy lại từ phần trên.

1. **Vì sao commit message bị chặn ở git hook trên máy thay vì để CI kiểm tra?**
   → _(tự trả lời)_

2. **`pnpm install --frozen-lockfile` trên CI khác `pnpm install` ở máy chỗ nào, và vì sao CI cần bản `--frozen-lockfile`?**
   → _(tự trả lời)_

3. **Bạn đổi tên branch từ `hien/nes-12-controllers` thành `feature/controllers` cho "dễ đọc". Chuyện gì sẽ xảy ra, và vì sao nó khó phát hiện?**
   → _(tự trả lời)_

4. **Cùng một lỗi thiếu format, bắt ở `lint-staged` và bắt ở CI khác nhau bao nhiêu về chi phí? Suy ra nguyên tắc gì?**
   → _(tự trả lời)_

5. **`docker-compose.yml` map PostgreSQL ra cổng 5433 thay vì 5432. Vì sao? Nếu bỏ qua chi tiết này thì bạn gặp lỗi gì?**
   → _(tự trả lời)_

6. **Bạn vô tình commit `.env` chứa JWT secret thật, rồi commit tiếp một commit xoá file đó. Secret đã an toàn chưa? Vì sao?**
   → _(tự trả lời)_

**Nối với lesson sau:** L01 sẽ mổ chính 5 file trong `src/` mà `nest new` sinh ra. Trước khi bắt đầu, thử tự đoán: `main.ts` khác `index.js` của một app Express ở chỗ nào?

---

## 🧠 Điểm cần nhớ

1. **Trạng thái task nên chuyển động do sự kiện git, không do bấm tay.** Vì thế tên branch và PR description là dữ liệu, không phải văn bản trang trí.
2. **Phát hiện lỗi càng sớm càng rẻ** — đó là toàn bộ lý do tồn tại của hook, CI và branch protection.
3. **Secret bị commit là secret đã bị lộ.** Không cứu được bằng commit xoá; phải thu hồi và tạo mới.
4. **ADR ghi lại _vì sao_, thứ mà code không bao giờ ghi lại được.** Viết được ADR là dấu hiệu bạn thật hiểu quyết định của mình.
5. **AI không được làm hộ hands-on, và không được tự review code của chính nó.** Cả hai đều để bảo vệ giá trị — một cái là giá trị học tập, một cái là giá trị review.

---

## 📎 Nguồn

- [NestJS — First Steps](https://docs.nestjs.com/first-steps)
- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
- [Trunk Based Development](https://trunkbaseddevelopment.com/)
- [Michael Nygard — Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [GitHub Actions — Workflow syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Docker Compose — Compose file reference](https://docs.docker.com/reference/compose-file/)
- [Linear — GitHub integration](https://linear.app/docs/github)
- [husky](https://typicode.github.io/husky/) · [lint-staged](https://github.com/lint-staged/lint-staged) · [commitlint](https://commitlint.js.org/)
- ADR của repo: [0001 Prisma](../../adr/0001-choose-prisma-as-orm.md) · [0002 Linear](../../adr/0002-linear-as-source-of-truth.md) · [0003 Trunk-based](../../adr/0003-trunk-based-one-lesson-one-pr.md)
