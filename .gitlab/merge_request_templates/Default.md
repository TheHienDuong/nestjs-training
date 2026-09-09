## Summary

Describe the problem and the outcome of this change.

## Tracking

- GitLab issue: `#<issue-number>`
- Linear issue: `NES-<issue-number>`
- GitLab issue reference in this description: `Relates to #<issue-number>` or `Closes #<issue-number>`
- Keep the GitLab and Linear identifiers in the MR description and commit history.

## Scope

### In scope

- List the files, behavior, or configuration changed.

### Out of scope

- List related work intentionally deferred from this merge request.

## Implementation notes

Explain the key decision, compatibility impact, and any migration or rollout requirement.

## Verification

Record the commands run and their results. Explain every command that could not be run.

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm lint`
- [ ] `pnpm exec prettier --check "src/**/*.ts" "test/**/*.ts" "prisma/*.ts" "*.md" "*.json" "*.yml"`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] `pnpm test:e2e` when the change affects runtime behavior or persistence
- [ ] `git diff --check`

## Risks and rollback

- Risk: describe the user or operational impact.
- Rollback: describe the reversible rollback step.

## Branch and review approval

- Source branch was created from `feat/practice-one`.
- Target branch is `feat/practice-one`.
- Reviewer:
- [ ] Required Code Owner approval is present.
- [ ] The project owner completed the final review and is the only person who merges the merge request.

## Security checklist

- [ ] No passwords, tokens, private keys, credentials, or real environment values are committed.
- [ ] New configuration uses safe placeholders in `.env.example` when applicable.
- [ ] Logs, screenshots, and evidence contain no secrets.
