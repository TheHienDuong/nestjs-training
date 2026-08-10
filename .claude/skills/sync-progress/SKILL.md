---
name: sync-progress
description: Synchronize learning progress after merging a lesson — update ROADMAP.md, publish the knowledge note to the Notion hub, and send a learning digest to Slack #nestjs-training. Handle only what the Linear integration does not do automatically. Use when the user says "sync progress", "/sync-progress", "update progress", or immediately after merging a lesson PR.
---

# sync-progress

Synchronize the progress information that **native integrations do not handle**.

## Why this skill is needed — and its most important boundary

According to `docs/adr/0002-linear-as-source-of-truth.md`, Linear is the sole source of truth for task status; it **automatically** transitions status through the GitHub integration and **automatically** sends notifications through the Slack integration.

> ⚠️ This skill **must not** update issue status in Linear.
> Doing so creates a second source of truth — exactly what ADR-0002 seeks to avoid.

This skill covers only three things the integrations cannot do:

1. `docs/ROADMAP.md` — a projection for offline reading
2. **Notion hub** — consolidated knowledge for cross-lesson lookup
3. **Slack learning digest** — completely different from Linear notifications: Linear reports _"NES-12 is Done"_, the digest says _"what was learned and what remains difficult"_

## Step 1 — Identify the completed lesson

```bash
git log main --oneline -5
gh pr list --state merged --limit 3
```

Confirm with the user which lesson needs synchronization before writing anything.

## Step 2 — Verify that Linear transitioned status automatically

Read the issue through Linear MCP.

- Already **Done** → good, the integration works correctly. Continue.
- Still **In Progress** → the integration has not run. **Do not silently update it manually.** Inform the user and diagnose the cause:
  - Does the branch name contain `nes-XX` ? (the most common cause)
  - Does the PR description contain `Fixes NES-XX`?
  - Is the GitHub integration enabled in Linear Settings?

  This is useful information: knowing why an integration failed is more valuable than hiding it with a manual update.

## Step 3 — Update ROADMAP.md

Change ⬜/🟦 → ✅ on the corresponding lesson row. If it is the final lesson of a phase, check whether a retro exists (`docs/lessons/_retros/phase-X.md`) — if not, remind the user to write one using `docs/templates/retro.md`.

## Step 4 — Publish knowledge to Notion

Use the `notion-knowledge-router` skill to respect the user's existing note structure (do not invent a schema).

Publish a **summary**, not a verbatim copy of the lesson note:

- **🧠 Key points to remember** section (maximum 5 lines)
- **🔗 Connections to prior knowledge** table
- Misconceptions discovered during review
- Link to the lesson note on GitHub for details

Notion provides **quick, cross-lesson lookup**; details + code remain in the repository under version control.

## Step 5 — Send the learning digest to Slack

Send to `#nestjs-training`:

```
✅ LXX — <Lesson name>  ·  NES-XX  ·  <link PR>

🧠 Learned
• <2-3 key points>

🔗 Connection to prior knowledge
• <one sentence>

⚠️ Still unclear
• <or "none">

▶️ Next: LYY — <name>
```

This digest **supplements** Linear notifications; it does not replace them. Linear says _what_ was completed; the digest says _what was learned_.

## Step 6 — Suggest the next lesson

Read `docs/ROADMAP.md`, find the first ⬜ lesson, and suggest that the user enter `/lesson-start LYY`.

If Phase 3 has just been completed and `/graphify` has never run, suggest building a knowledge graph from the notes — there are now enough notes for meaningful cross-document queries.

## Boundaries

- **Do not** update Linear issue status (see the warning at the top of the file).
- **Do not** send Slack messages before confirming that the PR was actually merged.
- **Do not** edit lesson note content — only read it to create the summary.
- Keep the digest concise. No one reads an overly verbose Slack channel.
