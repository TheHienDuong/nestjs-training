## Summary

Describe the scope of the change.

## Evidence

Describe the behavior, configuration, or documentation outcome.

## Verification

Record the commands run and their results. Explain any command that could not be run.

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm exec eslint "{src,apps,libs,test,prisma}/**/*.ts" --max-warnings=0`
- [ ] `pnpm exec prettier --check "src/**/*.ts" "test/**/*.ts" "prisma/*.ts" "*.md" "*.json" "*.yml"`
- [ ] `pnpm test`
- [ ] `pnpm build`

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
