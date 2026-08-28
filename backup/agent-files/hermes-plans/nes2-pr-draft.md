docs(lesson-01): cau truc project va bootstrap (L01) — scaffold note + sync trang thai

Fixes NES-2

## Tóm tắt

Hoàn tất Linear task **NES-2 — L01 "Cấu trúc project & bootstrap"**: scaffold note lesson tại `docs/lessons/01-first-steps/README.md` + đồng bộ trạng thái ROADMAP và ghi nhận agent-log theo đúng quy trình vận hành (kanban work plan NES-2, 9/10 task).

## Thay đổi (2 commits)

| Commit             | File                                    | Nội dung                                                                                                                                |
| ------------------ | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `bc14394` (có sẵn) | `docs/lessons/01-first-steps/README.md` | Scaffold note L01: frontmatter branch thật + ngày học 2026-08-12                                                                        |
| mới (commit này)   | `docs/ROADMAP.md`                       | L01 ⬜ → 🟦 (đang học, hands-on xong — chờ review/gate/merge thì ✅)                                                                    |
| mới (commit này)   | `docs/lessons/_agent-log.md`            | Ghi dòng 2026-08-13: kanban team L01 (claude/codex/opencode/copilot/writer/reviewer) — TCC deny, rtk distortion, headroom wrap 3/4 tool |

## Verify

- [x] `pnpm verify` ✅ local — eslint `--max-warnings=0` sạch · prettier check pass · jest 1/1 pass · nest build OK
- [x] `pnpm exec prettier --check docs/ROADMAP.md docs/lessons/_agent-log.md` ✅
- [ ] CI xanh (sau khi push)

## Lưu ý

- **Hands-on (6 bước) + Quiz (5 câu) đã hoàn thành** (user tự làm, không để lại thay đổi tracked — đúng cho bài tập khám phá: `start:dev`, build+dist, PORT=4000, SWC, NestExpressApplication, lỗi DI). Note còn trống mục "Vương o dau / Dieu tuong hieu sai / Quiz / Diem can nho" — user điền dần.
- **Bilingual:** bản EN đã dịch xong qua claude wrapped (17,484 chars, 0 ký tự VN sót, 24,748 tokens nén qua headroom) — lưu `.hermes/plans/l01-readme.en.md`, chưa commit lên `example/nestjs-training` (chờ merge main để tránh làm 2 lần).
- Không commit các thư mục untracked: `.cache/`, `.codex/`, `.venv/`.
- Copilot wrap: auth đã login, model đã chỉ định — review layer-1 (T9) sẽ chạy sau khi PR mở.

## Checklist (Definition of Done)

- [x] Lesson note có đủ mục **Liên hệ kiến thức cũ** và **Nguồn**
- [x] Hands-on chạy được (`pnpm start:dev` + gọi thử API)
- [ ] Vượt quiz ở bước review
- [ ] PR CI xanh và merge vào `main` (squash — 1 lesson = 1 commit)
- [ ] 2 bản vi/en không lệch nội dung

Co-authored-by: Hermes <deepseek-v4-flash> <259144110+hermes-agent[bot]@users.noreply.github.com>
