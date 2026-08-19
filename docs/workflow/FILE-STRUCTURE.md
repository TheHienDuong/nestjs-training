# 🗂 FILE-STRUCTURE — Quy ước tổ chức file & phối hợp agent

> Mục tiêu: 25 lesson còn lại **không** sinh ra file trùng lặp, module song song,
> hay logic lạc chỗ — kể cả khi nhiều agent chạy đồng thời.

## a) Folder chuẩn (Nest feature-based)

**Một feature = một folder `src/<feature>/`**, tạo **đúng một lần** ở lesson giới
thiệu feature đó. Lesson sau chỉ **extend**, không tạo lại.

```text
src/<feature>/
  <feature>.module.ts
  <feature>.controller.ts
  <feature>.service.ts
  <feature>.controller.spec.ts
  dto/
    create-<feature>.dto.ts
    update-<feature>.dto.ts
test/<feature>.e2e-spec.ts
```

Dẫn chứng hiện có: `src/users/` (L01), `src/tasks/` (L02).

## b) Look-before-create (tránh lặp)

Trước khi tạo file hoặc feature mới, **luôn grep `src/`** để biết feature đã tồn
tại chưa:

```bash
grep -ril "<feature>" src/
```

- Lesson là **nâng cấp** feature có sẵn (vd L05 thêm DTO validation cho `tasks`)
  → **extend** module hiện có (`src/tasks/`), **không** sinh bản song song
  (`tasks2/`, `tasks-v2/`) và **không** nhét logic vào `AppController`.
- File dùng chung (`app.module.ts`, DTO base, pipe chung...) thì **tái dùng**,
  không copy ra bản riêng cho từng feature.

## c) Đăng ký module

Module mới bắt buộc khai báo trong `AppModule` (`imports`), đúng vòng DI —
không để module "mồ côi" không ai import.

## d) Phối hợp thông minh khi agent chạy song song

- **Chủ quyền module** — mỗi agent giữ 1+ module **riêng**; không 2 agent sửa
  chung 1 module cùng lúc.
- **File chung** (`app.module.ts`, `package.json`, `docs/ROADMAP.md`,
  `docs/lessons/_agent-log.md`, `docs/templates/*`) — serialize hoặc để Hermes
  (orchestrator) hợp nhất, **không agent nào đụng song song**.
- **Biết scope trước khi giao** — chạy `pnpm lesson <NN>` để biết lesson trước
  đã sinh file gì, rồi gán scope rời cho từng agent trước khi dispatch.

## e) Header comment file reference

Mọi file reference code mới bắt đầu bằng:

```ts
// [NES-X · lesson NN] <vai trò file>
```

Ví dụ: `// [NES-3 · lesson 02] Reference — controller, teaching comments inline`.

## Tham chiếu

- Quy trình 6 bước mỗi lesson: [WORKFLOW.md](WORKFLOW.md)
- Phân vai agent: [AGENT-MODEL.md](AGENT-MODEL.md)
- Ranh giới file theo đường dẫn: `AGENTS.md` § Ranh giới file
