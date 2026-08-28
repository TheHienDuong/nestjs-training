# Verify Learning Objectives and Close Linear Goal Checklists

> **For Hermes:** Execute only after the user explicitly requested this workflow closeout.

**Goal:** Verify that L01–L04 learning objectives are backed by real source code, tests, lesson evidence, and tags before checking Linear goal checklists.

## Scope

- L01: project/bootstrap/platform adapter.
- L02: controllers/routing/CRUD route decorators and parameter handling.
- L03: providers/DI/custom provider/injection scope.
- L04: modules/dynamic module/Tasks CRUD in-memory.
- Linear goal checklists for NES-2, NES-3, NES-4, NES-5.

## Procedure

1. Read lesson README/SPEC objective checklists and map each objective to exact files/tests/docs.
2. Inspect source and tests; run `pnpm verify`, targeted tests/e2e, and `pnpm lesson 01..04`.
3. If any objective lacks real code, stop and create a separate implementation branch using the hard-routed Coder agent (codex), with SPEC-bounded changes, PR, CI, and user merge gate. Do not mark that objective complete before merge.
4. If all objectives have real evidence, dispatch Claude read-only/mutation scope to check only the verified goal checklist items in Linear; preserve title, state, assignee, labels, parent, and DoD fields.
5. Read back all Linear mutations and independently verify repository/remote state.
6. Do not touch NES-46 or unrelated issues unless evidence shows a direct inconsistency.
7. No secrets, force-push, history rewrite, or merge by Hermes.

## Acceptance

- Every checked objective maps to real committed code/tests/docs.
- No missing implementation hidden by a checklist update.
- `pnpm verify` pass; lesson CLI 01–04 pass; tags and parity remain valid.
- Linear goal checklists read back as checked, with no unrelated field changes.
- GitLab EN remains parity with GitHub EN and EN scan stays clean.
- Repo/worktrees clean; user remains the only merger for any new PR.
