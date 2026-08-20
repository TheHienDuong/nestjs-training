# 🤖 AGENT MODEL — Mô hình nhiều agent phối hợp

> Repo này cố tình dùng **nhiều AI agent với vai trò tách bạch**, thay vì một agent làm tất cả.
> Đây không phải để "cho vui": tách vai là cách duy nhất giữ được giá trị học tập và giá trị review.

## Nguyên tắc gốc

> **Không agent nào vừa viết code vừa tự review code của chính nó.**

Lý do giống hệt lý do team thật không cho tác giả tự approve PR của mình: người vừa viết ra một giải pháp đã "cam kết" với giả định của nó rồi, nên rất khó nhìn ra lỗ hổng trong chính giả định đó. Với AI, hiệu ứng còn mạnh hơn — model sẽ có xu hướng bảo vệ output nó vừa sinh ra.

Nguyên tắc thứ hai, quan trọng với người học:

> **Agent không làm hộ phần hands-on.** Nếu AI viết code thay bạn, cái duy nhất được huấn luyện là AI.

---

## Phân vai

Chỉ **2 vai**, không phải một danh sách tool cố định. Vai "Coder" **linh hoạt** — tool nào lấp vai đó cũng theo đúng một khuôn, không cần luật riêng cho từng tool. Bạn dùng chủ yếu codex; thỉnh thoảng đổi hoặc thêm tool khác chỉ cần đổi tên trong lệnh, không phải học lại quy tắc.

### 🎓 Claude Code — Mentor · PM · Reviewer local (cố định)

| Làm                                                                | Không làm                                             |
| ------------------------------------------------------------------ | ----------------------------------------------------- |
| Tạo & chia task trên Linear, viết description đầy đủ               | Viết code hands-on thay bạn                           |
| Giảng bài, đọc docs mới nhất, cho ví dụ, liên hệ kiến thức cũ      | Tự review code do chính nó sinh ra                    |
| Quiz kiểm tra hiểu (review học tập)                                | Merge PR thay bạn — **chỉ user được merge**           |
| **Review mã của Coder agent trước merge (review local)**           | Viết code/test trong `src/`, `test/` thay Coder agent |
| Viết lesson note, ADR, sinh/cập nhật SPEC.md, đồng bộ Notion/Slack |                                                       |

**Review local là trách nhiệm của Claude Code** — khi Coder agent (codex) mở PR, Claude Code review mã đó trước khi user quyết định merge. Coder agent **không** tự review PR (kể cả của chính nó hay của người khác) — đúng nguyên tắc gốc §đầu: không agent nào vừa viết vừa tự review code mình, và reviewer không được trùng với author.

**Vì sao vai này cố định ở Claude:** context window lớn giúp nó nắm được cả roadmap + toàn bộ note + lịch sử học của bạn cùng lúc — đúng thứ một người thầy cần. Vai PM cũng cần **một** nơi ghi trạng thái duy nhất (xem mục MCP bên dưới) — cố định một agent giữ vai này là điều kiện để tránh xung đột, không phải sở thích.

### 🔎 Copilot CLI — Reviewer code lớp 1 (tự động trên GitHub)

Chạy tự động, **1 lần**, ngay sau khi PR mở — không chạy ngầm, không daemon. Không merge. Đây là **lớp review tự động trên GitHub**; còn **review local** (đọc/review mã của Coder agent trước khi merge) là trách nhiệm của **Claude Code** ở trên.

### 🧑‍💻 User (Hien Duong, `@TheHienDuong`) — Lead reviewer + merge

Review lại code sau Claude Code review local + Copilot CLI, quyết định cuối cùng có merge hay không. **Chỉ user được merge** — không agent nào merge, kể cả khi được giao quyền rộng.

### ⚙️ Coder — vai linh hoạt, giao cho tool nào cũng theo cùng một khuôn

Nhận issue có nhãn `agent:codex` (hoặc nhãn tương ứng nếu bạn giao cho tool khác). **`SPEC.md` sinh ra từ description Linear chính là spec** — spec mơ hồ thì output mơ hồ, đó cũng là bài học về cách viết ticket tốt.

Quy tắc — áp dụng cho **bất kỳ tool nào** đang giữ vai Coder, không riêng codex:

- Làm trên **branch riêng**, đặt tên `<tên tool>/nes-XX-...` (`codex/...`, `opencode/...`, hay tên tool khác) — không bao giờ commit thẳng vào branch lesson `hien/...` của bạn
- Đọc `AGENTS.md` (hợp đồng chung) + `docs/lessons/XX-*/SPEC.md` (spec của đúng lesson) trước khi làm
- Output **luôn đi qua PR** — Claude Code review local → Copilot CLI review (lớp 1, tự động) → user lead review — không merge thẳng, không agent nào merge
- ⛔ **KHÔNG review code/PR** — vai Coder chỉ **code**; không review (kể cả PR mình vừa tạo hay PR của người khác). Reviewer local là Claude Code, reviewer cuối là user.

**Dùng chủ yếu:** codex — công cụ mặc định cho vai Coder.

```bash
git checkout -b codex/nes-12-reference-solution
codex "Đọc AGENTS.md trước. Implement theo spec trong docs/lessons/02-controllers/SPEC.md.
       Chỉ sửa file trong src/. Không sửa docs/ và .github/."
```

**Dùng thỉnh thoảng (không bắt buộc):** khi muốn thêm một góc nhìn để đối chiếu, giao **cùng một `SPEC.md`** cho tool khác (opencode, hoặc bất kỳ CLI agent nào bạn có sẵn) trên branch riêng của tool đó — quy tắc ở trên áp dụng y hệt, không cần tài liệu riêng cho từng tool. Mục tiêu không phải tìm "tool nào giỏi hơn" mà nhận ra: cùng một spec có thể sinh nhiều thiết kế hợp lệ, và **bạn** là người quyết định chọn cái nào.

**Cách dùng có ích nhất khi học:** bạn tự làm hands-on trước, _xong xuôi rồi_ mới xem "lời giải tham chiếu" của Coder agent và so sánh. Khác biệt giữa hai bản là bài học đắt giá nhất trong lesson đó.

---

## MCP: Linear mở cho coder agent, Notion/Slack/Postman chỉ Claude Code nối vào

**Nguyên tắc: Claude Code là single-writer cho Notion/Slack/Postman; Linear mở cho cả Claude (PM) và coder agent.** Coder agent (codex) được cấu hình Linear MCP để tự đọc/tạo/track task của chính mình. Vai Coder — bất kể tool nào đang giữ vai đó — vẫn **không** cấu hình MCP tới Notion/Slack/Postman, dù về mặt kỹ thuật nhiều CLI agent (codex, opencode...) đều hỗ trợ tự thêm MCP server riêng qua file config của chính nó.

Lý do và các phương án đã cân nhắc: xem [ADR-0004](../adr/0004-mcp-single-writer-cho-coder-agent.md) (đã amend). Tóm tắt: nhiều agent cùng ghi vào Notion/Slack tạo race condition thật (Slack nhận thông báo trùng, Notion bị ghi đè) — đúng vấn đề "nhiều nguồn sự thật" mà [ADR-0002](../adr/0002-linear-lam-nguon-su-that.md) đã né ở tầng hệ thống, giờ né tiếp ở tầng agent. Với Linear, ranh giới không còn giữ bằng "một agent duy nhất được nối MCP" mà bằng quy tắc: coder không đụng issue thuộc vòng review/PM của Claude (không tự đổi trạng thái issue do Claude tạo/đang xử lý).

| Vai              | Nối Linear/Notion/Slack/Postman?                         | Cách nhận spec                                                      |
| ---------------- | -------------------------------------------------------- | ------------------------------------------------------------------- |
| Claude Code (PM) | Có — Linear + Notion/Slack/Postman                       | Đọc thẳng issue qua Linear MCP                                      |
| Coder (codex)    | Linear: Có (task của mình) — Notion/Slack/Postman: Không | SPEC.md cho task học; tự đọc/tạo/track task của mình qua Linear MCP |

### SPEC.md là gì

Ở bước `/lesson-start`, Claude Code copy nguyên description của issue Linear thành `docs/lessons/XX-ten-lesson/SPEC.md`. Đây là **bản chiếu tại một thời điểm** — giống vai trò `ROADMAP.md` với Linear — không phải nguồn sự thật. Nếu issue đổi sau đó, chỉ Claude Code được cập nhật lại file; Coder agent không tự sửa.

---

## Cheatsheet: giao việc cho Coder

Một khuôn duy nhất, đổi tên tool tùy bạn dùng gì hôm đó. Luôn checkout branch riêng trước, không bao giờ làm trên branch `hien/...` của bạn:

```bash
# Mặc định: codex
git checkout -b codex/nes-12-reference-solution
codex "Đọc AGENTS.md và docs/lessons/02-controllers/SPEC.md trước.
       Implement theo spec. Chỉ sửa file trong src/ và test/."

# Muốn thêm góc nhìn đối chứng: đổi branch prefix + lệnh gọi tool khác, quy tắc y hệt
git checkout -b opencode/nes-12-alt-solution
opencode run "Đọc AGENTS.md và docs/lessons/02-controllers/SPEC.md trước.
              Implement theo spec. Chỉ sửa file trong src/ và test/."
```

Sau đó luôn mở PR riêng cho mỗi branch — Claude Code review local → Copilot CLI review (lớp 1, tự động) → user lead review + merge — không merge thẳng, không gộp chung PR với branch hands-on của bạn.

---

## Ngữ cảnh dùng chung

Nhiều agent chỉ hợp tác được khi cùng đọc một nguồn ngữ cảnh:

| Nguồn           | Vai trò                                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`AGENTS.md`** | Hợp đồng chung. Mọi agent phải đọc trước khi làm. Chuẩn mở, được codex/opencode/Claude cùng hỗ trợ.                                                     |
| **`CLAUDE.md`** | Chỉ dẫn riêng cho Claude Code (workflow, ranh giới vai trò).                                                                                            |
| **`docs/`**     | Ngữ cảnh dài hạn: roadmap, workflow, ADR, lesson notes.                                                                                                 |
| **serena MCP**  | Điều hướng code theo **symbol** thay vì đọc cả file — tìm định nghĩa, tìm nơi tham chiếu. Tiết kiệm context và chính xác hơn grep khi codebase lớn dần. |
| **`/graphify`** | Dựng knowledge graph từ notes + code. Bật khi qua Phase 3, lúc số note đã đủ nhiều để "hỏi xuyên tài liệu" có ý nghĩa.                                  |

## Ranh giới file (tránh agent giẫm chân nhau)

| Đường dẫn                                       | Ai được sửa                                                        |
| ----------------------------------------------- | ------------------------------------------------------------------ |
| `src/**`, `test/**`                             | Bạn (hands-on) · Coder agent (khi được giao rõ ràng, branch riêng) |
| `docs/lessons/**/SPEC.md`                       | Chỉ Claude (bản chiếu từ Linear) — Coder agent chỉ đọc, không sửa  |
| `docs/lessons/**`                               | Claude (soạn) + bạn (bổ sung ghi chú cá nhân)                      |
| `docs/adr/**`, `docs/workflow/**`               | Claude, kèm bạn duyệt qua PR                                       |
| `.github/**`, `.husky/**`, `docker-compose.yml` | Claude                                                             |
| `AGENTS.md`, `CLAUDE.md`                        | Claude, kèm bạn duyệt qua PR                                       |

## Nhật ký thử nghiệm agent

Mỗi lần giao việc cho một agent, ghi lại một dòng vào `docs/lessons/_agent-log.md`: task gì, agent nào, kết quả tốt/xấu ở điểm nào. Sau khóa học bạn sẽ có dữ liệu thật để trả lời câu hỏi rất thực tế trong nghề: **việc nào nên giao cho AI, việc nào không.**

Mọi agent khi thay đổi docs phải cập nhật cả 2 bản vi/en (`main` tiếng Việt, `example/nestjs-training` tiếng Anh) — xem [bilingual-policy.md](../bilingual-policy.md). Riêng GitLab chỉ nhận bản EN từ `example/nestjs-training`, không nhận bản tiếng Việt.
