<!--
This template automatically appears every time you open a PR.
Why it's needed: The PR description is what reviewers (and you yourself 6 months later) read BEFORE reading the code.
A PR with no description forces readers to infer intent from the diff — which is very easy to get wrong.
-->

## Lesson / Task

<!-- REQUIRED: The line below is what causes Linear to automatically move the issue to Done when the PR is merged.
     Write the wrong code or delete this line -> you lose automation, and no error notifications will be sent. -->

Fixes NES-XX

## What I did

<!-- 2-4 bullet points. Write at the INTENT level, don't just list the diff.
     Good:  "Add TasksService to store in-memory data to separate logic from the controller"
     Bad:  "Add tasks.service.ts file, modify tasks.controller.ts" -->

-

## What I learned

<!-- This section is specific to this repo. What new things did you understand, or what did you used to misunderstand? -->

-

## How to verify

<!-- Others must be able to reproduce this. Write specific commands. -->

```bash
pnpm install
pnpm start:dev
# curl ...
```

## Checklist

- [ ] `pnpm lint` runs clean (no errors)
- [ ] `pnpm test` passes
- [ ] `pnpm build` succeeds
- [ ] Lesson notes have been updated (includes both **Connection to prior knowledge** and **Sources** sections)
- [ ] Passed the quiz at the `/lesson-review` step
- [ ] No secrets / `.env` files committed
- [ ] Have re-read my own diff once

## Notes for reviewers

<!-- Where are you not confident? Where do you want detailed feedback? Mention these so reviewers can focus on the areas that need it. -->