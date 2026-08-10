# Repository Guidelines

## Project Structure & Module Organization

This is a NestJS TypeScript application managed with PNPM. Application code lives in `src/`: `main.ts` bootstraps the server, `app.module.ts` wires the root module, and feature classes follow Nest naming such as `app.controller.ts`, `app.service.ts`, and `*.module.ts`. Unit tests sit beside the code they cover as `*.spec.ts`, for example `src/app.controller.spec.ts`. End-to-end tests live in `test/` and use `test/jest-e2e.json`. Build output is generated in `dist/`; do not edit it directly.

## Build, Test, and Development Commands

- `pnpm install`: install dependencies from `pnpm-lock.yaml`.
- `pnpm run start`: run the Nest application once.
- `pnpm run start:dev`: run in watch mode for local development.
- `pnpm run build`: compile TypeScript through the Nest CLI into `dist/`.
- `pnpm run start:prod`: run the compiled app from `dist/main`.
- `pnpm run lint`: run ESLint with automatic fixes over `src`, `apps`, `libs`, and `test`.
- `pnpm run format`: format TypeScript files in `src/` and `test/`.
- `pnpm run test`, `pnpm run test:e2e`, `pnpm run test:cov`: run unit tests, e2e tests, or coverage.

## Coding Style & Naming Conventions

Use TypeScript and NestJS decorators, dependency injection, and module boundaries consistently. Prettier enforces single quotes and trailing commas; ESLint also reports Prettier violations. Follow Nest file suffixes and class names: `ExampleController`, `ExampleService`, `ExampleModule`, with files named `example.controller.ts`, `example.service.ts`, and `example.module.ts`. Keep providers focused and inject dependencies through constructors.

## Testing Guidelines

Jest is the test runner, with `ts-jest` transforming TypeScript. Name unit tests `*.spec.ts` and keep them near the source under `src/`. E2E tests belong in `test/` and should end with `.e2e-spec.ts`. Add or update tests whenever behavior changes, and run `pnpm run test` before submitting. Use `pnpm run test:cov` when changing shared services or controllers.

## Commit & Pull Request Guidelines

The repository history uses Conventional Commit style, such as `feat: initialize NestJS application with basic structure and tests`. Keep commits concise and imperative, with prefixes like `feat:`, `fix:`, `test:`, `docs:`, or `chore:`. Pull requests should include a short summary, test results, linked issues when applicable, and screenshots or request examples for user-visible API changes.

## Security & Configuration Tips

Keep secrets out of the repository and prefer environment variables for runtime configuration. Do not commit generated artifacts such as coverage output or local environment files. Validate inputs at controller boundaries before passing data into services.
