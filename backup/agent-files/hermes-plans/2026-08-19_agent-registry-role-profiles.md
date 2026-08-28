# Plan: Agent Registry cho Hermes+herdr — Role Profile + "Agent Card" (v3 — ground-truth)

> **📂 File:** `/Users/hienduong/Documents/HienDuong/nodejs-training/nestjs-example/.hermes/plans/2026-08-19_agent-registry-role-profiles.md`
> **📖 Xem:** `glow ~/Documents/HienDuong/nodejs-training/nestjs-example/.hermes/plans/2026-08-19_agent-registry-role-profiles.md`
> **📚 Mọi plan:** `glow ~/Documents/HienDuong/nodejs-training/nestjs-example/.hermes/plans/`

> **For Hermes:** plan cần user duyệt trước khi thực thi. **Mọi claim đã đối chiếu CLI thật + source** (không suy đoán). Ưu tiên cao nhất: **KHÔNG phá cái đang chạy ổn** — dữ liệu hiện trạng xác minh thật, thay đổi theo lộ trình không phá hỏng.

---

## 0. HIỆN TRẠNG XÁC MINH (bằng chứng — nền của plan)

| #   | Sự thật                                                                                                                                                                                                                                  | Nguồn                                                                                               |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| A   | **Hermes NGUỒN KHÔNG có tích hợp herdr** (grep "herdr" trong *.py ≈ 0) → herdr là công cụ NGOÀI, Hermes điều khiển bằng gọi CLI `herdr ...` trong terminal                                                                               | grep -rln herdr --include=*.py                                                                      |
| B   | **Kanban spawn worker NỀN detached**: `subprocess.Popen(stdin=DEVNULL, start_new_session=True)` — không TTY/pane/tmux                                                                                                                    | kanban_db.py:10200-10209; gateway/kanban_watchers.py:1024,1062 (dispatch_in_gateway=True, tick 60s) |
| C   | **Root `auto_decompose: true`** → LLM tự chia task + tự launch (≤3/tick), KHÔNG cần user bấm; gateway ĐANG chạy PID 1452; **54 worker log đã tồn tại**; maintainer ghi "launched destructive tasks while the user was still typing"      | ~/.hermes/config.yaml:139; kanban_watchers.py:1382-1385; ls ~/.hermes/kanban/logs                   |
| D   | Worker kanban bị gắn `HERMES_SESSION_SOURCE=kanban` → **lọc khỏi session browser** (user không thấy)                                                                                                                                     | kanban_db.py:10066-10073                                                                            |
| E   | **describe = tín hiệu routing THẬT**: decomposer chạy LLM match task ↔ description từng profile để chọn assignee                                                                                                                         | kanban_decompose.py:87-89, 217-239; `profile create --description` help                             |
| F   | `--clone-from` copy config/.env/SOUL/skills, **KHÔNG memory**; chỉ `--clone-all` kéo memory                                                                                                                                              | `hermes profile create --help`                                                                      |
| G   | `hermes role` **KHÔNG tồn tại** — `hermes role --help` rơi vào usage                                                                                                                                                                     | CLI thật                                                                                            |
| H   | `terminal.cwd: "."` ở **cả 7 profile** — không profile nào pin repo path                                                                                                                                                                 | các profile */config.yaml                                                                           |
| I   | **MEMORY.md byte-identical ở 7 profile + root** (md5 56667e03...) — "memory riêng theo vai" CHƯA tồn tại; chỉ ~1/7 entry (~22%) liên quan NestJS                                                                                         | md5 + đọc MEMORY.md                                                                                 |
| J   | _*.hermes/* bị gitignore_* (chỉ .hermes/README.md track) → plan & card KHÔNG qua PR                                                                                                                                                      | .gitignore:9                                                                                        |
| K   | **Main clone đang dirty**: AGENTS.md sửa + `.github/codex/` + `codex-review.yml` chưa commit → hạ tầng Codex review đang dựng dở                                                                                                         | git status                                                                                          |
| L   | **headroom KHÔNG hỗ trợ agy** (claude/codex/copilot/vscode/aider/opencode/cline... có; agy KHÔNG)                                                                                                                                        | headroom wrap --help/list                                                                           |
| M   | **Skill tham chiếu gãy**: herdr-orchestration, lesson-file-mapping, kanban-worker-headroom-exec chỉ ở root ~/.hermes/skills/, profile không load — trong khi nestjs-orchestrator (có ở mọi profile) gọi "load skill herdr-orchestration" | ls ~/.hermes/skills vs profiles                                                                     |
| N   | **coder-fast trùng coder-codex** (cùng deepseek-v4-pro, cùng wrap codex, cùng description) → routing LLM không phân biệt                                                                                                                 | profile cấu hình + describe                                                                         |

**Nguyên tắc đúng với hiện trạng (rút từ bằng chứng):**

- "Không chạy agent nền" KHÔNG phải là tuyên bố — phải là **việc làm để TẮT/khoanh cơ chế B** (auto_decompose + dispatcher) đang bật.
- Hermes không "mở pane" bằng source; Hermes **đưa lệnh → user tự mở pane + wrap -- trong herdr** → Hermes discover (`herdr agent list`) + dispatch (`herdr agent prompt`).
- Memory "riêng theo vai" **phải dựng mới** (hiện là bản copy dùng chung).

---

## Goal (ưu tiên: không phá cái đang chạy ổn)

1. **Tắt/khoanh cơ chế spawn agent nền** (kanban auto-decompose + dispatcher detached) — không để agent chạy ẩn không ai thấy.
2. Mọi agent thực thi chạy trong **herdr pane user thấy + tự `headroom wrap <tool>`** (trừ agy — xem L).
3. **Model = SUGGESTION** (Hermes gợi ý), **user chốt trên CLI**.
4. Đổi agent (hết limit) **GIỮ memory vai** → chỉ sửa Agent Card (điều phối), không đụng memory học tập.
5. **Nguồn thật hành vi vai = `CLAUDE.md`(Claude)/`AGENTS.md`(Codex) trong repo** — Agent Card KHÔNG lưu hành vi.

---

## KỸ THUẬT (đúng CLI thật — đã hiệu chỉnh theo findings)

| Việc                           | Cách thật                                                                                                                          | Lưu ý (không vấp)                                                                                       |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Vai = profile                  | `hermes profile create nestjs-review --clone-from reviewer-copilot`                                                                | `--clone-from` KHÔNG kéo memory (F); `--clone-all` mới kéo — **đừng dùng clone-all** để tránh rác       |
| Model do user chốt             | `hermes model` / `hermes -m MODEL --provider P -p <vai>`                                                                           | đổi model không chạm memory                                                                             |
| Agent Card (điều phối)         | memory entry trong `~/.hermes/profiles/<vai>/memories/MEMORY.md`, khối có delimiter `<!-- agent-card -->…<!-- /agent-card -->`     | KHÔNG nhét vào `profile describe` (E: describe là routing)                                              |
| Routing (kanban chọn assignee) | `hermes profile describe <vai> --text "<mô tả năng lực vai>"`                                                                      | describe **CHỈ** mô tả năng lực, không chứa status/swap_log                                             |
| Swap command                   | **skill/wrapper tạo ra** (không phải built-in): skill `hermes-role-swap` gọi qua chat, hoặc wrapper `hermes profile alias` đăng ký | **`hermes role set` KHÔNG tồn tại sẵn (G)** — tài liệu rõ đây là skill tự tạo                           |
| Task/điều phối                 | `hermes kanban …`                                                                                                                  | (nếu giữ) — nhưng phải TẮT auto_decompose (C) trước                                                     |
| Thực thi CLI thật + wrap       | User gõ `headroom wrap <tool> -- …` trong pane; Hermes chỉ hiển thị lệnh gợi ý + verify                                            | `herdr agent start --kind <tool>` **BYPASS wrap (4)** — cấm dùng để launch worker; agy KO wrap được (L) |
| Verify wrap                    | `env` có `OPENAI_BASE_URL`+`HEADROOM_PORT` (qua `herdr agent read`)                                                                | —                                                                                                       |
| Verify cwd                     | pane đứng đúng project root (có CLAUDE.md/AGENTS.md) trước khi wrap-check                                                          | H: mọi profile cwd "." — phải đặt đúng                                                                  |
| User quan sát                  | herdr pane + `hermes dashboard`                                                                                                    | dashboard xem memory/profile; herdr pane cho thực thi                                                   |

---

## Thiết kế

### 1. Role Profiles (per project) — ngữ nghĩa ĐÚNG hiện trạng

- `~/.hermes/profiles/nestjs-mentor|coder|review|devops/` — dùng `--clone-from` (KHÔNG `--clone-all`) để KHÔNG kéo rác memory (F-I).
- **Memory per vai PHẢI dựng mới** (hiện memory là bản copy chung I): Task 2 **tay chép vài dòng NestJS liên quan** từ MEMORY.md cũ vào profile mới — ngược với ý "clone-rồi-prune".
- `hermes profile describe <vai> --text "<mô tả năng lực để kanban route>"` — mô tả ngắn, không chứa state.

### 2. Agent Card — chỉ điều phối, sống trong MEMORY.md (khối delimiter riêng)

```markdown
<!-- agent-card -->

role: review
project: nestjs
current_agent: copilot # claude|codex|agy|copilot
suggested_model: gpt-4.1-mini # Hermes gợi ý
current_model: <user chốt>
plan: GitHub Copilot
status: out-of-limit # ok|out-of-limit|swapped
swapped_to: <agent/model>:<ngày>
swap_log: [...]
<!-- /agent-card -->
```

- **KHÔNG chứa** language/capabilities/prompt_style/best_for — hành vi đọc từ `CLAUDE.md`/`AGENTS.md` tại lúc build prompt.
- **KHÔNG** nhét vào `hermes profile describe` (E) — describe chỉ routing.

### 3. Swap — skill `hermes-role-swap` (skill-tạo, không built-in)

- Cú pháp dùng (do skill định nghĩa — tài liệu rõ KHÔNG phải lệnh built-in): `hermes role set nestjs-review --agent codex --model luna`
- Thao tác: **tìm-và-thay khối `<!-- agent-card -->…<!-- /agent-card -->`** trong MEMORY.md (không đụng memory học tập khác) + `profile describe` (nếu đổi năng lực/routing) + (tùy) per-profile model. Verify: đọc lại card đúng, memory khác nguyên.

### 4. Luồng dispatch qua herdr — chính xác từng bước

1. Hermes đọc Agent Card vai → đề xuất agent + `suggested_model` → báo user.
2. **Đọc file rule THẬT** `CLAUDE.md`/`AGENTS.md` tại repo → **trích đúng đoạn vào prompt** (không paraphrase từ trí nhớ; kèm bằng chứng đã đọc).
3. Hermes **đưa lệnh gợi ý** để user tự mở pane/worktree + tự gõ `headroom wrap <tool> -- …` (KHÔNG dùng `herdr agent start --kind` — bypass wrap; KHÔNG Hermes tự mở nền).
4. **VERIFY cwd** pane = project root (có file rule) TRƯỚC.
5. **VERIFY wrap**: `env | grep -E 'OPENAI_BASE_URL|HEADROOM_PORT'` (qua `herdr agent read`). Chưa wrap → DỪNG báo user.
6. Dispatch `herdr agent prompt <pane> "<prompt gồm rule thật đã trích>"`. User theo dõi pane.
7. Verify độc lập (git diff RAW + `pnpm verify`) → PR (NES-112). **KHÔNG agent nền** — mọi thứ trong pane user thấy.

### 5. Gợi ý model / chốt

`suggested_model` trong card; user chốt `current_model` qua `hermes model`/`-m`. Đổi model không mất memory.

### 6. User surface

herdr pane (thực thi, user tự wrap) + `hermes dashboard` (memory/profile) + CLI. Hermes hướng dẫn.

### 7. Per-project

Profile prefix project; mỗi project tự quyết role+agent+model. Không lẫn memory.

---

## Tasks (bước nhỏ, an toàn, verify từng bước)

### Task 1 — Audit (read-only, KHÔNG phá gì)

- `hermes profile list/show` từng vai + **đọc `CLAUDE.md`/`AGENTS.md` thật**.
- Ghi: nguồn thật vai nào, rule nào CLAUDE có nhưng AGENTS thiếu (vd "look-before-create"), role nào đang gánh nhiều vai (mentor-claude: Mentor/PM/**Review**), cái nào đang dựng dở (**K: .github/codex + codex-review.yml — KHÔNG đụng**).

### Task 2 — Tạo Role Profiles (nestjs), memory dựng mới

- **Quyết TRƯỚC:** số phận phần "review" trong mentor-claude (tách hẳn? giữ chung?) — tránh 2 agent cùng nhận review.
- `hermes profile create nestjs-* --clone-from <cũ>` (**KHÔNG `--clone-all`** — F) → rồi **tay chép vài dòng NestJS cần thiết** từ MEMORY.md cũ vào `memories/MEMORY.md` mới (I). Verify `hermes profile show` memory sạch, đúng vài dòng liên quan.

### Task 3 — Agent Card (chỉ điều phối) + describe

- Thêm khối `<!-- agent-card -->…<!-- /agent-card -->` vào MEMORY.md từng vai (§2).
- `hermes profile describe <vai> --text "<mô tả năng lực để route>"` (chỉ routing, không chứa state).

### Task 4 — Skill `hermes-role-swap`

- `skill_manage` tạo skill (cú pháp `hermes role set …` do skill định nghĩa — ghi rõ KHÔNG built-in, G). Cập nhật khối card, không đụng memory khác. Verify: set xong card đổi, memory học tập nguyên.

### Task 5 — Đóng khung chạy nền (QUAN TRỌNG, làm cẩn thận)

- **Tắt `auto_decompose` root** (`~/.hermes/config.yaml:139` → false) + cân nhắc `kanban.dispatch_in_gateway: false` + `kanban.failure_limit`.
- **Phải restart gateway** (flag cache lúc boot — note trong bằng chứng A/C) rồi verify `hermes status` + xác nhận không còn worker detached tự sinh.
- Cập nhật SOUL.md worker + skill `herdr-orchestration`/`nestjs-orchestrator`: §4 (verify cwd → verify wrap → prompt), **cấm `herdr agent start --kind`** để launch worker, KHÔNG chạy nền; **agy ngoại lệ không wrap** (L); **skill refs gãy phải sửa** (M: cài herdr-orchestration… vào profile hoặc sửa ref).
- **coder-fast trùng coder-codex** (N): archive/định danh lại để routing không nhầm.

### Task 6 — Dashboard walkthrough

Hướng dẫn user `hermes dashboard`: xem memory/Agent Card/profile, tự can thiệp.

### Task 7 — Migration + TEST SWAP THẬT (copilot hết limit)

- Tách hẳn `nestjs-review` (quyết phần review của mentor-claude) — pilot trên 1 vai này.
- Test: `nestjs-review` `status=out-of-limit` → Hermes gợi ý (vd codex-luna) → **user mở pane + wrap + chốt model** → Hermes verify cwd + verify wrap → dispatch review thật (prompt trích rule thật) → xác nhận memory giữ + agent mới chạy.

## Verify

- `hermes profile list` thấy role-profile per project; `show` thấy Agent Card gọn + describe routing.
- Swap: memory học tập giữ nguyên, agent/model đổi, dispatch qua pane user thấy (cwd đúng + wrap đúng + prompt có rule thật).
- **KHÔNG còn** agent nền tự sinh (auto_decompose off + gateway restart + verify không worker detached mới).

## Risks / open questions

1. Số phận vai "review" trong mentor-claude — cần user chốt trước Task 2.
2. `.hermes/*` gitignored (J) → plan/card không qua PR, không review layer — chấp nhận tạm, hoặc đề xuất sau track registry có review.
3. AGENTS.md thiếu rule vs CLAUDE.md (Task 1) — có bổ sung PR không.
4. Codex review infra đang dựng dở (K) — plan KHÔNG đụng; đánh dấu dependency.
5. Bảng `suggested_model` per vai — user duyệt lần đầu.
6. agy không wrap (L) — ngoại lệ kỹ thuật có chủ đích, ghi rõ.
7. Migration 1 lượt hay pilot 1 vai (khuyến nghị pilot `nestjs-review`).
