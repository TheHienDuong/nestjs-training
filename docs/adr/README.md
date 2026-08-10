# 📐 Architecture Decision Records (ADR)

## What is an ADR?

An ADR is **a short Markdown file that records an important technical decision and the reasoning behind it**. Michael Nygard proposed the idea in 2011, and it is now a common practice among backend teams.

## Why does a learning project also need ADRs?

Because the hardest question when returning to a codebase after 6 months is not _"what does this code do?"_ — reading the code answers that. The hard question is _**"why was it done this way instead of another way?"**_

Code only records the **outcome** of a decision. It does not record rejected options, constraints at the time, or accepted trade-offs. Without ADRs, two things will happen:

1. A future contributor (including you) reverses a correct decision without knowing its rationale
2. The entire team debates the same issue that was settled six months earlier

For you, ADRs have another specific value: **writing an ADR forces you to articulate the reason for a choice**. If you cannot write an ADR for a decision, it is usually because you do not yet truly understand why you chose it. This is one of the clearest differences between a junior and a senior — not knowing more, but **knowing what is being traded for what**.

## Conventions

- Naming: `NNNN-mo-ta-ngan.md`, use sequential numbers and never reuse an old number
- **ADRs are immutable:** once merged, do not edit the content. If the decision changes, write a new ADR and mark the old ADR as `Superseded by ADR-NNNN`
- Status: `Proposed` → `Accepted` → `Deprecated` / `Superseded`
- Keep it short: one page is enough

## List

| #                                             | Decision                                                                       | Status   |
| --------------------------------------------- | ------------------------------------------------------------------------------ | -------- |
| [0001](0001-choose-prisma-as-orm.md)          | Choose Prisma as the ORM instead of TypeORM                                    | Accepted |
| [0002](0002-linear-as-source-of-truth.md)     | Linear is the source of truth for tasks, with native GitHub/Slack integrations | Accepted |
| [0003](0003-trunk-based-one-lesson-one-pr.md) | Trunk-based development: one lesson per PR                                     | Accepted |

## Template

Copy this block when writing a new ADR:

```markdown
# ADR-NNNN: <Title in the imperative form>

- **Status:** Proposed | Accepted | Deprecated | Superseded by ADR-XXXX
- **Date:** YYYY-MM-DD
- **Decision maker:** <name>

## Context

The situation and constraints that require a decision. What problem needs to be solved?

## Decision

What we will do. Write decisively in the active voice.

## Options considered

| Option | Advantages | Disadvantages | Why it was not chosen |
| ------ | ---------- | ------------- | --------------------- |

## Consequences

**Positive:** ...
**Negative / trade-offs:** ...
**Follow-up work:** ...
```
