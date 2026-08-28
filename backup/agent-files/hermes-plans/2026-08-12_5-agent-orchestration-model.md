# Plan: Mô hình điều phối 5 agent — AGY · codex · opencode · Claude · Hermes

> **For Hermes:** Plan này định nghĩa QUY TRÌNH ĐIỀU PHỐI CHUẨN của Hermes khi nhận task từ user: phân tích → tìm skill → chọn model → phân chia công việc → verify. Mục tiêu: hiệu quả, không agent nào làm hết mọi thứ, không conflict, không dùng model xịn cho việc tầm thường.

**Goal:** Thiết lập bản đồ năng lực 5 agent + quy trình dispatch chuẩn + ma trận phân công + quy tắc chống conflict — để Hermes điều phối đúng task, đúng skill, đúng model, đúng giá.

---

## Phần 1 — Inventory: 5 agent (dữ liệu đã verify 2026-08-12)

### 1.1 AGY (Antigravity — Google DeepMind)

| Thuộc tính        | Giá trị                                                                                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CLI               | `agy` v1.1.11 (`~/.local/bin/agy`)                                                                                                                        |
| **Models**        | `gemini-3.6-flash-low/medium/high` · `gemini-3.5-flash-*` · `gemini-3.1-pro-*` · `claude-sonnet-4-6` · `claude-opus-4-6-thinking` · `gpt-oss-120b-medium` |
| **Model rẻ nhất** | `gemini-3.6-flash-low` (đã test: trả lời đúng, đọc README OK)                                                                                             |
| **Skills**        | `~/.agents/skills/`: find-skills, github-trending, graphify, hot-topics, learned, parallel-deep-research, pptx, source-command-headroom-verify            |
| **Cách chạy**     | `agy -p "<prompt>" --model <m> --dangerously-skip-permissions` (headless auto-deny tool nếu không có flag)                                                |
| **MCP**           | Chưa xác nhận đầy đủ — coi như KHÔNG có Linear/Notion/Slack                                                                                               |
| **Điểm mạnh**     | Rẻ nhất cho task input-heavy (Gemini Flash), có skills riêng                                                                                              |
| **Hạn chế**       | Cần skip-permissions; chưa verify trong repo sâu                                                                                                          |

### 1.2 codex (OpenAI)

| Thuộc tính    | Giá trị                                                                                                                                |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| CLI           | `codex` 0.147.0                                                                                                                        |
| **Model**     | GPT-5 (mặc định)                                                                                                                       |
| **Skills**    | `~/.codex/skills/`: .system/, hatch-pet/, notion-knowledge-router/ + AGENTS.md (graphify)                                              |
| **Cách chạy** | `codex exec --sandbox read-only "<task>"` (đọc) · `--sandbox danger-full-access` (có commit — bắt buộc vì workspace-write chặn commit) |
| **MCP**       | Không Linear/Notion/Slack                                                                                                              |
| **Điểm mạnh** | Coder mặc định, đã verify: demo L01 8 file + tsc PASS + commit sạch                                                                    |
| **Hạn chế**   | Sandbox workspace-write chặn commit (đã verify 2 lần)                                                                                  |

### 1.3 opencode

| Thuộc tính    | Giá trị                                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------------- |
| CLI           | `opencode` 1.18.16                                                                                       |
| **Models**    | Nhiều: `opencode/mimo-v2.5-free` (**FREE**, đang dùng), `deepseek-v4-flash-free`, `claude-*`, `gpt-*`... |
| **MCP**       | headroom, serena (local) — KHÔNG Linear/Notion/Slack                                                     |
| **Cách chạy** | `opencode run "<task>"`                                                                                  |
| **Điểm mạnh** | Model FREE (mimo-v2.5-free), đọc hiểu tốt, cross-check                                                   |
| **Hạn chế**   | Không MCP PM tools; ít skill trong repo                                                                  |

### 1.4 Claude Code (Anthropic)

| Thuộc tính        | Giá trị                                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| CLI               | `claude` 2.1.228 (Claude Team)                                                                                                                   |
| **Model**         | Sonnet 4.6 (mặc định)                                                                                                                            |
| **Skills repo**   | `.claude/skills/`: lesson-review, lesson-start, sync-progress, teach                                                                             |
| **Skills global** | graphify, learned, pptx + symlink `.agents/skills/*` (find-skills, github-trending, hot-topics, notion-knowledge-router, parallel-deep-research) |
| **MCP**           | ✅ Linear, Notion, Slack, Postman, Canva, Vercel, figma, headroom, serena                                                                        |
| **Chi phí**       | 💰💰💰 Input-heavy (verify: 1 task dịch = 3.27M input tokens) — **org monthly spend limit** đã chặn 2 lần hôm nay                                |
| **Điểm mạnh**     | Mentor/PM/Reviewer duy nhất, MCP đầy đủ, context lớn                                                                                             |
| **Hạn chế**       | Quota hữu hạn — chỉ dùng cho việc KHÔNG THỂ thay thế                                                                                             |

### 1.5 Hermes (Nous Research)

| Thuộc tính    | Giá trị                                                                                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Vai           | **Orchestrator** (cố định) — không viết code hands-on                                                                                                                    |
| **Skills**    | `~/.hermes/skills/` đầy đủ: `nestjs-orchestrator`, `english-repo-mirror`, `claude-code`, `codex`, `opencode`, `plan`, `github-pr-workflow`, `git-remote-state-review`... |
| **Chức năng** | Phân tích task → đề xuất (agent+model+branch+limits) → user duyệt → dispatch → verify độc lập → báo cáo                                                                  |
| **Chi phí**   | 0 (không sinh code)                                                                                                                                                      |

---

## Phần 2 — Quy trình điều phối chuẩn của Hermes (6 bước)

> Khi user đưa task, Hermes LUÔN chạy đúng 6 bước này — không nhảy thẳng vào dispatch.

### Step 0 — Phân tích task (bắt buộc trước mọi thứ)

Trả lời 4 câu hỏi:

1. **Loại task?** (a) Code/implement · (b) Docs/dịch · (c) Giảng/review/quiz · (d) PM tools (Linear/Notion/Slack) · (e) Điều phối/verify
2. **Cần MCP PM tools?** (Linear/Notion/Slack/Postman) → NẾU CÓ = bắt buộc Claude
3. **Độ phức tạp?** Cao (kiến trúc, phán đoán) / Vừa (code theo spec) / Thấp (dịch, docs, demo, soát)
4. **Input-heavy hay output-heavy?** Đọc nhiều-viết ít (dịch/docs) = model rẻ; viết code thật = model xịn

### Step 1 — Tìm skill phù hợp

- Hermes tự load skill của mình: `skill_view(name)` — nestjs-orchestrator (dispatch), english-repo-mirror (bilingual), plan (nếu cần plan), github-pr-workflow (PR)
- Nếu task thuộc skill của agent: yêu cầu agent đọc skill đó trước (vd Claude đọc `.claude/skills/teach` khi `/teach`)
- Nếu task là "research/tổng hợp": AGY có `parallel-deep-research`, `find-skills` → tận dụng

### Step 2 — Chọn model theo nguyên tắc "đủ dùng, rẻ nhất"

| Độ phức tạp                                | Model khuyến nghị                   | Agent              |
| ------------------------------------------ | ----------------------------------- | ------------------ |
| Thấp (dịch, docs nháp, soát, research nhẹ) | Gemini Flash Low / mimo-free        | **AGY / opencode** |
| Vừa (code theo SPEC, demo)                 | GPT-5 (codex) / Gemini Flash Medium | **codex** / AGY    |
| Cao (kiến trúc, refactor phức tạp)         | Sonnet 4.6 / GPT-5                  | Claude / codex     |
| Cực cao (thiết kế, review chiến lược)      | Sonnet 4.6 / Opus                   | Claude             |

**QUY TẮC VÀNG:** task không đòi hỏi → KHÔNG dùng Claude/Opus/GPT-5. Dùng AGY (Gemini Flash) hoặc opencode (free) trước.

### Step 3 — Phân chia công việc (ma trận task → agent)

| #   | Task                                            | Agent chính        | Agent phụ/backup | Lý do                     |
| --- | ----------------------------------------------- | ------------------ | ---------------- | ------------------------- |
| 1   | Giảng dạy `/teach`, quiz                        | **Claude**         | —                | Vai cố định, MCP, context |
| 2   | Review PR chính thức + merge decision           | **Claude**         | User             | ADR-0005                  |
| 3   | Single-writer MCP (Linear/Notion/Slack/Postman) | **Claude**         | —                | ADR-0004                  |
| 4   | Implement code theo SPEC                        | **codex**          | opencode         | Coder mặc định            |
| 5   | Reference solution / demo code                  | **codex**          | AGY              | Verified demo L01         |
| 6   | Cross-check / góc nhìn thứ 2                    | **opencode**       | AGY              | Model free                |
| 7   | Dịch file/docs (input-heavy)                    | **AGY**            | opencode         | Gemini Flash rẻ nhất      |
| 8   | Lesson note nháp, docs ngắn                     | **AGY**            | opencode         | Không cần MCP             |
| 9   | Research / tổng hợp tài liệu                    | **AGY**            | opencode         | Có parallel-deep-research |
| 10  | Soát ADR, review docs nhỏ                       | **opencode**       | AGY              | Free model                |
| 11  | Backup Claude khi hết quota                     | **opencode → AGY** | —                | Sự kiện thực tế hôm nay   |
| 12  | Điều phối, verify, báo cáo                      | **Hermes**         | —                | Vai cố định               |

### Step 4 — Dispatch theo cổng kiểm duyệt (bất biến)

1. Hermes báo trong chat: agent, model, task, branch, workdir, limits (max-turns/budget), cách verify
2. **User duyệt → mới chạy**
3. Branch riêng: `<tool>/nes-XX-...` — không bao giờ trên main/hien
4. Prompt self-contained, scope chính xác, "commit thôi KHÔNG push/PR" khi chưa duyệt
5. Không wrap proxy agent — chạy lệnh đúng như user tự chạy

### Step 5 — Verify độc lập (không tin self-report)

- Claude/codex/opencode/AGY tự báo → Hermes kiểm tra LẠI: git log/status, đọc diff, chạy `pnpm verify`
- Với bilingual: scan VN = 0, diff 2 remote = rỗng, author GitLab = `hienduong-agility`
- Phát hiện lệch → fix hoặc dispatch lại, không coi là xong

---

## Phần 3 — Quy tắc chống conflict (agent giẫm chân nhau)

| Khu vực                                         | Ai được sửa                                                                                |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `src/**`, `test/**`                             | User (hands-on) · 1 Coder agent được giao (branch riêng) — **chỉ 1 agent tại 1 thời điểm** |
| `docs/lessons/**/SPEC.md`                       | Chỉ Claude (snapshot Linear)                                                               |
| `docs/lessons/**`                               | Claude (soạn) + User (ghi chú)                                                             |
| `docs/adr/**`, `docs/workflow/**`               | Claude (qua PR + user duyệt)                                                               |
| `.github/**`, `.husky/**`, `docker-compose.yml` | Claude                                                                                     |
| `AGENTS.md`, `CLAUDE.md`, `.hermes.md`          | Claude + Hermes (quy tắc orchestration), qua PR                                            |
| `demo/**`                                       | Coder agent được giao (codex/AGY/opencode) — branch riêng                                  |
| Linear/Notion/Slack/Postman                     | **CHỈ Claude** (ADR-0004) — agent khác cấm cấu hình MCP                                    |

**Quy tắc 2 agent cùng lúc:**

- 2 agent làm 2 task KHÁC NHAU trên 2 branch khác nhau → OK (vd codex implement + AGY dịch docs)
- 2 agent làm CÙNG 1 task → chỉ khi user muốn cross-check (opencode đối chứng codex) — 2 branch riêng, không gộp
- Cùng sửa 1 file → CẤM (điều phối qua Hermes)

---

## Phần 4 — Chi phí & tiết kiệm token

### Hiểu cơ chế tốn token (đã verify từ session logs)

- Claude Team trả theo gói nhưng org có **monthly spend limit** — bị đốt bởi INPUT tokens (cache read + fresh)
- 1 task dịch 16 file = 3.27M input tokens (tỉ lệ đọc:viết 95:1)
- MCP Linear/Notion/Slack làm system prompt mỗi turn lớn → tốn thêm

### Chiến lược tiết kiệm

1. **Task input-heavy (dịch, docs, soát) → AGY Gemini Flash / opencode free** — KHÔNG dùng Claude
2. Claude chỉ nhận: giảng, review, MCP, quiz, merge decision
3. Prompt ngắn gọn, scope hẹp (tránh "Prompt is too long" + tốn tokens)
4. Review PR lớn: chia nhỏ — `--from-pr N --output-format json --allowedTools "Read,Bash(git *)"` thay vì print mode dài
5. Không chạy lại agent từ đầu khi cạn turns — dispatch lượt 2 "tiếp tục, còn N file"
6. Theo dõi spend: nếu Claude bị chặn → chuyển task docs sang opencode/AGY, đợi Claude hồi cho việc MCP

---

## Phần 5 — Cập nhật docs cần làm (sau khi plan được duyệt)

| File                           | Thay đổi                                                                                                 | Bản       |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- | --------- |
| `AGENTS.md`                    | Thêm AGY + opencode backup vào phần agent; nguyên tắc "model rẻ cho task nhẹ"                            | vi + en   |
| `docs/workflow/AGENT-MODEL.md` | Bảng phân vai thêm AGY (Coder phụ/Translator); opencode = backup Claude; ma trận task→agent tóm tắt      | vi + en   |
| `.hermes.md`                   | Quy trình 6 bước (phân tích → skill → model → phân chia → dispatch → verify); chiến lược tiết kiệm token | vi + en   |
| `docs/bilingual-policy.md`     | Ghi chú: agent rẻ chịu trách nhiệm dịch (AGY/opencode)                                                   | vi + en   |
| `docs/lessons/_agent-log.md`   | Ghi dòng: test 5 agent + quyết định phân vai                                                             | main (vi) |

Sau khi sửa docs → sync EN sang example → PR → merge → push GitLab (author `hienduong-agility`).

---

## Verification (sau khi hoàn tất)

```bash
pnpm verify                                    # gate chuẩn
git diff origin/example/nestjs-training gitlab/example/nestjs-training  # rỗng
python3 scan VN trên example                   # 0 file
# Test nhanh phân vai mới:
agy -p "tóm tắt README" --model gemini-3.6-flash-low --dangerously-skip-permissions   # rẻ, chạy được
opencode run "cross-check: ..."                                                       # free
```

## Rủi ro / Câu hỏi mở

1. **AGY chưa verify sâu trong repo** (mới test 2 lần đọc). Đề xuất: 1 task dịch nhỏ thử trước khi giao việc chính thức.
2. **AGY có skill nào cho NestJS không?** Không — chỉ global skills. Với task repo, AGY đọc AGENTS.md + docs như agent khác.
3. **opencode model free có ổn cho code không?** Chưa verify code nghiêm túc — nên giới hạn opencode ở docs/review/cross-check, code chính vẫn codex.
4. **5 agent có quá nhiều?** Không — mỗi agent 1 vai tách bạch; số lượng không tạo conflict, conflict chỉ đến từ chạm cùng file (đã chặn ở Phần 3).
5. **Khi nào dùng AGY vs opencode?** AGY = task input-heavy cần đọc nhiều (dịch, research) vì Gemini Flash nhanh+rẻ; opencode = cross-check, review nhẹ (free model, đã quen repo).

---

## Kết luận

Mô hình 5 agent với vai tách bạch: **Claude** (Mentor/MCP/review — quota quý) · **codex** (Coder chính) · **opencode** (cross-check + backup docs) · **AGY** (task rẻ input-heavy: dịch/docs/research) · **Hermes** (điều phối + verify). Quy trình 6 bước đảm bảo mọi task: phân tích → đúng skill → đúng model (rẻ nhất đủ dùng) → phân chia không conflict → dispatch qua cổng duyệt → verify độc lập.
