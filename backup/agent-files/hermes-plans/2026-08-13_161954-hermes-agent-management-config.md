# Kế hoạch: Cấu hình quản lý đa tác tử (multi-agent) đúng theo docs Hermes

> **Mục đích:** Cấu hình Hermes (v0.20.0, máy user) để quản lý & giám sát agents đúng theo tài liệu chính thức — gồm 2 luồng: **Subagents** (`delegate_task` + `/agents`) và **Kanban** (profiles + board + dispatcher).
> **Bản chất:** Plan CONFIG hệ thống (chạy `hermes config set` / `hermes profile` / `hermes kanban`) — **không** đụng code repo.
> **Đã xác minh trước khi viết plan:** đối chiếu từng claim trong đoạn text user dán với docs chính thức (hermes-agent.nousresearch.com/docs), source code tại `~/.hermes/hermes-agent/`, và trạng thái thật của máy (CLI `hermes ... --help`, `hermes config get`, `hermes kanban list`).

---

## 0. Bảng xác minh — claim nào ĐÚNG / SAI so với docs thật

| #   | Claim trong đoạn text được dán                                           | Phán quyết                                                            | Bằng chứng                                                                                                                                                                      |
| --- | ------------------------------------------------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `/tasks` là alias của `/agents`, hiển thị agents/tasks đang chạy         | ✅ **ĐÚNG**                                                           | `references/slash-commands.md`: `/agents (/tasks) — Show active agents and running tasks`                                                                                       |
| 2   | `/tasks` trống vì chưa có `delegate_task` nào chạy                       | ✅ **Hợp lý**                                                         | Chỉ hiển thị agents/tasks đang active                                                                                                                                           |
| 3   | Kanban chạy qua `~/.hermes/kanban.db`, không xuất hiện trong `/tasks`    | ✅ **ĐÚNG**                                                           | Docs kanban: "Every task is a row in `~/.hermes/kanban.db`"; db đã tồn tại trên máy (Aug 3)                                                                                     |
| 4   | `delegation.orchestrator_enabled: true` cần bật                          | ✅ **ĐÚNG** — nhưng **đã `true` sẵn**                                 | `hermes config get delegation` → `orchestrator_enabled: true`                                                                                                                   |
| 5   | `max_concurrent_children: 3`                                             | ✅ **ĐÚNG** — đang là 3                                               | `hermes config get delegation`                                                                                                                                                  |
| 6   | `max_spawn_depth: 2`                                                     | ⚠️ Key có thật, **đang là 1** (nesting OFF)                           | `hermes config get delegation` → `max_spawn_depth: 1`                                                                                                                           |
| 7   | `delegation.model` đặt model rẻ cho subagent                             | ✅ **ĐÚNG** — hiện để trống (`model: ''` = thừa hưởng model chính)    | `hermes config get delegation`                                                                                                                                                  |
| 8   | Subagents "hoàn toàn không biết gì" về history chat                      | ✅ **ĐÚNG**                                                           | Docs delegation: _"Subagents Know Nothing... zero knowledge of the parent's conversation"_                                                                                      |
| 9   | Log thô từng subagent: `~/.hermes/cache/delegation/live/<id>/task-0.log` | ✅ **ĐÚNG CHÍNH XÁC**                                                 | `tools/delegate_tool.py:3291`: _"Live transcripts... under `cache/delegation/live/<delegation_id>/task-<n>.log`"_                                                               |
| 10  | `hermes kanban init`                                                     | ✅ **ĐÚNG** — db đã có, lệnh idempotent                               | `hermes kanban --help`                                                                                                                                                          |
| 11  | `hermes profile create coder --clone`                                    | ✅ **ĐÚNG** — `--clone` copy `config.yaml`, `.env`, `SOUL.md`, skills | `hermes profile create --help`                                                                                                                                                  |
| 12  | Sửa `~/.hermes/profiles/<name>/SOUL.md`                                  | ✅ **ĐÚNG** — SOUL.md có thật, seed per-home                          | `hermes_cli/config.py:841`                                                                                                                                                      |
| 13  | `hermes gateway start`; dispatcher chạy trong gateway                    | ✅ **ĐÚNG** — gateway user **đang chạy** (launchd PID 143)            | `hermes gateway status`; docs: `kanban.dispatch_in_gateway: true` (default)                                                                                                     |
| 14  | Dispatcher quét board mỗi 60s                                            | ✅ **ĐÚNG**                                                           | Docs kanban: _"every N seconds (default 60)"_                                                                                                                                   |
| 15  | `hermes kanban create "..." --assignee coder`                            | ✅ **ĐÚNG**                                                           | `hermes kanban create --help` → `--assignee`                                                                                                                                    |
| 16  | `kanban_complete` → **tự động** chuyển cột review + gọi reviewer         | ❌ **SAI**                                                            | Không có cơ chế tự động đó. Có tool/verb riêng: `kanban_request_review` / `request-review` / `promote`. `complete` = chuyển `done`, muốn vào `review` phải gọi `request-review` |
| 17  | `hermes kanban watch` / `hermes kanban tail <id>`                        | ✅ **ĐÚNG**                                                           | `hermes kanban --help` (verbs `watch`, `tail`)                                                                                                                                  |
| 18  | `hermes dashboard` có tab Kanban                                         | ✅ **ĐÚNG**                                                           | Docs kanban-tutorial có dashboard screenshots; `hermes dashboard` là admin panel                                                                                                |
| 19  | `/kanban list`, `/kanban stats` trong chat                               | ✅ **ĐÚNG**                                                           | `references/slash-commands.md`: `/kanban [sub]`                                                                                                                                 |
| 20  | `hermes kanban swarm` — workers song song → verifier → synthesizer       | ✅ **ĐÚNG**                                                           | `hermes kanban swarm --help`: `--worker` (lặp), `--verifier`, `--synthesizer`                                                                                                   |
| 21  | _"Bạn đã cấu hình `final_response_markdown: render` từ lượt trước"_      | ❌ **SAI**                                                            | Key có thật (`display.final_response_markdown`, default `strip`, options `render                                                                                                | strip | raw`—`config_defaults.py:1190`) nhưng **chưa được set** trên máy → vẫn default `strip` |

**Kết luận:** đoạn text dán ~85% đúng, sai 2 điểm quan trọng (#16, #21). Plan dưới đây cấu hình theo **docs thật**, có sửa cả 2 điểm sai.

---

## 1. Hiện trạng thực tế (đã kiểm tra trên máy)

| Hạng mục                          | Trạng thái                                                                                                                        |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Hermes version                    | v0.20.0 (install tại `~/.hermes/hermes-agent/`)                                                                                   |
| `delegation.*`                    | `orchestrator_enabled: true` · `max_concurrent_children: 3` · `max_spawn_depth: 1` · `model: ''` · `subagent_auto_approve: false` |
| `display.final_response_markdown` | Chưa set (default `strip`)                                                                                                        |
| Kanban                            | `~/.hermes/kanban.db` **đã tồn tại**; board `default` **rỗng** (0 task); `.dispatcher.lock` có mặt                                |
| Gateway                           | Đang chạy, supervised bởi launchd (PID 143) → dispatcher kanban đang active                                                       |
| Profiles                          | Chỉ có `default` — **chưa có** coder/reviewer/writer                                                                              |
| Repo nestjs-example               | `.hermes/` đã gitignore (trừ `*.md`) → plan này không làm bẩn git status                                                          |

---

## 2. Kế hoạch từng bước

### Phase A — Tinh chỉnh Delegation (luồng subagents)

#### Task A1: Nâng `max_spawn_depth` (tùy chọn — cần user quyết)

**Objective:** Cho phép subagent-orchestrator tạo subagent cháu (hiện OFF).

- Nếu user muốn nesting 2 cấp:
  ```bash
  hermes config set delegation.max_spawn_depth 2
  ```
- **Verify:** `hermes config get delegation` → `max_spawn_depth: 2`. Effect áp dụng từ session mới (`/reset`), không giữa chừng (bảo toàn prompt caching).
- **Rủi ro:** tốn token hơn; repo rule hiện tại dùng subagent 1 cấp là đủ. **Mặc định đề xuất: GIỮ NGUYÊN 1** — chỉ nâng khi có nhu cầu thật.

#### Task A2: Chọn model rẻ cho subagent (tùy chọn — cần user quyết)

**Objective:** Tiết kiệm chi phí khi chạy nhiều subagents song song (đang thừa hưởng model chính = deepseek-v4-flash).

```bash
hermes config set delegation.model <model-id>     # vd: google/gemini-2.5-flash
hermes config set delegation.provider <provider>  # nếu model không cùng provider
```

- **Verify:** `hermes config get delegation` → `model` có giá trị.
- **Open question:** user chọn model nào? (xem `hermes model` catalog). Mặc định đề xuất: **để trống** (thừa hưởng model chính) trừ khi user muốn rẻ hơn.

#### Task A3: Test live `/agents` với 1 lần delegate thật

**Objective:** Chứng minh luồng subagent + cách giám sát.

1. Trong 1 session, yêu cầu Hermes: _"Gọi `delegate_task` với 2 subagents song song: (a) liệt kê cấu trúc thư mục `src/`, (b) tóm tắt `package.json`. Rồi tổng hợp."_
2. Ngay lập tức gõ `/agents` (alias `/tasks`) → thấy cây agents đang chạy.
3. Mở terminal thứ 2, soi log thô:
   ```bash
   ls ~/.hermes/cache/delegation/live/                       # tìm <delegation_id>
   tail -f ~/.hermes/cache/delegation/live/<id>/task-0.log   # theo từng task
   ```
4. **Verify:** `/agents` hiển thị agents, rồi tự biến mất khi xong; log có nội dung từng bước.

---

### Phase B — Tạo Profiles chuyên vai (nền tảng cho Kanban)

> Lưu ý: `--clone` copy cả `.env` (secrets) + skills từ profile đang active → các profile mới có cùng API keys. Điều này OK cho máy cá nhân, nhưng **không** push/export các profile này ra ngoài.

#### Task B1: Tạo profile `coder`

```bash
hermes profile create coder --clone --description "Coder: implement code sạch, đúng SPEC, commit Conventional Commits, chạy pnpm verify trước khi báo xong"
```

- **Verify:** `hermes profile list` → có `coder`; `ls ~/.hermes/profiles/coder/` → `config.yaml`, `.env`, `SOUL.md`, `skills/`.

#### Task B2: Tạo profile `reviewer`

```bash
hermes profile create reviewer --clone --description "Reviewer: rà soát diff, bắt lỗi security/logic/style, kiểm tra tiêu chuẩn markdown, không tự sửa code"
```

- **Verify:** như B1.

#### Task B3: Tạo profile `writer` (cho bước swarm)

```bash
hermes profile create writer --clone --description "Writer: tổng hợp kết quả nhiều nguồn thành tài liệu tiếng Việt rõ ràng, đúng cấu trúc"
```

- **Verify:** như B1.

#### Task B4: Cá nhân hóa SOUL.md từng profile (tùy chọn)

- Sửa bằng editor của user (Hermes không tự sửa file profile nếu chưa được yêu cầu):
  ```bash
  code ~/.hermes/profiles/coder/SOUL.md      # ghi rõ vai trò, quy tắc, giới hạn
  code ~/.hermes/profiles/reviewer/SOUL.md
  code ~/.hermes/profiles/writer/SOUL.md
  ```
- **Verify:** `hermes profile show coder` hiển thị description; SOUL.md có nội dung riêng.
- **Open question:** user muốn tự viết SOUL.md hay để Hermes soạn nháp rồi user duyệt?

---

### Phase C — Vận hành Kanban board

#### Task C1: Đảm bảo board sẵn sàng (idempotent)

```bash
hermes kanban init
hermes kanban boards     # kỳ vọng: ● default (empty)
```

- Đã có db → lệnh chỉ xác nhận, không mất dữ liệu.

#### Task C2: Task thử đầu tiên (smoke test dispatcher + worker)

```bash
hermes kanban create "Viết unit test cho auth module (SMOKE TEST)" \
  --assignee coder \
  --body "Task thử nghiệm luồng kanban. Chỉ cần tạo 1 file spec mẫu rồi kanban_complete."
```

- **Verify dispatcher tự động nhặt:** trong ~60s, `hermes kanban list` → task chuyển `ready` → `running` → `done` (worker là profile `coder` chạy độc lập, có `HERMES_KANBAN_TASK` + toolset `kanban_*`).
- Theo dõi: `hermes kanban watch` (terminal 2) hoặc `hermes kanban tail <task_id>`.

#### Task C3: Đúng quy trình review (sửa điểm sai #16)

- Không có chuyển `review` tự động. Quy trình đúng:
  1. Worker coder xong → gọi **`kanban_complete(artifacts=[...])`** (hoặc CLI `hermes kanban complete <id>`) → task về `done`.
  2. Muốn review → tạo task mới hoặc dùng **`hermes kanban request-review <id> --assignee reviewer`** (tương đương tool `kanban_request_review`) → task chuyển `review`.
  3. Reviewer chấp nhận → `hermes kanban promote <id>`; không đạt → `hermes kanban request-changes <id>`.
- **Verify:** trạng thái `review` xuất hiện trong `hermes kanban list`; thread comment lưu lại toàn bộ trao đổi.

#### Task C4: Slash command trong chat

- Trong bất kỳ session nào: `/kanban list`, `/kanban stats`, `/kanban show <id>`.
- **Verify:** hiển thị đúng dữ liệu board (không bị chặn bởi Running-Agent Guard).

---

### Phase D — Monitoring & hiển thị

#### Task D1: Bật `final_response_markdown: render` (sửa điểm sai #21)

```bash
hermes config set display.final_response_markdown render
```

- **Verify:** `hermes config get display` → `final_response_markdown: render`. Bảng `/kanban list`, cây `/agents` hiển thị markdown đẹp trong TUI.
- **Rollback:** `hermes config set display.final_response_markdown strip`.

#### Task D2: Dashboard web

```bash
hermes dashboard
```

- Mở tab **Kanban** → kéo thả card, WebSocket real-time (theo docs kanban-tutorial).
- **Lưu ý:** dashboard đằng sau cổng OAuth/token — đăng nhập bằng account Nous Portal.

#### Task D3: Bảng log tổng hợp

| Cái gì                        | Ở đâu                                                          |
| ----------------------------- | -------------------------------------------------------------- |
| Live transcript từng subagent | `~/.hermes/cache/delegation/live/<delegation_id>/task-<n>.log` |
| Subagent timeout dump         | `~/.hermes/logs/subagent-<sid>-<ts>.log`                       |
| Gateway & error logs          | `~/.hermes/logs/`                                              |
| Kanban SQLite                 | `~/.hermes/kanban.db`                                          |

---

### Phase E — (Tùy chọn) Demo Swarm Topology

```bash
hermes kanban swarm "Tổng hợp bài học NestJS L01 thành note tiếng Việt" \
  --worker coder:Phân tích cấu trúc project hiện tại \
  --worker coder:Phân tích bootstrap (main.ts, AppModule) \
  --worker coder:Liệt kê các lệnh pnpm test/lint/build \
  --verifier reviewer \
  --synthesizer writer
```

- Tạo đồ thị: 3 worker song song (`todo`) → verifier (`review`) → synthesizer (`done`), kèm dependency links.
- **Verify:** `hermes kanban list` thấy 5 card; dispatcher tự promote `todo→ready` khi đủ parent `done`; `hermes kanban show <root_id>` thấy cây phụ thuộc.

---

## 3. Validation checklist (chạy sau khi thực thi xong)

- [ ] `hermes config get delegation` → giá trị đúng ý định (A1/A2)
- [ ] `/agents` hiển thị subagents khi chạy `delegate_task` (A3)
- [ ] `hermes profile list` → `coder`, `reviewer`, `writer` tồn tại (B)
- [ ] Smoke test kanban: task `triage→todo→ready→running→done` trong ~60s (C2)
- [ ] `request-review` đưa task sang `review`, `promote` về `done` (C3)
- [ ] `/kanban list` hoạt động trong chat (C4)
- [ ] `display.final_response_markdown = render` (D1)
- [ ] Dashboard mở được, tab Kanban hiển thị board (D2)
- [ ] (Nếu chạy E) 5 card swarm đúng cấu trúc worker×3 → verifier → synthesizer

## 4. Rủi ro & quyết định cần user

| Vấn đề                                       | Ảnh hưởng                                  | Đề xuất                                                     |
| -------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------- |
| Nâng `max_spawn_depth` lên 2                 | Tốn token, phức tạp hơn                    | **Giữ 1** trừ khi có nhu cầu thật                           |
| Đặt `delegation.model` rẻ hơn                | Subagent kém chất lượng hơn model chính    | **Để trống** (thừa hưởng) trước, thử sau                    |
| Profiles clone copy `.env` (secrets)         | Các profile cùng API keys                  | OK máy cá nhân; không export profiles                       |
| Task kanban chạy profile → tiêu token riêng  | Mỗi worker là 1 phiên Hermes đầy đủ        | Giới hạn bằng `--max-runtime`/`--max-retries` nếu cần       |
| Dispatcher đang chạy trong gateway (launchd) | Config đổi cần session mới mới có hiệu lực | Sau mỗi lần `config set`, mở session mới (`/reset`) để test |

## 5. Files bị đổi (ngoài repo)

- `~/.hermes/config.yaml` — chỉ qua `hermes config set` (KHÔNG hand-edit — skill hermes-agent invariant)
- `~/.hermes/profiles/{coder,reviewer,writer}/` — tạo mới qua `hermes profile create`
- `~/.hermes/kanban.db` — dữ liệu task
- Không đụng file nào trong repo nestjs-example

## 6. Rollback

```bash
hermes config set delegation.max_spawn_depth 1      # nếu đã nâng
hermes config set display.final_response_markdown strip
hermes profile delete coder && hermes profile delete reviewer && hermes profile delete writer
hermes kanban archive <task_id>                      # hoặc block
```

---

## 7. Kết quả thực thi — session Hermes #1 (đã verify)

> ⚠️ **Lưu ý:** user chạy SONG SONG một session Hermes khác thực thi cùng plan này (xem section 8). Hai session hội tụ về cùng trạng thái cuối; mọi khác biệt đã hòa giải bên dưới.

| Phase    | Kết quả                                                                                                                                                                                                          | Bằng chứng                                                                      |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| A1       | ✅ `delegation.max_spawn_depth = 2`                                                                                                                                                                              | `hermes config get delegation`                                                  |
| A2       | ✅ `delegation.model = kimi-k2.7-code` (chốt cuối — user test 4/4 model OK qua `hermes chat -Q -m` rồi chọn; session #1 ban đầu set `deepseek-v4-flash`)                                                         | `hermes config get delegation`                                                  |
| B1-B3    | ✅ Profiles `coder` / `reviewer` / `writer` (clone từ default, có description cho kanban decomposer)                                                                                                             | `hermes profile list`                                                           |
| B-models | ✅ coder=`deepseek-v4-pro` · reviewer=`glm-5.2` · writer=`deepseek-v4-flash` (opencode-go)                                                                                                                       | `hermes profile list`                                                           |
| C1       | ✅ `kanban init` idempotent, board `default` sẵn sàng                                                                                                                                                            | `hermes kanban boards`                                                          |
| C2       | ✅ Smoke test `t_07702242`: ready→running→done (~20s mỗi phase, dispatcher nhặt <60s); artifact `hello.txt` (20B) ở durable storage                                                                              | `hermes kanban attachments t_07702242`; worker session `20260813_163344_39d0c1` |
| C3       | ✅ Review flow TƯỜNG MINH (điểm sai #16 của text dán): `t_946e4a8b` chạy đủ vòng thật — coder chạy → tự gọi `kanban_request_review` → reviewer profile được dispatch (session `20260813_163845_2aa647`) → `done` | `hermes kanban log t_946e4a8b`                                                  |
| D1       | ✅ `display.final_response_markdown = render`                                                                                                                                                                    | `hermes config get display`                                                     |
| D2       | ⏸ Dashboard: chạy `hermes dashboard` khi cần (cần login browser)                                                                                                                                                 | —                                                                               |
| E        | ✅ Swarm `t_d1a592bb`: 3 workers song song (done) → verifier `t_1470bdad` (done) → synthesizer `t_a959c6e7` (done) — artifact `hermes-multi-agent-3-y.md` (10KB, 192 dòng)                                       | `hermes kanban attachments t_a959c6e7`                                          |

**Bug phát hiện khi thực thi:** `hermes kanban show <id>` crash `sqlite3.ProgrammingError: Cannot operate on a closed database` (`kanban_db.py:3669`) — **đã có trên GitHub: #84350 [open]** (không tự fix sâu; workaround: `kanban list` / `kanban attachments` / `kanban log` hoạt động bình thường).

**Model mapping cuối (backend: opencode-go — key đã xác thực, không chạm giới hạn ChatGPT OAuth của codex):**

| Vai                           | Model               | Ghi chú                                    |
| ----------------------------- | ------------------- | ------------------------------------------ |
| Hermes chính                  | `deepseek-v4-flash` | giữ nguyên                                 |
| Subagent (`delegation.model`) | `kimi-k2.7-code`    | user đã test 4/4 model OK, chốt model này  |
| Kanban coder                  | `deepseek-v4-pro`   | code logic                                 |
| Kanban reviewer               | `glm-5.2`           | reasoning mạnh nhất trong list opencode-go |
| Kanban writer                 | `deepseek-v4-flash` | viết/tổng hợp                              |

**Ghi chú:** user đang chạy swarm riêng (`t_6b1a211b` — note NestJS bootstrap, có 1 worker blocked `t_dfec5035`). Danh sách model opencode-go đầy đủ: `hermes_cli/models.py:498` (kimi-k*, glm-5.x, deepseek-v4-_, qwen3.7-_, minimax-m*, mimo-v*).

---

## 8. Nhật ký thực thi — session song song (user chạy cùng lúc, đã verify)

> Hòa giải với session #1: `delegation.model` = **kimi-k2.7-code** (quyết định cuối của user, test 4/4 OK: kimi-k2.7-code, minimax-m3, z-ai/glm-5.2, deepseek-v4-pro). Profiles, smoke test, markdown render, bug #84350 — hai session thống nhất.

| Bước                                          | Trạng thái                       | Bằng chứng                                                                                                                                               |
| --------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1 `delegation.max_spawn_depth = 2`           | ✅ Xong                          | `hermes config get delegation` → `max_spawn_depth: 2`                                                                                                    |
| A2 `delegation.model = kimi-k2.7-code`        | ✅ Xong                          | `hermes config get delegation` → `model: kimi-k2.7-code`                                                                                                 |
| A3 Test model qua `opencode-go`               | ✅ 4/4 OK                        | `hermes chat -Q -m` → kimi-k2.7-code, minimax-m3, z-ai/glm-5.2, deepseek-v4-pro đều trả `OK`                                                             |
| B Profiles coder/reviewer/writer              | ✅ Đã có (user tự tạo song song) | `hermes profile show`: coder=deepseek-v4-pro, reviewer=glm-5.2, writer=deepseek-v4-flash; có SOUL.md, alias CLI                                          |
| C Smoke test kanban                           | ✅ Đã có (user tự chạy)          | `t_07702242 done` (coder, scratch workspace)                                                                                                             |
| D1 `display.final_response_markdown = render` | ✅ Xong                          | `hermes config get display.final_response_markdown` → `render`                                                                                           |
| E Swarm demo                                  | ✅ Hoàn thành                    | `t_6b1a211b`: 3 workers done → verifier `t_c3796078` done → synthesizer `t_835f0a9a` done; artifact `note-5-diem-bootstrap-nestjs.md` (16.6KB, 391 dòng) |

**Pitfall đã học (quan trọng):** cú pháp `hermes kanban swarm --worker PROFILE:TITLE[:SKILL,SKILL]` — **title không được chứa dấu `:`**, vì phần sau dấu hai chấm bị parse thành skill list. Worker "CLI NestJS: nest new..." bị parse skill sai → crash 2 lần → dispatcher auto-block (đúng cơ chế `failure_limit: 2`). Đã sửa bằng card thay thế + relink verifier.

---

## 9. Phiên team + headroom wrap + demo pipeline L01 (2026-08-13, đã verify)

### 9.1 Đội ngũ kanban — 8 workers (theo routing table project)

| Worker                          | Vai                    | Backend                                           | Model             |
| ------------------------------- | ---------------------- | ------------------------------------------------- | ----------------- |
| `claude`                        | Mentor · PM · Reviewer | opencode-go                                       | glm-5.2           |
| `codex`                         | Coder (SPEC)           | opencode-go                                       | deepseek-v4-pro   |
| `opencode`                      | Coder đối chứng        | opencode-go                                       | kimi-k2.7-code    |
| `copilot`                       | PR review layer-1      | **copilot-acp** (spawn copilot CLI thật, gh auth) | gpt-5 (hint)      |
| `coder` / `reviewer` / `writer` | (cũ)                   | opencode-go / glm-5.2                             | —                 |
| `default`                       | Orchestrator           | opencode-go                                       | deepseek-v4-flash |

SOUL.md riêng từng vai đã viết tại `~/.hermes/profiles/<name>/SOUL.md`. Profile tạo với `--no-alias` (tránh đè CLI thật claude/codex/opencode/copilot).

### 9.2 headroom wrap (proxy nén token, dashboard http://127.0.0.1:8787/dashboard)

- `headroom init --global claude` ✅ → doctor: claude routed (settings.json); test `wrap claude -- -p "CLAUDE_WRAP_OK"` OK
- `headroom wrap codex` ✅ + **durable block** ghi vào `~/.codex/config.toml` (marker `# --- Headroom persistent provider ---`, `model_provider="headroom"`, base_url 127.0.0.1:8787/v1, requires_openai_auth=true — đúng format `headroom/providers/codex/install.py`); doctor: codex routed; test `codex exec` trực tiếp OK (không cần launcher)
- opencode ✅ qua alias `op` = `HEADROOM_OPENCODE_PLUGIN_PATH=/nonexistent headroom wrap opencode`; test `wrap opencode -- run "OPENCODE_WRAP_OK"` OK
- copilot ⏳ chờ user: `headroom copilot-auth login` (OAuth browser)
- **Giới hạn**: hermes workers KHÔNG đi qua headroom được — headroom relay key lên api.openai.com/api.anthropic.com, workers dùng key opencode-go (bị 401). Workers chạy thẳng opencode-go.

### 9.3 BUG macOS TCC (quan trọng — chặn kanban tự dispatch trên project)

- Triệu chứng: task `--workspace dir:<project>` bị block, worker crash ngay startup: `PermissionError: [Errno 1] Operation not permitted` tại `_startup_fast.ensure_project_root_on_path` (realpath); đọc file từ worker → "File not found" (ENOENT — TCC che giấu)
- Root cause: TCC DENY (`auth_value=0`) trên binary python hermes + python headroom cho `SystemPolicyDocumentsFolder` (kiểm tra trong `~/Library/Application Support/com.apple.TCC/TCC.db`)
- Fix (user, GUI 1 lần): System Settings → Privacy & Security → Files and Folders → thêm `/Users/hienduong/.local/share/uv/python/cpython-3.11.15-macos-aarch64-none/bin/python3.11` (hermes) + `/opt/homebrew/Cellar/python@3.14/.../bin/python3.14` (headroom) → bật Documents. Sau đó `dir:` workspace hoạt động.
- Workaround hiện dùng: Hermes (terminal context — có TCC) điều khiển CLI thật, ghi kết quả lên board.

### 9.4 Demo pipeline L01-DEMO (6 task, DAG đúng chuỗi vai) — HOÀN TẤT

`claude + codex + opencode + copilot` (leaf, chạy qua headroom, đọc file thật) → `writer` (tổng hợp, parents=4, artifact note.md 1.8KB) → `reviewer` (gate verify: "14/14 claims traceable, 5/5 action_items, không fabricate").

Kết quả từng vai: claude=mentor đánh giá bootstrap chuẩn first-steps; codex=so sánh cấu trúc khớp chuẩn; opencode=3 cải thiện (strict:true, ts-jest@29.2.5 vs Jest 30, verify song song); copilot=VERDICT APPROVE + branch naming lưu ý (2.18 AI credits). Note: `~/.hermes/kanban/attachments/t_16f4414c/note.md`.

**Bug tìm thấy:** `hermes kanban show <id>` crash `sqlite3.ProgrammingError: Cannot operate on a closed database` (`kanban_db.py:3669`, `task_graph_contexts`) — cần báo lên GitHub issues, chưa tự fix.

**Ghi chú khác:** profile clone có `Warning: Unknown toolsets: mcp-codegraph` (config gốc tham chiếu toolset không tồn tại trên máy này) — không chặn worker, chỉ là warning.
