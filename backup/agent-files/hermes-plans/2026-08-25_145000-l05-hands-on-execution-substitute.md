# L05 Hands-on Execution Substitute — NES-6

## Scope

User explicitly authorizes Hermes to execute the L05 hands-on as a one-time substitute because the user is busy. The work must be disclosed as execution substitute, not represented as user-authored learning evidence.

## Baseline

- Linear parent: NES-6, currently In Progress.
- Children: NES-57, NES-60, NES-65 remain Backlog until their evidence gates are met.
- Contract: retain `completed: boolean`; do not introduce a status enum without user approval.
- Lesson docs/SPEC exist on `duongthehien2001/nes-6-l05-dto-pipes-validationpipe`.

## Execution waves

1. Commit lesson-start docs only with Hermes attribution; preserve source/test baseline.
2. Dispatch Codex Coder on `codex/nes-6-dto-pipes-validation` from that docs commit. Scope: dependencies, DTO decorators, global ValidationPipe effective in runtime/e2e, value imports, custom pipe + tests, invalid DTO 400 tests. No docs/Linear mutation.
3. Independently verify raw diff, `pnpm verify`, e2e, and HTTP smoke behavior.
4. Dispatch Claude local review of Codex diff; correct only approved blockers.
5. Open PR with `Fixes NES-6`, but do not merge. User must merge.
6. After user merge: verify GitHub/CI, then use Claude Linear MCP to complete NES-60/NES-65 and relevant parent checklists, update bilingual docs/ROADMAP/tag/GitLab only after evidence gates. Keep quiz answers and execution-substitute disclosure explicit.

## Forbidden

- No direct push to main.
- No merge by Hermes.
- No silent enum contract change.
- No claiming the user performed hands-on.
- No Linear completion before PR merge and review/quiz evidence.
