# 📐 Architecture Decision Records (ADR)

## What is an ADR?

An ADR is **a short markdown file that records an important technical decision and the reasoning behind it**. The idea was proposed by Michael Nygard in 2011 and is now a common practice among backend teams.

## Why does a learning project also need ADRs?

Because the hardest question when returning to a codebase after 6 months is not _"what does this code do?"_ — you can tell that by reading the code. The hard question is _**"why was it done this way instead of that way?"**_

Code only records the **result** of a decision. It does not record the discarded options, the constraints at the time, or the tradeoffs that were accepted. Without ADRs, two things will happen:

1. The next person (even you yourself) will reverse a correct decision because they don't know the reasoning behind it
2. The entire team will re-debate the exact same problem they already resolved six months ago

For you, ADRs also have unique value: **writing an ADR forces you to articulate the reasoning behind your choice**. If you can't write an ADR for a particular decision, it's usually because you don't truly understand why you chose it. This is one of the clearest differences between junior and senior engineers — it's not about knowing more, but about **knowing what tradeoffs you are making and what you are getting in return**.

## Conventions

- Naming: `NNNN-short-description.md`, numbers increment sequentially, do not reuse old numbers
- **ADRs are immutable:** once merged, content cannot be modified. If you change your mind, write a new ADR and mark the old ADR as `Superseded by ADR-NNNN`
- Status: `Proposed` → `Accepted` → `Deprecated` / `Superseded`
- Keep it short: one page is enough

## List

| #                                                 | Decision                                                             | Status |
| ------------------------------------------------- | ---------------------------------------------------------------------- | ---------- |
| [0001](0001-chon-prisma-lam-orm.md)               | Choose Prisma as ORM instead of TypeORM                                    | Accepted   |
| [0002](0002-linear-lam-nguon-su-that.md)          | Linear is the single source of truth for tasks, with native integration with GitHub/Slack     | Accepted   |
| [0003](0003-trunk-based-mot-lesson-mot-pr.md)     | Trunk-based development: one lesson per PR                             | Accepted   |
| [0004](0004-mcp-single-writer-cho-coder-agent.md) | Claude Code is the single-writer MCP; coder agent only receives SPEC.md         | Accepted   |
| [0005](0005-coder-agent-mo-pr-rieng-vao-main.md)  | Coder agent opens separate PRs to main (replaces decision #5 from ADR-0003) | Accepted   |

## Template

Copy this block when writing a new ADR:

```markdown
# ADR-NNNN: <Tiêu đề ở thể mệnh lệnh>

- **Trạng thái:** Proposed | Accepted | Deprecated | Superseded by ADR-XXXX
- **Ngày:** YYYY-MM-DD
- **Người quyết định:** <tên>

## Bối cảnh

Tình huống và ràng buộc dẫn tới việc phải quyết định. Có vấn đề gì cần giải?

## Quyết định

Chúng ta sẽ làm gì. Viết dứt khoát, ở thể chủ động.

## Các phương án đã cân nhắc

| Phương án | Ưu  | Nhược | Vì sao không chọn |
| --------- | --- | ----- | ----------------- |

## Hệ quả

**Tích cực:** ...
**Tiêu cực / cái giá phải trả:** ...
**Cần làm tiếp:** ...
```

---

<!-- CO-OP TRANSLATOR DISCLAIMER START -->
**Disclaimer**:
This document has been translated using AI translation service [Co-op Translator](https://github.com/Azure/co-op-translator). While we strive for accuracy, please be aware that automated translations may contain errors or inaccuracies. The original document in its native language should be considered the authoritative source. For critical information, professional human translation is recommended. We are not liable for any misunderstandings or misinterpretations arising from the use of this translation.
<!-- CO-OP TRANSLATOR DISCLAIMER END -->