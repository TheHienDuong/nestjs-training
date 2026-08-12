---
name: sync-progress
description: Sync learning progress after merging a lesson — update ROADMAP.md, push knowledge notes to the Notion hub, send learning digest to Slack #nestjs-training. Only handles what Linear integration does not do automatically. Use when the user says "sync progress", "/sync-progress", "update progress", or immediately after merging a lesson PR.
---

# sync-progress

Sync the progress parts that **native integrations don't handle**.

## Why this skill exists — and its most important boundary

Per `docs/adr/0002-linear-as-source-of-truth.md`, Linear is the single source of truth for task status, and it **automatically** updates status via GitHub integration, **automatically** sends notifications via Slack integration.

> ⚠️ This skill **must not** update the status of issues on Linear.
> Doing so creates a second source of truth — exactly what ADR-0002 aims to avoid.

This skill only handles three things that integrations can't do:

1. `docs/ROADMAP.md` — offline-readable roadmap reference
2. **Notion hub** — aggregated knowledge base for cross-lesson lookup
3. **Learning digest for Slack** — completely different from Linear notifications: Linear alerts with _"NES-12 is Done"_, the digest reports _"what was learned, what's still blocked"_

## Step 1 — Identify the just-completed lesson

```bash
git log main --oneline -5
gh pr list --state merged --limit 3
```

Confirm with the user which lesson needs to be synced before writing anything.

## Step 2 — Verify Linear has automatically updated the statusRead the issue via Linear MCP.

- If it is marked **Done** → great, the integration is working correctly. Proceed.
- If it is still **In Progress** → the integration is not running. **Do not fix it manually without notifying anyone.** Alert the user and diagnose the root cause:
  - Does the branch name contain `nes-XX`? (this is the most common cause)
  - Does the PR description include `Fixes NES-XX`?
  - Is the GitHub integration enabled in Linear Settings?

This information is useful: knowing why the integration is broken is far more valuable than covering up the issue with a one-off manual update.

## Step 3 — Update ROADMAP.md
Replace ⬜/🟦 with ✅ on the corresponding lesson line. If it is the last lesson of the phase, check if a retro already exists (`docs/lessons/_retros/phase-X.md`) — if not, remind the user to write it following the `docs/templates/retro.md` template.

## Step 4 — Push knowledge to Notion
Use the `notion-knowledge-router` skill to respect the user's existing note structure (do not invent your own schema).
The content pushed should be a **summary**, not a full copy of the lesson note:
- **🧠 Key takeaways** section (maximum 5 lines)
- **🔗 Connections to prior knowledge** table
- Misconceptions identified during the review step
- Link to the lesson note on GitHub for full details

Notion serves as a **quick, cross-lesson reference**; full details and code remain in the repo, which has version control.

## Step 5 — Post learning digest to Slack
Send to the `#nestjs-training` channel:
```
✅ LXX — <Lesson name>  ·  NES-XX  ·  <PR link>

🧠 Key learnings
• <2-3 key points>

🔗 Connections to prior knowledge
• <one sentence>
```⚠️ Still unclear
• <or "none">

▶️ Next: LYY — <name>
```
This digest **supplements** Linear's notifications, it does not replace them. Linear tells you _what_ is completed; the digest tells you _what was learned_.

## Step 6 — Suggest next lesson
```

Read `docs/ROADMAP.md`, find the first ⬜ lesson, suggest the user type `/lesson-start LYY`.

If you just finished Phase 3 and have never run `/graphify`: suggest building a knowledge graph from notes — by this point, you have enough notes to ask meaningful cross-document questions.

## Boundaries

- **Do not** update the status of Linear issues (see the warning at the top of the file).
- **Do not** send to Slack before confirming the PR has actually been merged.
- **Do not** edit the content of lesson notes — only read them to compile the digest.
- Keep the digest concise. A Slack channel full of text is a channel no one reads.