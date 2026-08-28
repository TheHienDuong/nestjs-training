# 📐 L03 — Providers & Dependency Injection — Agent Vari Và Song Song Hóa

> **Hermes:** plan-phân-vai cho lesson L03 (WORKFLOW 6 bước). Không execute — bản đồ khoanh vai + thứ tự để phân chia agent hiệu quả nhất.

**Goal:** Hoàn thành lesson L03 (Providers & DI, Phase 1) qua đúng 6 bước WORKFLOW, phân vai rõ ràng, tận dụng tối đa song song, không xung đột file, giữ gate `@hienduong-agilityio` + `pnpm verify` + bilingual.

**Bản chất L03 (ĐÃ XÁC MINH QUA LINEAR — NES-4):** lesson là **hands-on**, label `hands-on` + `phase-1`. Yêu cầu thật từ issue NES-4: "Learn IoC + constructor-based DI; implement an `@Injectable()` service with singleton provider scope; move task business logic into `TasksService` while keeping the controller thin". Tức **user (bạn) tự refactor**: đưa logic task vào `TasksService` `@Injectable()` (singleton) + inject vào `TasksController`, controller chỉ còn HTTP. Lý thuyết (IoC, custom providers, injection scopes) là phần teach của Claude; code reference của codex là bản so sánh sau khi user tự làm.

**Dữ liệu Linear thật (codex resolve 2026-08-21):**

- **NES-4** · status `Todo` · assignee Hien Duong
- Branch Linear auto: **`duongthehien2001/nes-4-l03-providers-dependency-injection`**
- Docs: `/providers` · `/fundamentals/custom-providers` · `/fundamentals/injection-scopes`

**Docs gốc:** `/providers` · `/fundamentals/custom-providers` · `/fundamentals/injection-scopes` (đọc bản mới trên web, không học file cache — WORKFLOW).

---

## 🎭 Bản đồ vai trò (đúng AGENT-MODEL + `.hermes.md` routing)

| Vai / Agent | Pane           | Việc trong L03                                                            | File sở hữu (KHÔNG ai đụng trùng)                       |
| ----------- | -------------- | ------------------------------------------------------------------------- | ------------------------------------------------------- |
| **Claude**  | w5:p1 (idle✅) | Mentor/PM: lesson-start, teach, lesson-review, sync-progress, SPEC writer | `docs/lessons/03-providers/**` · ROADMAP · Notion/Slack |
| **codex**   | w1:p2 (idle✅) | Coder: reference solution providers demo (comment giảng dạy, EN)          | `src/providers/**` (`*.ts` + spec)                      |
| **agy**     | w1:p4 (idle✅) | (TUỲ CHỌN) counter-view note — **docs-only**, KHÔNG đụng `src/`           | `docs/lessons/03-providers/` (1 note riêng)             |
| **Copilot** | —              | Layer-1 review tự động từng PR                                            | —                                                       |
| **User**    | —              | Lead reviewer + merge (chỉ user merge)                                    | —                                                       |
| **Hermes**  | —              | Dispatch, verify, EN→GitLab sync, agent-log, theo dõi                     | GitLab EN mirror · `_agent-log.md`                      |

> ⚠️ **Quyết định then chốt tránh xung đột:** codex sở hữu `src/providers/`, agy (nếu dùng) sở hữu **note docs-only** — KHÔNG để 2 agent cùng ghi `src/` (lesson-file-split rule). Vì L03 code nhỏ + theory, agy chỉ thêm giá trị nếu user muốn 1 góc nhìn viết — nếu không, **bỏ agy ở L03 cho gọn** (khuyến nghị mặc định).

---

## 🧱 Deliverable của L03 (cần phân cho ai)

| #   | Artifact                                                                                                                                       | Owner                                                     | Đi qua PR?                                 |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------ |
| 1   | `docs/lessons/03-providers/SPEC.md` (snapshot NES-4)                                                                                           | Claude                                                    | kèm PR docs VN                             |
| 2   | `docs/lessons/03-providers/README.md` (VN, full note)                                                                                          | Claude                                                    | PR docs VN                                 |
| 3   | **Hands-on của user**: move logic task → `TasksService` `@Injectable()` singleton + inject vào `TasksController`, controller thin              | **User (KHÔNG agent nào code)**, Claude chỉ gợi ý/chỉ lỗi | branch lesson `duongthehien2001/nes-4-...` |
| 4   | Reference code codex (bản so sánh SAU user tự làm): `TasksService` + `TasksController` DI, custom/factory provider demo, kèm `*.spec.ts` (TDD) | codex                                                     | PR code `codex/nes-4-...`                  |
| 5   | EN mirror README (chỉ dịch text, giữ cấu trúc)                                                                                                 | codex/agy                                                 | PR docs EN                                 |
| 6   | ROADMAP L03 → ✅ + Notion + Slack digest                                                                                                       | Claude (`/sync-progress`)                                 | PR docs                                    |
| 7   | GitLab EN sync (author `hienduong-agility`, 0 VN)                                                                                              | Hermes                                                    | — (push thẳng)                             |
| 8   | agent-log rows                                                                                                                                 | Hermes                                                    | PR docs                                    |

---

## 🧭 Thứ tự & song song hóa (5 wave)

### Wave 0 — Kickoff (BẮT BUỘC, tuần tự)

**Claude `/lesson-start NES-4`** (pane w5:p1, mentor) — **đã có NES-4 + description từ codex, không cần Claude đọc Linear**:

1. Dùng dữ liệu: branch Linear thật `duongthehien2001/nes-4-l03-providers-dependency-injection`, description NES-4 (IoC + @Injectable singleton + move logic task + thin controller, labels hands-on/phase-1)
2. Tạo branch `duongthehien2001/nes-4-l03-providers-dependency-injection` + `docs/lessons/03-providers/README.md` (skeleton từ `docs/templates/lesson-note.md`) + `SPEC.md` (snapshot mô tả NES-4, header comment như L02)
3. Linear status: nếu Claude vẫn không có Linear MCP → **codex** cập nhật NES-4 → In Progress (ADR-0004 amended cho phép coder track task) HOẶC để Todo, cập nhật sau
4. Commit/push branch lesson; báo `git rev-parse HEAD` + các file tạo

> ⚠️ **Gate:** MỌI thứ (teach, code, hands-on của user) phụ thuộc branch + SPEC tồn tại. Xong Wave 0 mới unlock Wave 1. Hermes verify: `git branch --show-current` = `duongthehien2001/nes-4-...` + tồn tại 2 file.

### Wave 1 — SONG SONG (sau khi SPEC & branch tồn tại)

| Công việc              | Agent  | Branch                           | Note                                                                                                                                                                                        |
| ---------------------- | ------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1a. Teach**          | Claude | `duongthehien2001/nes-4-...`     | Viết phần lý thuyết README VN: IoC, DI constructor, `@Injectable` singleton, custom providers (useValue/useClass/useFactory), injection scopes; examples có comment; quiz 3–5 câu cuối      |
| **1b. Reference code** | codex  | `codex/nes-4-reference-solution` | Đọc SPEC NES-4 → refactor `TasksService` `@Injectable()` singleton + inject vào `TasksController` (controller thin), custom/factory provider demo, kèm `*.spec.ts` (TDD, comment giảng dạy) |
| **1c. (BỎ)**           | agy    | —                                | User đã chọn bỏ agy L03                                                                                                                                                                     |

> **Hiệu quả:** 1a (docs, Claude) + 1b (src/tasks, codex — khác thư mục) chạy song song. codex đọc SPEC NES-4 để code đúng yêu cầu thật, không phải chờ teach xong.

### Wave 2 — HANDS-ON CỦA USER (LÀM SAU KHI HỌC LÝ THUYẾT 1a ×ong)

- **User tự refactor** (WORKFLOW step 3): đưa logic task vào `TasksService` `@Injectable()` singleton (có sẵn `src/tasks/tasks.service.ts` từ L02 — bổ sung/hiệu chỉnh), inject qua constructor vào `TasksController`, controller chỉ còn HTTP.
- **Claude KHÔNG code thay** — chỉ gợi ý, chỉ lỗi, hỏi ngược. Chưa đọc codex reference (đề phòng quá trình tự làm bị định hướng).
- Verify hands-on: `pnpm test` + `pnpm start:dev` + test API qua Postman.

### Wave 3 — EN mirror + mở PR (sau 1a+1b + hands-on user xong)

- **2a. EN README:** dispatch codex (hoặc agy) dịch README VN → EN trong clone EN branch. **Rule cứng:** chỉ dịch text, giữ nguyên code/logic/cấu trúc/bảng; không prettier lại; scan VN = 0.
- **2b. Mở 2 PR riêng** (ADR-0005):
  - **PR-A (docs VN):** branch lesson → main. `Fixes NES-XX`, `Co-authored-by: Hermes <model> <hermes-agent[bot]@…>`.
  - **PR-B (code):** `codex/nes-XX-reference-solution` → main. Body `Fixes NES-XX` + trailer.
  - **PR-C (docs EN):** EN mirror → main (qua contoh `example` → main? — theo pattern L02: EN mirror merge riêng).
- **2c.** Hermes verify từng PR: đọc toàn bộ diff + `pnpm verify` + (EN) scan VN 0 + `git diff origin/main origin/example` rỗng ngoài ngôn ngữ.

### Wave 4 — Review gate (KHÔNG merge)

- Copilot CLI layer-1: tự động chạy sau khi mỗi PR mở (không daemon).
- Claude Code: review local (như tiền lệ L02, pane w5:p1).
- **User (Hien Duong):** lead review cuối + **merge duy nhất user**. Hermes KHÔNG đề xuất/tự merge.

### Wave 5 — Sync & đóng (sau user merge)

1. **Hermes:** sync EN → GitLab `example/nestjs-training` (author `hienduong-agility`, NO trailer, 0 VN) + ghi agent-log rows.
2. **Claude `/sync-progress`:** update ROADMAP (L03 → ✅), Notion hub, Slack digest.
3. **Hermes:** verify board clean (Linear L03 Done tự động qua `Fixes NES-XX`), repo clean → sẵn sàng L04.

---

## ✅ Verification từng bước (Hermes verify độc lập, KHÔNG tin self-report)

| Gate         | Lệnh                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| Wave 0 xong  | `git branch --show-current` = `hien/nes-XX-...`; `test -f docs/lessons/03-providers/{README,SPEC}.md` |
| 1b code xong | `git -C <wt> status/log`; đọc `${diff}`; `pnpm verify` (lint 0, prettier, test, build)                |
| EN clean     | scan ký tự VN = 0 (regex tiếng Việt); `git diff origin/main origin/example` chỉ khác ngôn ngữ         |
| PR ready     | `gh pr checks <n> --watch` xanh; thread comment resolve hết (GraphQL)                                 |
| GitLab       | `git diff origin/example gitlab/example` rỗng; author `hienduong-agility`                             |

---

## ⚠️ Rủi ro / trade-off / quyết định

1. **Agy ở L03?** Khuyến nghị **bỏ** (code nhỏ, theory; tránh tốn 1 worker + rủi ro src clash). Dùng lại ở lesson có code lớn (vd L05 DTO/pipes). → **Quyết định: user chọn.**
2. **EN mirror khi nào?** đúng pattern L02: làm SAU khi README VN gần chốt (Wave 2), tránh dịch lại 2 lần khi teach còn sửa.
3. **L03 không hands-on CRUD** → bước 3 Hands-on là user thử DI thủ công trong `src/providers` của CHÍNH MÌNH; codex chỉ làm branch tham chiếu riêng, không đụng branch lesson của user.
4. **SPEC chỉ Claude viết** (ADR-0004); codex/agy chỉ đọc.
5. **Model = gợi ý**, user chốt model trên CLI khi wrap.

---

## 📋 Checklist "sẵn sàng phân chia"

- [ ] Wave 0: Claude lesson-start L03 xong (branch + SPEC + README skeleton + Linear In Progress) — **fork mọi thứ**
- [ ] Panes idle: claude w5:p1 ✓ · codex w1:p2 ✓ · agy w1:p4 ✓ (đã verify)
- [ ] Quyết định agy: dùng / bỏ
- [ ] Wave 1 song song (1a Claude docs + 1b codex code)
- [ ] Wave 2 EN mirror + 2–3 PR riêng
- [ ] Wave 3 Copilot + Claude review + **user merge**
- [ ] Wave 4 ROADMAP ✅ + GitLab sync + agent-log
