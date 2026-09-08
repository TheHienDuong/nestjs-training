## Fixes NES-126

### Scope

- [ ] This merge request stays within the assigned issue scope.
- [ ] Source and test behavior are unchanged unless explicitly required.
- [ ] No Prisma schema, migration, seed, dependency, or repository setting changes are included without justification.

### Evidence

Describe the files changed and the behavior or governance outcome they establish.

### Verification

Record the commands run and their results. Include any command that could not be run and why.

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm exec eslint "{src,apps,libs,test,scripts,prisma}/**/*.ts" --max-warnings=0`
- [ ] `pnpm exec prettier --check "src/**/*.ts" "test/**/*.ts" "scripts/**/*.ts" "docs/**/*.md" "*.md" "*.json" "*.yml" "*.mjs"`
- [ ] `pnpm test`
- [ ] `pnpm build`

### Review and approval

- Reviewer:
- [ ] Reviewer feedback has been addressed or explicitly accepted.
- [ ] Required code-owner approval is present.
- [ ] The user has completed the final review and is the only person who merges.

### No-secret checklist

- [ ] No passwords, tokens, private keys, credentials, or real environment values are committed.
- [ ] New configuration uses safe placeholders in `.env.example` when applicable.
- [ ] Logs, screenshots, and evidence contain no secrets.
