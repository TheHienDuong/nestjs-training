## Summary

Describe the change and its scope.

## Evidence

Describe the behavior, configuration, or documentation outcome.

## Verification

Record the commands run and their results. Include any command that could not be run and why.

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm exec prettier --check "src/**/*.ts" "test/**/*.ts" "prisma/*.ts" "*.md" "*.json" "*.yml"`
- [ ] `pnpm exec eslint "{src,apps,libs,test,prisma}/**/*.ts" --max-warnings=0`
- [ ] `pnpm exec jest --watchman=false`
- [ ] `pnpm build`

## Review and approval

- Reviewer:
- [ ] Required code-owner approval is present.
- [ ] The project owner has completed the final review and is the only person who merges.

## Security checklist

- [ ] No passwords, tokens, private keys, credentials, or real environment values are committed.
- [ ] New configuration uses safe placeholders in `.env.example` when applicable.
- [ ] Logs, screenshots, and evidence contain no secrets.
