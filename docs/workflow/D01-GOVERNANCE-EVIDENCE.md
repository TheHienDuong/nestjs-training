# D01 Governance Evidence — Food Ordering REST API

This is the English-branch evidence record for NES-126 and NES-136–NES-143. It records repository facts and D01 decisions; it does not mark the Linear parent or learner-owned gate complete.

## Repository boundary (NES-136)

- Worktree: `/Users/hienduong/.herdr/worktrees/nestjs-example/codex-nes-126-d01-governance-environment`
- Branch: `codex/nes-126-d01-governance-environment`
- Approved baseline (`feat/practice-one`): `6c45555b9969c21fb1df98db2885292898e1879a`
- D01 commit is the current HEAD; its actual SHA is recorded in the completion report and sentinel produced with this commit.
- `origin`: GitLab `gitlab.asoft-python.com:hien.duong/nestjs-training.git` (daily learner work and human MRs).
- `github`: GitHub `github.com/TheHienDuong/nestjs-training.git` (integration, review, Actions, and automation).

`feat/practice-one` points at the same approved baseline, but its existing Task Management scaffold is unrelated to the Food Ordering practice's domain. It remains untouched and is not deleted or reused as a domain implementation; its files are useful only as the learning-project baseline and legacy context.

## Remote roles and bilingual policy (NES-137)

The verified remote roles above are the repository policy for this practice. Documentation/configuration follows the two-version rule: `main` is Vietnamese learner work and `example/nestjs-training` is the English mirror. Source and tests remain identical across the versions. GitLab accepts only the English mirror, and the GitLab MR URL is pasted into the matching Linear issue manually. GitHub PR linkage is native to the GitHub integration.

## GitHub controls (NES-138)

`.github/CODEOWNERS` exists and requires `@hienduong-agilityio` as the repository code owner. GitHub branch-protection enforcement is **unknown**: `gh auth status` reported invalid credentials for the available accounts, so the API/UI could not be inspected. No claim is made that protection is enabled. Owner: Hien Duong. Next check: re-authenticate `gh` and inspect the default-branch protection rules before the first GitHub PR/merge.

## Toolchain and baseline (NES-139)

Recorded on 2026-09-07: Node `v22.22.3`, pnpm `11.18.0`, Docker CLI `29.5.3`, Git `2.55.0`. `pnpm install --frozen-lockfile` passed. `pnpm build` passed. `pnpm test -- --runInBand` was attempted but failed before tests because Jest/Watchman could not change permissions under the user-local Watchman state directory; this is an environment permission issue, not a reported test assertion failure. Docker daemon checks are not applicable yet because the Docker CLI could not connect to its local socket; database/migration checks remain unverified and belong to D02.

The `pnpm verify` script runs the repository's lint, Prettier check, unit tests, and build sequence. Its final result is recorded in the completion report after this commit.

## Safe environment (NES-140)

`.env.example` contains only clearly fake local-development placeholders. `.env`, `.env.local`, and environment-specific local overrides remain ignored by `.gitignore`. `DATABASE_URL` targets the development database and `DATABASE_URL_TEST` targets the distinct `nestjs_training_test` database. The current application validates `NODE_ENV`, `PORT`, and `DATABASE_URL` at bootstrap; D01 documents the fail-fast expectation without adding a new runtime module. Real credentials must never be copied into `.env.example` or committed.

## Food Ordering boundary (NES-141)

See [ADR-0009](../adr/0009-food-ordering-module-boundary.md). No Prisma schema, migration, seed, or application module was changed in D01. The legacy Task Management schema remains intact. Its final fate is a learner-owned pending decision for D02.01, with no destructive cleanup authorized.

## Evidence convention (NES-142)

Each day has exactly one GitLab MR and, when GitHub integration is used, one corresponding GitHub PR. The MR/PR link, commit SHA, CI result, and blocker notes go in the day parent Linear issue's evidence comment. GitLab-to-Linear linkage is manual; GitHub PR linkage is native. Claude remains the single writer for Notion milestone notes.

Slack templates and dry-run placeholders:

```text
[Progress] NES-XXX — outcome: <one sentence>
Evidence: <Linear issue> | <GitLab MR placeholder> | <GitHub PR placeholder>
Blockers: none | <owner + next check date>
Next: <next learner action>
```

```text
[Blocker] NES-XXX — blocked by: <short cause>
Evidence: <command or link placeholder>
Owner: <name> | Next check: <YYYY-MM-DD>
Impact: <what cannot start>
```

```text
[Learning] D01 — concept: <remote roles / CODEOWNERS / env>
In my words: <learner explanation>
Evidence: <Linear issue/comment placeholder>
Question to revisit: <optional>
```

Notion dry-run: `Claude-owned milestone note → D01 → evidence index → <Linear/MR/PR placeholders>`. Codex does not write Notion or Slack.

## Governance gate (NES-143)

| Child   | Evidence state    | Blocker / next action                                                |
| ------- | ----------------- | -------------------------------------------------------------------- |
| NES-136 | Evidence prepared | Learner/Claude review and Linear evidence comment pending            |
| NES-137 | Evidence prepared | Learner/Claude review and Linear evidence comment pending            |
| NES-138 | Partial           | GitHub protection unknown until `gh` is re-authenticated             |
| NES-139 | Partial           | Jest blocked by local Watchman permission; Docker daemon unavailable |
| NES-140 | Evidence prepared | Learner/Claude review pending                                        |
| NES-141 | Evidence prepared | Learner must decide legacy-schema fate in D02.01                     |
| NES-142 | Evidence prepared | User approval of convention pending                                  |

NES-143 remains open: the learner's own quiz answers and user sign-off are required. NES-126 and NES-143 are not marked Done by this implementation.
