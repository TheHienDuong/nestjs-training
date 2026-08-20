# 🔎 REVIEW MODEL — Mô hình multi-reviewer phân tải

> **Cho mọi agent:** file này định nghĩa **ai review cái gì** trong repo. Đọc cùng `AGENT-MODEL.md` + `docs/bilingual-policy.md`. Quy tắc gốc: **không agent nào vừa viết vừa tự review code mình**; reviewer không trùng author; Coder (codex/opencode) chỉ code, **không review**.

## Mục tiêu

- **Phân tải review** theo thế mạnh từng agent — không để một agent ôm hết.
- **Tiết kiệm token:** gatekeeper (Copilot) **chỉ** chốt MR lớn; PR nhỏ dùng reviewer nhẹ theo loại.
- **Minh bạch:** mỗi reviewer có **rulebook** ghi rõ; user đọc được rule từng agent để kiểm chứng.
- **Failover có sẵn:** khi agent hết limit, có người thay — không block pipeline, không merge lỏng.

## 1. Review matrix — ai giỏi review gì

| Agent                          | Vai                                         | Giỏi nhất về                                                                                          | Không giao                                                | Chi phí                     |
| ------------------------------ | ------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------- |
| **Copilot CLI**                | **Gatekeeper** (chốt MR vào main)           | Review kỹ, line-by-line cả PR lớn; regression/contract; bám repo-context                              | Review PR nhỏ lẻ (tốn token)                              | Cao — **tối đa 2 lần/ngày** |
| **Claude Code**                | **Reviewer local** (logic/docs) / tách PR   | Kiến trúc, cross-file consistency, DI/service, docs/SPEC/ADR, suy luận security; memory giữ nhất quán | Viết code hands-on; merge; review PR do chính mình author | Trung bình                  |
| **Codex-action** (bot tự động) | **Code-quality / Security (lớp 1, mọi PR)** | DTO/validation, N+1, secret, test thiếu; scan nhanh qua `codex-review.yml`                            | Kiến trúc mức-repo                                        | Miễn phí (CI)               |
| **opencode** (counter-view)    | **Second opinion**                          | Góc đối chứng, bắt điều primary bỏ sót; dự phòng quá tải                                              | Review chuyên sâu mức kiến trúc                           | Thấp                        |
| **Hermes**                     | **Orchestrator / Verifier**                 | Điều phối, route đúng reviewer, chạy `pnpm verify`, verify self-report                                | Review cuối (chỉ verify + tổng hợp)                       | —                           |

> ⚠️ **Không dùng `agy`:** herdr không hỗ trợ integration `agy`, profile `coder-agy` đã archive. Vai đối chứng = **opencode** (herdr-supported).
>
> ⚠️ **`Codex-action` ≠ `codex` (Coder):** `Codex-action` ở bảng trên là **bot CI tự động** (`codex-review.yml`, chạy trên GitHub Actions, không tự viết code, không giữ branch riêng) — khác với `codex` đang giữ **vai Coder** (agent tương tác, code trên branch `codex/nes-XX-...`). Coder (codex/opencode, vai tương tác) **không bao giờ** được giao review — kể cả PR của chính nó hay của agent khác; `Codex-action` không bị ràng buộc này vì nó không code, chỉ phân tích diff.
>
> ⚠️ **Author check trước khi route theo loại:** PR do **Claude author** (docs/ADR/hạ tầng) → Claude **KHÔNG** được là reviewer cho PR đó, dù loại nội dung khớp "logic/docs". Route sang **Hermes verify tay + user lead review trực tiếp** (PR nhỏ) hoặc **Copilot gatekeeper** (nếu gộp vào MR lớn). Kiểm tra author TRƯỚC, chọn loại nội dung SAU.

## 2. Pipeline (nhịp ngày — TUẦN TỰ, tôn trọng cap pane)

```
Task lớn → Claude TÁCH PR nhỏ (mỗi PR ≤ 20 FILE, 1 branch/PR)
  → (tuần tự, dùng lại pane ephemeral, cap 2–3 worker pane) light review theo loại:
       Claude(logic/docs, pane) | opencode(đối chứng, khi cần, pane)
       + Codex-action(code-quality, tự động trên GitHub — KHÔNG qua pane, chạy song song)
       + test + action check (pnpm verify, CI scope ≤20)
  → cuối ngày / user cảm thấy cần → gom 2 "MR lớn" (collector branch mr/<ngay>-<stt>)
  → Gatekeeper review kỹ (Copilot, tối đa 2/ngày) → MR vào main — chỉ user merge
  → cuối tuần: codex security sweep toàn project (user tự chạy)
```

> ⚠️ **Collector `mr/*` KHÔNG thay thế ADR-0005:** PR nhỏ vẫn mở thẳng và merge vào `main` đúng ADR-0005 trước. `mr/*` là **lớp gom SAU đó** (từ các commit đã ở `main`) để Copilot gatekeeper review kỹ một lần trước khi "phát hành" — không phải đường đi thay thế. Chi tiết: [ADR-0008](../adr/0008-review-collector-mr.md).

**Luật cứng:**

- **2 MR/ngày là TRẦN, không phải chỉ tiêu** — user chọn số lượng (0–2) + thời điểm; dư dời hôm sau theo thứ tự gom.
- 1 PR nhỏ **≤ 20 FILE** (guard: không file >~400 dòng).
- Gatekeeper (Copilot) **chỉ** review MR lớn; PR nhỏ **không** dùng Copilot.
- Vận hành **tuần tự**, pane ephemeral tái sử dụng — **không mở N pane song song** (cap 2–3, ADR-0006).

## 3. Budget & nơi lưu trạng thái

| Reviewer     | Budget/ngày                                                               | Khi chạm trần                       |
| ------------ | ------------------------------------------------------------------------- | ----------------------------------- |
| Copilot      | 2 review (2 MR lớn)                                                       | ngừng gọi; MR trễ hôm sau           |
| Claude       | 3–4 review PR nhỏ + tách PR                                               | chuyển opencode + Hermes verify tay |
| Codex-action | 4–5 review/ngày (rate limit GitHub Action) + weekend sweep (user tự chạy) | Hermes verify tay                   |
| opencode     | tuỳ (rẻ)                                                                  | —                                   |

- Counter lưu trong **hermes kanban** (task state duy nhất) + plugin herdr-agent-state. KHÔNG viết registry/daemon riêng.
- **Reset theo giờ VN 0h.** Hermes đọc counter trước mỗi dispatch để chọn reviewer + enforce trần.

## 4. Failover matrix (theo VAI)

| Agent hết        | Người thay                                                                                                       | Degrade                              | Khôi phục               |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ----------------------- |
| **Copilot**      | **Claude** (deep gatekeeper) → **Codex-action** (thorough scan) → **user manual** (Hermes soạn checklist + diff) | hạ còn 1 MR/ngày hoặc trễ 1 ngày     | reset → resume Copilot  |
| **Claude**       | **opencode** (đối chứng, KHÔNG phải reviewer chính) + **Hermes verify tay**                                      | PR nhỏ chờ hoặc user tự review tạm   | reset → Claude nhận lại |
| **Codex-action** | **Hermes verify tay** (đọc diff RAW + `pnpm verify`)                                                             | weekend sweep dời (user tự chạy sau) | dồn cuối tuần sau       |
| **opencode**     | **Hermes verify tay**                                                                                            | bỏ lớp đối chứng tạm                 | —                       |

Nguyên tắc: không **block** pipeline; MR vào main **bắt buộc ≥1 reviewer nghiêm túc** (Copilot hoặc Claude deep) — không merge lỏng; ghi hàng đợi khi hết limit, **không spam prompt**.

## 5. Cơ chế auto-review thật (2 lớp, không trùng)

1. **Codex-action** (`codex-review.yml`): tự chạy trên **MỌI PR** qua CI/GitHub = lớp auto-review miễn phí, khớp vai "Codex code-quality". Prompt self-contained đọc AGENTS.md/CLAUDE.md, dùng mức P0/P1/P2. **Không động vào workflow này.**
2. **Copilot gatekeeper:** tách riêng — **dispatch tương tác qua herdr** (profile `reviewer-copilot`), **CHỈ áp dụng cho branch `mr/*`** (collector) trước khi vào main. Không xung đột với Codex action.

## 6. Review rulebook per agent (user xem được rule từng agent)

Hermes dispatch review gửi prompt = `[rulebook] + [diff] + [yêu cầu verdict + issues P0/P1/P2]`. **Verdict trả về = FS-sentinel JSON** (nonce + verdict + issues) — KHÔNG dùng text-match (né false-positive ADR-0006).

| Reviewer                                 | Rulebook                                                                                                                                                        |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Claude** (logic/docs)                  | Controller chỉ HTTP; business logic ở service; DI constructor; error handling + transaction; cross-file consistency; SPEC/lesson chính xác; không over-engineer |
| **Codex-action** (code-quality/security) | **Link tới `AGENTS.md` → "Code Review Rules"** (1 nguồn sự thật, không copy)                                                                                    |
| **Copilot** (gatekeeper)                 | Full-diff kỹ; regression/contract-break; merge-readiness + CI xanh; security lần cuối trước main                                                                |
| **opencode** (counter-view)              | Thiết kế thay thế; edge case bỏ sót; góc khác primary reviewer                                                                                                  |
| **Hermes** (verify)                      | git diff RAW + `pnpm verify` + đối chiếu self-report (không tin lời agent)                                                                                      |

## 7. Người quyết định cuối

- **User (Hien Duong)** = lead reviewer + **chỉ user merge**. Không agent nào merge.
- **Code owner bắt buộc approve trước khi merge (2026-08-20):** `@hienduong-agilityio` (`.github/CODEOWNERS`) — gate bổ sung trên GitHub, **không** đổi quyền merge (vẫn chỉ user merge).
- ADR liên quan: [ADR-0007](../adr/0007-claude-reviewer-local-multi-reviewer.md) (Claude nhận vai Reviewer local), [ADR-0008](../adr/0008-review-collector-mr.md) (collector `mr/*` không thay thế ADR-0005).
