# Closeout L01–L03 One-Time Exception Plan

> **For Hermes:** Execute only under the user's explicitly approved one-time exception in this session.

**Goal:** Resolve all verified L01–L03 learning, tracking, bilingual, tag, and workflow inconsistencies so the repo can proceed to L05 with a clean completion gate.

**Architecture:** Claude Code (mentor/PM and Linear/Notion/Slack single-writer) performs the approved lesson-note, learner-work substitute, tracking, and EN mirror mutations in isolated VN/EN branches. Hermes independently verifies every diff, command, remote ref, tag, Linear read-back, parity scan, and cleanup state. User remains the only merger.

**Scope:** L01, L02, L03 only; no rewrite of historical commits or PR #60 review history. Explicitly record that hands-on/quiz evidence is execution substituted by Hermes/Claude under a one-time exception, not personal user execution.

## Tasks

1. Audit current files and Linear baseline; record exact issue/child states and refs.
2. Execute L01 hands-on checks: start/build/production/PORT/platform typing/DI failure, capture real outputs without secrets.
3. Fill L01 Vietnamese note with substituted-execution disclaimer, evidence, quiz answers, objectives, and key points.
4. Execute L02 verification and record the substituted review/quiz status without claiming personal authorship.
5. Fill L03 hands-on around the existing custom-provider/injection-scope reference, run tests/API checks, record evidence and quiz answers with disclaimer.
6. Update ROADMAP L01/L02/L03 and fix EN L00 parity.
7. Backfill `_agent-log.md` for missing L03/L04 workflow milestones.
8. Update Linear parent/child tracking only within L01–L03: complete relevant review/hands-on children and resolve stale DoD checklists; preserve unrelated fields.
9. Create missing lightweight `lesson/03` tag at the verified L03 completion commit using the repo's documented tool. Do not rewrite `lesson/04` history; if tag type consistency requires recreation, propose separately and avoid destructive tag mutation.
10. Mirror docs to `example/nestjs-training`, verify EN scan and source/test parity, then sync GitLab EN with required author/no-trailer constraints.
11. Open separate VN/EN PRs with `Fixes NES-2`, `Fixes NES-3`, and/or `Fixes NES-4` as appropriate; do not merge.
12. Verify independently: full raw diff, `pnpm verify`, lesson CLI for 01–04, tag ancestry, Linear read-back, GitHub PR/CI/open-PR state, GitLab parity/author/scan, and clean worktrees.

## Constraints

- No secrets/.env.
- No historical rewrite, force push, or merge.
- No unrelated inherited cleanup.
- Do not claim user personally did hands-on/quiz.
- Keep `.hermes/runs/*.json` local-only.
- User must review and merge PRs.

## Verification

- `pnpm verify` on VN and EN branches.
- `pnpm lesson 01`, `pnpm lesson 02`, `pnpm lesson 03`, `pnpm lesson 04`.
- `src/test` parity VN↔EN.
- EN diacritic scan = 0.
- GitLab EN tree parity and author `hienduong-agility`, no `Co-authored-by`.
- Linear parent/child read-back and ROADMAP alignment.
- `git status` clean; no open PR claim until verified.
