# ADR-0005: Coder agent branches open separate PRs to main (replacing decision #5 of ADR-0003)

- **Status:** Accepted
- **Date:** 2026-08-11
- **Decision maker:** Hien Duong

## Context

ADR-0003, decision #5: _"Agent branches (`codex/...`) merge into **branch lesson**, not directly into `main`"_ — this design was correct at the time for a single fixed Coder (codex) serving as the "reference solution" for each lesson.

[ADR-0004](0004-mcp-single-writer-for-coder-agent.md) (2026-08-11) switched to the **flexible Coder role model**: multiple tools (codex, opencode, Hermes...) can all take on the Coder role, each tool works on its own branch named after the tool itself, and all output must go through a PR for Claude Code (acting as the Reviewer) to review. With this new model, decision #5 of ADR-0003 is no longer appropriate:

- **branch lesson is where learners do hands-on practice.** Merging Coder agent code into it pollutes the learning history and the comparison log `docs/lessons/_agent-log.md` (it is no longer possible to distinguish which parts are from the learner and which are from the agent).
- **There is no way to identify which "branch lesson" to use** when multiple tools are all acting as the Coder (each tool has its own separate branch).
- **A single, consistent review point is needed** for all tools: separate PR → Claude Code (or user) review → squash merge into `main`.

## Decision1. Branches of the Coder agent (`codex/...`, `opencode/...`, ...) always open **separate PRs directly to `main`**. The only exception: when a lesson requires a "reference solution" and the lesson's SPEC.md explicitly specifies the merge target — in that case, merge into the lesson branch as a documented exception.
2. All PRs from the Coder agent must be reviewed by Claude Code or the user before merging — retain the principle that "no agent reviews its own code".
3. Decision #5 of ADR-0003 is replaced by this ADR. Decisions 1–4 of ADR-0003 (trunk-based, one lesson per PR, squash merge, branch protection) remain unchanged.

## Considered Options

| Option                                    | Pros                                                                | Cons                                                                                | Reason for rejection                      |
| ------------------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------ |
| Merge into lesson branch (ADR-0003 #5)     | Reference solution is located right next to the learner's code       | Pollutes lesson history; unclear which "lesson branch" to use with multiple tools; out-of-order review | Conflicts with ADR-0004                 || **Dedicated PR to main** _(selected)_            | Single review checkpoint; clean main history; applies to all tools | Each reference solution requires an additional separate PR                                              | —                                      |
| Direct commit to lesson branch, no review | Fastest | Violates the rule 'no agent reviews its own code' | Loses the highest-value learning benefit entirely |

## Consequences

**Positive**

- Consistent review process for all tools — Claude Code is always the final checkpoint before agent code is merged into `main`.

**Tradeoffs**

- To obtain a reference solution, an additional separate PR must be opened. Acceptable: the main PR is where review occurs, so this is not a fatal cost.

**Next Steps**

- Review `docs/workflow/WORKFLOW.md` and `AGENT-MODEL.md` to ensure no remaining sections describe the flow of 'merging into the lesson branch'.