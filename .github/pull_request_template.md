<!--
This template appears automatically every time you open a PR.
Why it's needed: the PR description is what the reviewer (and yourself 6 months later) reads BEFORE reading the code.
A PR with no description forces the reader to guess the intent from the diff — which is very easy to get wrong.
-->

## Lesson / Task

<!-- REQUIRED: the line below is what makes Linear automatically move the issue to Done when the PR merges.
     Writing the wrong code or deleting this line -> automation breaks, with no error message at all. -->

Fixes NES-XX

## What I did

<!-- 2-4 bullet points. Write at the level of INTENT, not a re-listing of the diff.
     Good: "Added TasksService to store data in-memory to separate logic from the controller"
     Poor: "Added file tasks.service.ts, edited tasks.controller.ts" -->

-

## What I learned

<!-- Section specific to this repo. What did you newly understand, or what did you used to misunderstand? -->

-

## How to test

<!-- Someone else must be able to reproduce this. Write specific commands. -->

```bash
pnpm install
pnpm start:dev
# curl ...
```

## Checklist

- [ ] `pnpm lint` is clean
- [ ] `pnpm test` passes
- [ ] `pnpm build` succeeds
- [ ] Lesson note updated (complete **Connect to prior knowledge** and **Sources** sections)
- [ ] Passed the quiz at the `/lesson-review` step
- [ ] No secrets / `.env` file committed
- [ ] Re-read my own diff once, myself

## Notes for the reviewer

<!-- Which parts are you not confident about? Which parts do you want careful feedback on? Saying so gets you review focused where it's needed. -->
