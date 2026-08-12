# ADR-0002: Linear is the single source of truth for tasks, with native integration with GitHub and Slack

- **Status:** Accepted
- **Date:** 2026-08-10
- **Decision maker:** Hien Duong

## Context

This learning project needs a place to manage ~26 lessons with full descriptions, organized by phase, with priorities and estimates. At the same time, the learner wants to get familiar with **the tools and workflows that a real backend team uses**, rather than just a TODO file.

There are 4 related systems: PM tool, GitHub (code + CI), Slack (notifications), Notion (knowledge base). The biggest risk of using multiple systems is **discrepant information** — a task may be marked as "in progress" while its PR was merged the previous week.

## Decision

1. **Linear is the single source of truth for task status.** No other system is considered authoritative for whether a lesson is completed or not.
2. Enable Linear's native **GitHub integration** and **Slack integration**. Task status updates are **driven by git events**, not manual input:
   - Creating a branch named after a Linear issue → the issue automatically moves to _In Progress_
   - A PR with `Fixes NES-XX` that is merged → the issue automatically moves to _Done_
3. The agent only automates the tasks that integration **cannot** handle: writing lesson notes, aggregating the Notion hub, and sending learning digests.
4. `docs/ROADMAP.md` is an offline projection (for offline reading), **not** the single source of truth.

## Considered Alternatives| Option                                   | Pros                                                                                                                                                                                    | Cons                                                                                     | Reason for not selecting                          |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **Linear + native integration** _(selected)_ | The Initiative→Project→Issue→Sub-issue model is sufficient to represent the curriculum; cycles show actual velocity; MCP is official so agents can create/update tasks; GitHub/Slack integration is native | Requires adding an account; free tier has limits                                                 | —                                          || **GitHub Issues + Projects v2**             | No external tools required; closest to PRs                                                                                                                                                  | Lacks standard cycles/estimates; does not offer a dedicated PM tool experience — something every company has | Misses part of the learning objective           |
| **Trello**                                  | Intuitive, easy to get started with                                                                                                                                                                 | No auto-transition based on PRs; no branch convention support; shallow integrations                  | Requires manual updates → guaranteed to fall out of sync      |
| **Notion database for project management**                  | Combines tasks and knowledge in one place                                                                                                                                                          | No proper Git integration; Notion excels at documentation, not issue tracking       | Use Notion for its core strengths: knowledge base |

## Outcomes

**Positive**

- No manual "task update" step → no risk of status falling out of sync. This is exactly why real teams invest in integrations instead of relying on the discipline to manually update tasks.- Learned an important reflex: **branch names and PR descriptions are data, not decorative text**. If you write them correctly, the entire system runs automatically.
- Have real personal metrics: how many points are completed per cycle, and how much the estimate deviates.

**The tradeoffs**

- Relies on correct branch naming. If you name it wrong → automation breaks, and there are no visible errors → hard to detect. This is clearly documented in [WORKFLOW.md](../workflow/WORKFLOW.md).
- The Linear free tier limits the number of open issues; if you hit the limit, create issues per phase instead of creating them all at once.
- Four systems are a lot for a single self-learner. This is acceptable, because experiencing multiple systems at the same time is one of the core goals.

**Next steps**

- Enable the GitHub + Slack integration in Linear Settings immediately after creating the repo and channel.
- The `/sync-progress` skill should only be used as a fallback, **not** to re-run the integration that has already been executed — running both will create two sources of truth, which is exactly what this ADR aims to avoid.