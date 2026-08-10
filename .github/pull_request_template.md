<!--
This template appears automatically whenever you open a PR.
Why it is needed: the PR description is what the reviewer (and you six months later) reads BEFORE reading the code.
A PR without a description forces the reader to infer the intent from the diff — making incorrect assumptions very easy.
-->

## Lesson / Task

<!-- REQUIRED: the line below is what makes Linear automatically move the issue to Done when the PR is merged.
     Entering the wrong ID or deleting this line -> loses the automation, and there will be no error notification. -->

Fixes NES-XX

## What I changed

<!-- 2-4 bullet points. Describe the INTENT, not a repetition of the diff.
     Good: "Add TasksService with in-memory storage to separate logic from the controller"
     Poor: "Add tasks.service.ts, modify tasks.controller.ts" -->

-

## What I learned

<!-- A section specific to this repository. What did you understand for the first time, or what had you misunderstood? -->

-

## How to verify

<!-- Someone else must be able to reproduce it. Include specific commands. -->

```bash
pnpm install
pnpm start:dev
# curl ...
```

## Checklist

- [ ] `pnpm lint` is clean
- [ ] `pnpm test` pass
- [ ] `pnpm build` succeeds
- [ ] Lesson note is updated (including **Connection to existing knowledge** and **Sources**)
- [ ] Passed the quiz in `/lesson-review`
- [ ] No secrets / `.env` file committed
- [ ] Read through my own diff once

## Notes for the reviewer

<!-- Where are you uncertain? Where do you want detailed feedback? State it so the review focuses on the right areas. -->
