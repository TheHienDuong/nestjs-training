# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This is a stock `nest new` scaffold (NestJS 11) used for training purposes. It currently contains only the default `AppModule`/`AppController`/`AppService` — no custom domain modules exist yet.

## Package manager

Use **pnpm** (lockfile is `pnpm-lock.yaml`), not npm or yarn.

## Common commands

```bash
pnpm install              # install dependencies

pnpm run start:dev        # run with watch mode (primary dev loop)
pnpm run start:debug       # run with --debug --watch
pnpm run build             # nest build
pnpm run start:prod        # run compiled dist/main.js

pnpm run lint               # eslint --fix over src/apps/libs/test
pnpm run format             # prettier --write over src and test

pnpm run test                # unit tests (jest, rootDir: src, *.spec.ts)
pnpm run test:watch
pnpm run test:cov
pnpm run test -- app.controller.spec.ts   # run a single unit test file
pnpm run test -- -t "test name"           # run tests matching a name

pnpm run test:e2e            # e2e tests (test/*.e2e-spec.ts, uses test/jest-e2e.json)
```

## Architecture notes

- Standard Nest layering: `*.module.ts` wires providers/controllers together, `*.controller.ts` handles routing/HTTP, `*.service.ts` holds business logic injected into controllers. New features should follow this same module/controller/service split, colocated under `src/`.
- Unit tests (`*.spec.ts`) live next to the source file they test and run under Jest's `rootDir: src` config in `package.json`. E2E tests live under `test/` and run under `test/jest-e2e.json`, hitting the app through `supertest` against the full Nest app instance (see `test/app.e2e-spec.ts`).
- `tsconfig.json` uses `nodenext` module/moduleResolution and disables `noImplicitAny`; `strictNullChecks` is on but full `strict` mode is not.
- ESLint (`eslint.config.mjs`) uses `typescript-eslint`'s `recommendedTypeChecked` plus `eslint-plugin-prettier`; `@typescript-eslint/no-explicit-any` is disabled, and `no-floating-promises`/`no-unsafe-argument` are set to `warn` rather than `error`.
