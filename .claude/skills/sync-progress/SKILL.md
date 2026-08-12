---
name: sync-progress
description:
  Synchronize learning progress after merging a lesson — update ROADMAP.md,
  push knowledge notes to the Notion hub, send learning digest to Slack
---

# sync-progress

Sync progress parts that **native integrations can't handle**.

## Why you need this skill — and its most important boundary

As per `docs/adr/0002-linear-lam-nguon-su-that.md`, Linear is the single source of truth for task status, and it **automatically** updates status via GitHub integration, **automatically** sends notifications via Slack integration.

> ⚠️ This skill **does not** update Linear issue status.
> Doing that would create a second source of truth — exactly what ADR-0002 aims to avoid.

This skill only handles three things that integrations can't do:

1. `docs/ROADMAP.md` — offline-readable roadmap
2. **Notion hub** — consolidated knowledge base, cross-lesson lookup
3. **Learning digest for Slack** — completely different from Linear notifications: Linear alerts you that _"NES-12 is Done"_, the digest tells you _"what you learned, what's still stuck"_

## Step 1 — Identify the just-completed lesson

```bash
git log main --oneline -5
gh pr list --state merged --limit 3
```

Confirm with the user which lesson needs syncing before writing anything.

## Step 2 — Verify Linear has automatically updated the status

Read the issue via Linear MCP.

- Status is **Done** → great, the integration is working correctly. Move on.
- Still **In Progress** → the integration isn't running. **Don't silently fix it manually.** Alert the user and diagnose the root cause:
  - Does the branch name contain `nes-XX`? (most common cause)
  - Does the PR description include `Fixes NES-XX`?
  - Is the GitHub integration enabled in Linear Settings?

  This information is useful: knowing why the integration is broken is more valuable than covering it up with a manual status update.

## Step 3 — Update ROADMAP.md

Change ⬜/🟦 → ✅ on the corresponding lesson line. If it's the last lesson of a phase, check if a retro exists (`docs/lessons/_retros/phase-X.md`) — if not, remind the user to write one following `docs/templates/retro.md`.

## Step 4 — Push knowledge to Notion

Use the `notion-knowledge-router` skill to respect the user's existing note structure (don't invent your own schema).

The content pushed is a **consolidated summary**, not a full copy of the lesson note:

- **🧠 Key takeaways** section (max 5 lines)
- **🔗 Connections to prior knowledge** table
- Misconceptions identified during the review step
- Link to the lesson note on GitHub for full details

Notion serves as a **fast, cross-lesson lookup tool**; full details and code stay in the repo, where version control is in place.

## Step 5 — Send learning digest to Slack

Send to `#nestjs-training`:

```
✅ LXX — <Lesson name>  ·  NES-XX  ·  <PR link>

🧠 What I learned
• <2-3 key points>

🔗 Connection to prior knowledge
• <one sentence>

⚠️ Still unclear
• <or "none">

▶️ Next: LYY — <name>
```

This digest **supplements** Linear's notifications, it doesn't replace them. Linear tells you _what_ is done; the digest tells you _what you learned_.

## Step 6 — Suggest the next lesson

Read `docs/ROADMAP.md`, find the first ⬜ lesson, suggest the user type `/lesson-start LYY`.

If you just finished Phase 3 and have never run `/graphify`: suggest building a knowledge graph from the notes — by this point there are enough notes to make cross-document queries meaningful.

## Boundaries

- **Do not** update Linear issue status (see the warning at the top of the file).
- **Do not** send Slack messages before confirming the PR has actually been merged.
- **Do not** edit lesson note content — only read it to create summaries.
  Keep digests short. A Slack channel full of text is one no one reads.

---

<!-- CO-OP TRANSLATOR DISCLAIMER START -->

**Disclaimer**:
This document has been translated using AI translation service [Co-op Translator](https://github.com/Azure/co-op-translator). While we strive for accuracy, please be aware that automated translations may contain errors or inaccuracies. The original document in its native language should be considered the authoritative source. For critical information, professional human translation is recommended. We are not liable for any misunderstandings or misinterpretations arising from the use of this translation.
<!-- CO-OP TRANSLATOR DISCLAIMER END -->
