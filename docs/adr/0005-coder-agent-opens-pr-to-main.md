# ADR-0005: Coder agent branches open separate PRs directly to main (replaces decision #5 of ADR-0003)

- **Status:** Accepted
- **Date:** 2026-08-11
- **Decision maker:** Hien Duong

## Context

ADR-0003, decision #5: _"Agent branches (`codex/...`) merge into the **lesson branch**, not directly into `main`"_ — this design was correct at the time for a single fixed Coder (codex) serving as the "reference solution" for each lesson.

[ADR-0004](0004-mcp-single-writer-for-coder-agent.md) (2026-08-11) switched to a **flexible Coder role model**: multiple tools (codex, opencode, Hermes...) can all take on the Coder role, each tool works on its own branch named after the tool itself, and all output must go through a PR; layer-1 code review by Copilot CLI (automated), lead review + merge by the user. Under the new model, decision #5 of ADR-0003 is no longer appropriate:

- **The lesson branch is where learners do hands-on practice.** Mixing Coder agent code into it pollutes the learning history and the comparison log `docs/lessons/_agent-log.md` (you can no longer tell which parts belong to the learner and which belong to the agent).
- **There is no way to identify which "lesson branch" to use** when multiple tools are all taking on the Coder role (each tool has its own separate branch).
- **We need a single, consistent review point** for all tools: separate PR → Copilot CLI review (layer 1) → user lead review → **squash merge by the user**.

## Decision

1. Coder agent branches (`codex/...`, `opencode/...`, etc.) always open **separate PRs directly to `main`**. The only exception is when a lesson requires a "reference solution" and the lesson's SPEC.md explicitly states the merge target — in that case, merge into the lesson branch as a documented exception.
2. All Coder agent PRs must go through automated review (Copilot CLI) + the user's lead review before merging — **only the user merges**. This maintains the principle that "no agent reviews its own code".
3. Decision #5 of ADR-0003 is replaced by this ADR. Decisions 1–4 of ADR-0003 (trunk-based development, one lesson per PR, squash merge, branch protection) remain in effect.

## Considered Options

| Option                                    | Pros                                                             | Cons                                                                                                            | Reason not selected                           |
| ----------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Merge into lesson branch (ADR-0003 #5)    | Reference solution is placed right next to learner code          | Pollutes lesson history; unclear which "lesson branch" to use when multiple tools are present; off-track review | Conflicts with ADR-0004                       |
| **Separate PR to main** _(selected)_      | Single review point; clean main history; applicable to all tools | Each reference solution requires an additional PR                                                               | —                                             |
| Direct commit to lesson branch, no review | Fastest                                                          | Violates the principle that "no agent reviews its own code"                                                     | Loses the core value of high-quality learning |

## Consequences

**Positive**

- Consistent review process for all tools — Claude Code is always the final checkpoint before agent code is merged into `main`.
- The history of `main` and lesson branches reads like learning documentation, with no mixed-in agent code.

**Trade-offs**

- Obtaining a reference solution requires opening an additional separate PR. This is acceptable: the PR is where review takes place, so this is not a dead cost.

**Next Steps**

- Review `docs/workflow/WORKFLOW.md` and `AGENT-MODEL.md` to remove any remaining descriptions of the "merge into lesson branch" flow.

---

<!-- CO-OP TRANSLATOR DISCLAIMER START -->

**Disclaimer**:
This document has been translated using AI translation service [Co-op Translator](https://github.com/Azure/co-op-translator). While we strive for accuracy, please be aware that automated translations may contain errors or inaccuracies. The original document in its native language should be considered the authoritative source. For critical information, professional human translation is recommended. We are not liable for any misunderstandings or misinterpretations arising from the use of this translation.
<!-- CO-OP TRANSLATOR DISCLAIMER END -->
