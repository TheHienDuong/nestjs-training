# 🌐 Bilingual Policy — quy tắc 2 phiên bản vi/en

> Trang quy tắc chính thức. Mọi agent (Claude Code, Hermes, codex, opencode...) khi chạm vào docs/config **phải đọc file này**.

## Mục đích

Repo được mirror sang tiếng Anh để đồng bộ với GitLab công ty (`gitlab` remote) — nơi chỉ chấp nhận nội dung tiếng Anh dưới một identity riêng. Bản tiếng Việt (`main`) vẫn là nơi học và làm việc chính. Hai bản phải **luôn tương đương về nội dung**, chỉ khác ngôn ngữ.

## Cấu trúc 2 bản

| Branch                    | Ngôn ngữ   | Vai trò                                         |
| ------------------------- | ---------- | ----------------------------------------------- |
| `main`                    | Tiếng Việt | Bản chính, nơi học và làm việc hàng ngày        |
| `example/nestjs-training` | Tiếng Anh  | Bản mirror, nguồn duy nhất được sync lên GitLab |

Code trong `src/` và `test/` **giống hệt** ở cả 2 bản — không có logic riêng theo ngôn ngữ. Chỉ docs (`docs/`, `AGENTS.md`, `CLAUDE.md`, `.hermes.md`, README...) và config có comment/mô tả bằng ngôn ngữ tự nhiên mới khác nhau giữa 2 bản.

## Quy trình khi thay đổi docs

1. Sửa bản tiếng Việt trên `main` như bình thường.
2. Dịch đúng nội dung đã đổi sang tiếng Anh, áp lên `example/nestjs-training` — giữ nguyên cấu trúc file, heading, bảng, code fence; chỉ dịch phần văn bản tự nhiên. Thuật ngữ kỹ thuật (provider, guard, interceptor, pipe, DI, decorator...) giữ nguyên ở cả 2 bản.
3. Không tự dịch code comment hoặc identifier trong `src/`/`test/` — 2 bản dùng chung code.
4. Chạy checklist ở mục dưới trước khi coi task là xong.

## Quy trình sync GitLab

- GitLab **chỉ nhận bản tiếng Anh** từ `example/nestjs-training`. Không bao giờ push bản tiếng Việt (`main`) lên `gitlab` remote.
- Commit trên GitLab: author = `hienduong-agility`, **không** kèm `Co-authored-by` trailer nào, commit message viết tiếng Anh theo Conventional Commits.
- Sync diễn ra sau mỗi milestone (không phải mỗi commit lẻ) — xem `docs/workflow/WORKFLOW.md` mục Bilingual.

## Checklist trước khi coi là xong

- [ ] 2 bản (`main` và `example/nestjs-training`) không lệch nội dung ngoài phần ngôn ngữ — `git diff` giữa 2 branch (bỏ qua khác biệt dịch) phải rỗng.
- [ ] Bản EN không còn ký tự tiếng Việt (dấu, từ tiếng Việt sót lại).
- [ ] Code (`src/`, `test/`) giống hệt 2 bản.
- [ ] Nếu có sync GitLab: author = `hienduong-agility`, không trailer, message tiếng Anh.

## Bảng phân loại — ai làm gì

| Việc                                                    | Ai làm                                                       |
| ------------------------------------------------------- | ------------------------------------------------------------ |
| Viết/sửa docs tiếng Việt trên `main`                    | User (hands-on) hoặc Claude Code (docs/ADR/workflow)         |
| Dịch và cập nhật bản EN trên `example/nestjs-training`  | Claude Code hoặc agent được giao task docs (theo AGENTS.md)  |
| Kiểm tra diff 2 bản + scan ký tự tiếng Việt trên bản EN | Hermes (verify độc lập) hoặc agent thực hiện task            |
| Sync bản EN lên GitLab                                  | Hermes hoặc user — **không đụng gitlab** nếu không được giao |
| Quyết định khi nào sync GitLab (theo milestone)         | User                                                         |

## Xem thêm

- `AGENTS.md` — mục Bilingual Policy
- `CLAUDE.md` — mục Bilingual Policy
- `.hermes.md` — mục 8, dòng Bilingual
- `docs/workflow/WORKFLOW.md` — mục Conventions › Bilingual
- `docs/workflow/AGENT-MODEL.md` — đoạn cuối
