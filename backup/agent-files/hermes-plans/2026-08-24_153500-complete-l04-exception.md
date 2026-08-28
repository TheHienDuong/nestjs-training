# Complete L04 Workflow Plan

> One-time user-approved exception: Hermes may execute the remaining L04 hands-on/review workflow for this session only.

**Goal:** Close the remaining NES-5/L04 workflow without leaving GitHub, GitLab, Linear, ROADMAP, tag, or lesson-review state inconsistent.

**Scope:** Execute the existing L04 reference API checks; fill the lesson hands-on/quiz evidence; update only the lesson progress artifacts and Linear child state required by the verified DoD; create `lesson/04` only after verification.

## Current context

- GitHub PRs #69/#70/#71 merged.
- GitLab EN mirror is parity with `origin/example/nestjs-training`.
- Linear `NES-5` is `Done`; `NES-46` is `In Progress`.
- `docs/ROADMAP.md` still marks L04 `⬜`.
- L04 lesson note still has hands-on and quiz placeholders.

## Steps

1. Inspect package scripts and Tasks controller/service/module/tests; do not invent routes.
2. Start the existing Nest app in a tracked-safe process and exercise the five CRUD routes with real HTTP calls, including error behavior. Capture output locally.
3. Run `pnpm verify` and confirm the reference implementation remains green.
4. Update `docs/lessons/04-modules/README.md` hands-on and quiz sections with verified evidence/answers, preserving the lesson's Vietnamese style and existing teaching scope.
5. Update `docs/ROADMAP.md` L04 to `✅` only after steps 2–4 pass.
6. Run formatting, verify, and bilingual/parity/EN scan checks. Mirror the resulting docs-only changes to `origin/example/nestjs-training` only if required by the repo bilingual policy; do not alter `src/` or `test/`.
7. Update Linear `NES-46` to `Done` and verify `NES-5` remains consistent.
8. Create `lesson/04` at the verified main lesson commit, then verify tag and remote state.
9. Re-run GitHub/GitLab/Linear/repo-clean checks and remove temporary processes/worktrees.

## Validation

- `pnpm verify`
- Five CRUD route calls and error cases recorded from the running app.
- `git diff --check`
- `src/` and `test/` parity unchanged.
- EN docs contain no Vietnamese diacritics.
- GitLab tree remains identical to GitHub EN branch after any mirror update.
- Linear `NES-46` Done; `NES-5` unchanged except any explicitly verified integration timestamp.
- `lesson/04` points at the intended merged lesson commit.

## Risks

- The learning rule normally reserves hands-on/quiz for the user; this execution is a one-session explicit exception and must not become a default.
- Linear parent may have been auto-closed by GitHub integration before quiz completion; do not silently rewrite parent state.
- GitHub EN mirror changes require a separate PR if the VN lesson note is changed on `main`; never push directly to protected branches.
- Slack/Notion connector availability must be reported honestly if still unavailable.
