# 📐 Architecture Decision Records (ADR)
## What is an ADR?
An ADR is **a short markdown file that documents an important technical decision and the reasoning behind it**. The concept was proposed by Michael Nygard in 2011, and is now a common practice among backend teams.
## Why does a learning project also need ADRs?
Because the hardest question when returning to a codebase after 6 months is not _"what does this code do?"_ — you can answer that by reading the code. The hard question is _**"why was it done this way instead of another approach?"**_
Code only captures the **outcome** of a decision. It does not record the discarded options, the constraints at the time, or the tradeoffs that were accepted. Without ADRs, two things will happen:
1. Someone who comes later (even you yourself) will revert a correct decision because they don't know the reasoning behind it
2. The entire team will re-debate the exact same issue that was already settled six months ago
For you personally, ADRs also have unique value: **writing an ADR forces you to articulate the reasoning behind your choice**. If you can't write an ADR for a particular decision, it's usually because you don't truly understand why you chose that option. This is one of the clearest differences between junior and senior engineers — it's not about knowing more, but about **knowing exactly what tradeoffs you are making to get what you want**.
## Conventions
- Naming: `NNNN-short-description.md`, numbers increment sequentially, do not reuse old numbers
- **ADRs are immutable:** once merged, do not modify the content. If you change your mind, write a new ADR and mark the old ADR as `Superseded by ADR-NNNN`- Status: `Proposed` → `Accepted` → `Deprecated` / `Superseded`
- Keep it short: one page is enough

## List

| #                                                 | Decision                                                             | Status   |
| ------------------------------------------------- | ---------------------------------------------------------------------- | -------- |
| [0001](0001-choose-prisma-as-orm.md)               | Choose Prisma as ORM instead of TypeORM                               | Accepted |
| [0002](0002-linear-as-source-of-truth.md)          | Linear is the single source of truth for tasks, with native integration with GitHub/Slack | Accepted |
| [0003](0003-trunk-based-one-lesson-one-pr.md)     | Trunk-based development: one lesson per PR                             | Accepted |
| [0004](0004-mcp-single-writer-for-coder-agent.md) | Claude Code is the single-writer MCP; coder agent only receives SPEC.md | Accepted |
| [0005](0005-coder-agent-opens-pr-to-main.md)  | Coder agent opens separate PRs directly to main (replaces decision #5 from ADR-0003) | Accepted |

## Template

Copy this block when writing a new ADR:

```markdown
# ADR-NNNN: <Title in imperative form>

- **Status:** Proposed | Accepted | Deprecated | Superseded by ADR-XXXX
- **Date:** YYYY-MM-DD
- **Decision maker:** <name>

## Context
```Context and constraints leading to the need for a decision. What problem needs to be solved?

## Decision

What we will do. Write it definitively, in active voice.

## Considered Options

| Option | Pros | Cons | Reason for not selecting |
| --------- | --- | ----- | ----------------- |

## Consequences

**Positive:** ...
**Negative / price to pay:** ...
**Next steps:** ...
```