<!--
SPEC.md — nguồn bàn giao task cho Coder agent (NES-4, L03).
Chỉ Claude được sửa file này (xem docs/adr/0004-mcp-single-writer-cho-coder-agent.md
và docs/workflow/AGENT-MODEL.md). Nội dung sao nguyên từ description issue Linear NES-4.
Nếu issue Linear đổi sau đó, cập nhật lại file này cùng lúc.
-->

# NES-4 — L03 — Providers & Dependency Injection

## 🎯 Mục tiêu học

Học IoC và dependency injection qua constructor; implement một service `@Injectable()` với provider scope singleton; chuyển task business logic vào `TasksService` giữ controller thin (chỉ HTTP).

## 🏷 Labels

hands-on, phase-1

## 📚 Tài liệu chính thống

- [https://docs.nestjs.com/providers](https://docs.nestjs.com/providers)
