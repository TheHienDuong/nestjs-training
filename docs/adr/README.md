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
  > **Exception 2026-08-13 (ADR-0004):** amended in place per user decision — the ADR was only 2 days old (2026-08-11), no agent depends on it, and amending keeps the history clearer than a replacement ADR. From now on, changing an accepted ADR REQUIRES writing a new ADR marked `Superseded by ADR-NNNN`.
- Status: `Proposed` → `Accepted` → `Deprecated` / `Superseded`
- Keep it short: one page is enough

## List

| #                                                    | Decision                                                                                                             | Status                        |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| [0001](0001-choose-prisma-as-orm.md)                 | Choose Prisma as ORM instead of TypeORM                                                                              | Accepted                      |
| [0002](0002-linear-as-source-of-truth.md)            | Linear is the single source of truth for tasks, with native integration with GitHub/Slack                            | Accepted                      |
| [0003](0003-trunk-based-one-lesson-one-pr.md)        | Trunk-based development: one lesson per PR                                                                           | Accepted                      |
| [0004](0004-mcp-single-writer-for-coder-agent.md)    | Claude Code is the single writer for Notion/Slack/Postman; Linear is open to the coder agent; coder receives SPEC.md | Accepted (amended 2026-08-13) |
| [0005](0005-coder-agent-opens-pr-to-main.md)         | Coder agent opens separate PRs to main (replaces decision #5 from ADR-0003)                                          | Accepted                      |
| [0006](0006-herdr-pty-pane-bridge.md)                | Dispatch via the Herdr PTY-pane bridge (Hermes drives agents inside a terminal pane)                                 | Proposed                      |
| [0007](0007-claude-reviewer-local-multi-reviewer.md) | Claude Code takes back the Reviewer local role in the multi-reviewer model (revises the 2026-08-13/PR#24 decision)   | Proposed                      |
| [0008](0008-review-collector-mr.md)                  | The `mr/*` collector branch is a post-merge audit layer, not a replacement for ADR-0005                              | Proposed                      |

## Template

Copy this block when writing a new ADR:

```markdown
# ADR-NNNN: <Title in imperative form>

- **Status:** Proposed | Accepted | Deprecated | Superseded by ADR-XXXX
- **Date:** YYYY-MM-DD
- **Decision maker:** <name>

## Context

The situation and constraints leading to this decision. What problem needs solving?

## Decision

What we will do. Write it decisively, in the active voice.

## Alternatives considered

| Option | Pros | Cons | Why not chosen |
| ------ | ---- | ---- | -------------- |

## Consequences

**Positive:** ...
**Negative / cost paid:** ...
**Follow-up needed:** ...
```
