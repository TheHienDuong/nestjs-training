# Multi-Reviewer Model — Kiến trúc review phân tải cho nestjs-training

> **Cho Hermes:** PLAN kiến trúc (không chạy code). Áp dụng qua cổng kiểm duyệt `.hermes.md` (dispatch qua herdr, user duyệt từng PR).

**Goal:** Quy trình **multi-reviewer tối ưu** — mỗi agent review đúng thứ nó giỏi, **không đè nặng 1 agent**, tiết kiệm token (gatekeeper chỉ chốt 2 MR lớn/ngày), và **failover** khi agent hết limit.

**Nguyên tắc gốc (từ AGENT-MODEL.md):** không agent nào vừa viết vừa tự review code mình; reviewer không trùng author. Coder **chỉ code, không review cuối**.

> **Phản hồi review plan (2026-08-19)** — đã vá 8 điểm, xem §12.

---

## 1. Review matrix — mỗi agent GIỎI review gì

| Agent                       | Vai trong review                     | Giỏi nhất về                                                                                                      | Không nên giao                      | Chi phí                     |
| --------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------- | --------------------------- |
| **Copilot CLI**             | **Gatekeeper** (chốt MR vào main)    | Review kỹ, line-by-line cả PR lớn; regression/contract; bám repo-context                                          | Review PR nhỏ lẻ (tốn token)        | Cao → **tối đa 2 lần/ngày** |
| **Claude Code**             | **Logic / Docs / tách PR**           | Kiến trúc, cross-file consistency, DI/service, docs/SPEC/ADR, suy luận security; nhớ context để tách PR nhất quán | Viết code hands-on; merge           | Trung bình                  |
| **Codex**                   | **Code-quality / Security / Action** | DTO/validation, N+1, secret, test thiếu; chạy được + scan nhanh; **security sweep cuối tuần (user tự chạy)**      | Kiến trúc mức-repo                  | Thấp                        |
| **opencode** (counter-view) | **Counter-view / second opinion**    | Góc đối chứng, bắt điều primary bỏ sót; dự phòng quá tải                                                          | Review chuyên sâu mức kiến trúc     | Thấp                        |
| **Hermes**                  | **Orchestrator / Verifier**          | Điều phối, route đúng reviewer, chạy `pnpm verify`, verify self-report                                            | Review cuối (chỉ verify + tổng hợp) | —                           |

> ⚠️ **Không dùng `agy`:** herdr KHÔNG hỗ trợ integration `agy`, và profile `coder-agy` đã bị archive có chủ đích (`.hermes.md:115`). Vai đối chứng = **opencode** (herdr-supported). Nếu sau này muốn agy → cần onboard như integration riêng.

**Phân công cụ thể (theo ý user):**

- **Copilot** → chỉ 2 **MR lớn** vào main.
- **Claude** → PR nhỏ **logic/kiến trúc/docs** + **tách PR nhỏ** (có memory, biết đã làm gì).
- **Codex** → PR nhỏ **code kỹ thuật/validation/test/action** + **security cuối tuần** (user tự chạy).
- **opencode** → **đối chứng** PR trung bình / dự phòng quá tải.
- Mỗi PR nhỏ chỉ **1 reviewer nhẹ**, **không Copilot**.

---

## 2. Pipeline (nhịp ngày) — TUẦN TỰ, tôn trọng cap pane

```
Task lớn → Claude TÁCH thành PR nhỏ (mỗi PR ≤ 20 FILE, 1 branch/PR)
  → (tuần tự, dùng lại pane ephemeral) light review theo loại:
       Claude(logic/docs) | Codex(code-kỹ-thuật) | opencode(đối chứng)
       + test + action check (pnpm verify, CI scope ≤20)
  → cuối ngày / user cảm thấy cần → gom 2 "MR lớn" (collector branch)
  → Gatekeeper review kỹ 2 MR lớn (Copilot, tối đa 2/ngày)
  → MR vào main — chỉ user merge
  → cuối tuần: codex security sweep toàn project (user tự chạy, Hermes chuẩn bị lệnh)
```

**Luật cứng:**

- 1 ngày **tối đa 2 MR** vào main.
- 1 PR nhỏ **≤ 20 FILE** (guard: không file quá lớn >~400 dòng).
- Gatekeeper (Copilot) **chỉ review MR lớn**; PR nhỏ **không** dùng Copilot.
- **Vận hành TUẦN TỰ** với pane ephemeral tái sử dụng — **không mở N pane song song**; tuân thủ **cap 2–3 worker pane** (ADR-0006, rút từ pane-drift thật).

---

## 3. Budget & nơi lưu trạng thái

| Reviewer | Budget/ngày                 | Khi chạm trần                   |
| -------- | --------------------------- | ------------------------------- |
| Copilot  | 2 review (2 MR lớn)         | ngừng gọi; MR trễ sang ngày sau |
| Claude   | 3–4 review PR nhỏ + tách PR | chuyển bài sang Codex/opencode  |
| Codex    | 4–5 review + weekend sweep  | chuyển sang opencode/Claude     |
| opencode | tuỳ (rẻ)                    | —                               |

**Lưu state (KHÔNG viết registry/daemon riêng — đúng .hermes.md:76):**

- Counter "Claude đã review x/3 hôm nay", "Copilot còn y/2" → lưu trong **hermes kanban** (task state duy nhất) + plugin herdr-agent-state.
- **Reset theo giờ VN 0h** (móc vào ngày ghi ở kanban field, không reset tuỳ hứng).
- Hermes đọc counter trước mỗi dispatch để chọn reviewer + enforce trần.

---

## 4. Failover matrix (BẮT BUỘC có; theo VAI, không 1 chuỗi cứng)

| Agent HẾT limit  | Người thay                                                                                                                                        | Cách degrade                                                     | Khôi phục                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------- |
| **Copilot** hết  | **Claude** (deep gatekeeper, ưu tiên #1 — context lớn, đọc kỹ full-PR) → **codex** (thorough scan) → **user manual** (Hermes soạn checklist+diff) | hạ còn **1 MR/ngày** (chọn MR ưu tiên — §9.6) hoặc MR trễ 1 ngày | reset quota → resume Copilot lượt sau |
| **Claude** hết   | **codex** (logic+docs pattern) → **opencode** (đối chứng)                                                                                         | PR nhỏ chờ hoặc chuyển quyền                                     | hết giờ reset → Claude nhận lại       |
| **Codex** hết    | **opencode** (counter) → **claude**                                                                                                               | weekend sweep dời/cộng dồn                                       | reset → dồn cuối tuần sau             |
| **opencode** hết | **Hermes verify tay** (diff+pnpm verify)                                                                                                          | bỏ lớp đối chứng tạm (không chặn)                                | —                                     |

**Nguyên tắc chung:** không **block** pipeline (PR nhỏ luôn có ai đảm nhận, downgrade đúng bậc); MR vào main **bắt buộc ≥1 reviewer nghiêm túc** (Copilot hoặc Claude deep) — không merge lỏng; mọi phiên hết limit ghi hàng đợi, **không spam prompt** (pitfall herdr P13).

---

## 5. Việc cần làm (từng PR, user duyệt)

- **Task 1 — viết `docs/workflow/REVIEW-MODEL.md`** (VN qua Claude + EN mirror): matrix + pipeline + budget + failover + rulebook (§10), link `AGENTS.md` code review rules (không copy).
- **Task 2 — GỘP ADR vào PR #44 (KHÔNG merge #44 riêng lẻ):** viết ADR amend quyết định 2026-08-13/PR#24 **trong cùng nhánh của PR #44**, nêu **lý do đầy đủ** (tại sao đảo: user chốt multi-reviewer, Claude có memory + context lớn → phù hợp reviewer local; không chỉ ghi "user xác nhận"), rồi merge PR #44 + ADR **cùng lúc**. Tránh đụng/trùng diff khi `REVIEW-MODEL.md` (Task 1) chạy độc lập.
- **Task 3 — commit `codex-review.yml` + `.github/codex/` NGUYÊN TRẠNG bằng `git add` ĐÍCH DANH path** (`git add .github/workflows/codex-review.yml .github/codex/` — KHÔNG `git add -A`/`git add .` để tránh cuốn theo `M AGENTS.md` + untracked `docs/lessons/02-controllers/`, `graphify-out/` đang dở dang ngoài phạm vi) + **thêm cơ chế dispatch Copilot riêng cho `mr/*`** (qua herdr, profile `reviewer-copilot`).
- **Task 4 — script/branch "collector MR"** (Hermes gom nhánh `mr/<ngay>-<stt>` + mở MR, không merge).
- **Task 5 — `_agent-log.md`** ghi nhận model mới.

## 6. Files đổi

`docs/workflow/REVIEW-MODEL.md` (mới), `docs/adr/*` (ADR mới), `.hermes.md`, `AGENTS.md`, `CLAUDE.md`, `docs/workflow/AGENT-MODEL.md`, `.github/workflows/` (tùy §11), `docs/lessons/_agent-log.md`.

## 7. Verify

`pnpm verify` xanh; mô phỏng 1 ngày: 5 PR nhỏ + 2 MR → đếm Copilot = 2, phân tải đều; test failover (tắt Copilot → 1 MR trễ/Claude thay, không merge lỏng).

---

## 8. Rủi ro / câu hỏi mở

- (7 cũ) Copilot hết giữa ngày 2 MR → **MR nào trước?** → xem §9.6.
- Bản EN mirror đồng bộ theo bilingual-policy.
- Đảo vai Claude cần ADR (Task 2) để không phá dấu vết governance 2026-08-13.

---

## 9. Quyết định đã chốt (user, 2026-08-19)

1. **"PR ≤ 20 change" = số FILE** (guard: không file >~400 dòng).
2. **Claude tách PR nhỏ** (có memory, biết đã làm gì).
3. **Copilot fallback = Claude (deep)** → codex (scan) → user manual (đề xuất, user đồng ý hướng "tìm agent khác đảm nhiệm").
4. **Weekend codex security: user tự chạy** (Hermes chỉ nhắc/chuẩn bị lệnh).
5. **Lead review = user + Hermes verify**; kèm **rulebook per agent** user xem được.
6. **Số MR/ngày + thứ tự:** "2 MR/ngày" là **TRẦN, không phải chỉ tiêu** — user chọn số lượng (0–2) và thời điểm tùy cảm giác sẵn sàng; batch dư tự dời hôm sau **theo đúng thứ tự user đã gom**, không cần rule ưu tiên (bỏ FIFO).

## 10. Review rulebook per agent (user xem được rule từng agent)

Hermes dispatch review gửi prompt = `[rulebook] + [diff] + [yêu cầu verdict + issues P0/P1/P2]`. **Verdict trả về = FS-sentinel JSON** (nonce + verdict + issues) — KHÔNG dùng text-match (né false-positive ADR-0006).

| Reviewer                          | Rulebook (khi review code)                                                                                                                                      |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Claude** (logic/docs)           | Controller chỉ HTTP; business logic ở service; DI constructor; error handling + transaction; cross-file consistency; SPEC/lesson chính xác; không over-engineer |
| **Codex** (code-quality/security) | **Link tới `AGENTS.md` "Code Review Rules"** (1 nguồn sự thật, không copy để tránh trôi lệch)                                                                   |
| **Copilot** (gatekeeper)          | Full-diff kỹ; regression/contract-break; merge-readiness + CI xanh; security lần cuối trước main                                                                |
| **opencode** (counter-view)       | Thiết kế thay thế; edge case bỏ sót; góc khác primary reviewer                                                                                                  |
| **Hermes** (verify)               | git diff RAW + `pnpm verify` + đối chiếu self-report (không tin lời agent)                                                                                      |

## 11. Decisions đã chốt — (2) cơ chế auto-review + (3) vai đối chứng

- **(2) Cơ chế auto-review:** GIỮ `codex-review.yml` + `.github/codex/` **NGUYÊN TRẠNG** (commit as-is, không đổi sang Claude, không filter theo số file) → Codex-action tự chạy trên **MỌI PR** = **lớp auto-review miễn phí**, khớp vai "Codex code-quality" (§1); prompt review.md tự đọc AGENTS.md/CLAUDE.md, dùng P0/P1/P2. KHÔNG động vào workflow này.
  - **Copilot gatekeeper TÁCH RIÊNG:** dispatch tương tác qua **herdr** (profile `reviewer-copilot`), **CHỈ áp dụng cho 2 branch `mr/*`** (collector) — không xung đột với Codex action.
- **(3) Vai đối chứng = opencode** (bỏ agy — herdr không hỗ trợ, coder-agy đã archive).

## 12. Phản hồi review plan — trạng thái 8 điểm

| #   | Điểm                                      | Trạng thái                                                                                                                                                                                  |
| --- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Claude=Reviewer — amend ADR 2026-08-13    | ✅ PR #44 đã **merge** (+ ADR kèm) → hiệu lực: Claude = Reviewer local; Coder (codex) chỉ code, không review                                                                                |
| 2   | codex-review.yml ≠ Copilot; 2 auto-review | ✅ chốt: giữ Codex action nguyên trạng; Copilot gatekeeper tách riêng chỉ `mr/*`                                                                                                            |
| 3   | agy không phải herdr integration          | ✅ **ĐÃ ĐẢO (2026-08-20, user)**: `agy` = vai đối chứng (counter-view), thay `opencode`; `opencode` bỏ khỏi hệ thống; agy chạy qua herdr pane, profile `coder-agy` (un-archive), không wrap |
| 4   | concurrent phá cap pane                   | ✅ §2 thêm "tuần tự + cap 2-3 pane"                                                                                                                                                         |
| 5   | budget không nơi lưu state                | ✅ §3 lưu vào hermes kanban, reset 0h VN                                                                                                                                                    |
| 6   | verdict text-match                        | ✅ §10 dùng FS-sentinel JSON                                                                                                                                                                |
| 7   | MR priority chưa chốt                     | ✅ chốt: 2 MR/ngày là trần; user chọn số+thời điểm; dư dời theo thứ tự gom                                                                                                                  |
| 8   | rulebook Codex trùng AGENTS.md            | ✅ §10 link thay vì copy                                                                                                                                                                    |

> ✅ **CLOSED 2026-08-21** — Plan multi-reviewer hoàn tất: toàn bộ PR (→ #58) merged, comment Codex fix + resolve, ~9 issue P1/P2 làm xong, Linear `fixes` clean (NES-113→120 closed), bilingual main↔example khớp, GitLab full EN (author `hienduong-agility`, 0 VN). Sẵn sàng lesson tiếp theo (L03 Providers & DI).
