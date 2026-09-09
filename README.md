# NestJS Task Management API

A production-oriented task management API built with NestJS 11. The application provides a foundation for users, projects, tasks, and comments with validation, PostgreSQL persistence, and a maintainable module structure.

## Stack

- NestJS 11 with `@nestjs/platform-express`
- TypeScript with constructor-based dependency injection
- Prisma 6 with PostgreSQL
- `class-validator` and `class-transformer` for request validation
- `@nestjs/config` for environment configuration
- Jest and Supertest for unit and end-to-end tests
- Docker Compose for local PostgreSQL and Redis services
- GitLab CI for linting, formatting, testing, and builds

## Prerequisites

- Node.js 22 or newer
- pnpm 11
- Docker and Docker Compose

Install the exact dependencies declared by the lockfile:

```bash
pnpm install --frozen-lockfile
```

## Environment

Copy the example environment file and review every value before starting the application:

```bash
cp .env.example .env
```

`.env.example` contains safe local placeholders. Never commit `.env` files, credentials, tokens, or production connection strings.

## Local services

Start PostgreSQL and Redis with Docker Compose:

```bash
pnpm db:up
docker compose ps
```

Stop the services while keeping their data:

```bash
pnpm db:down
```

## Database

Apply committed migrations to the configured database:

```bash
pnpm exec prisma migrate deploy
```

Generate the Prisma Client after schema changes:

```bash
pnpm exec prisma generate
```

Seed local development data:

```bash
pnpm exec prisma db seed
```

Do not edit migration files that have already been applied. Create a new migration for each schema change.

## Development

```bash
pnpm start:dev
```

The default HTTP server listens on `http://localhost:3000`. Other useful commands are:

```bash
pnpm build
pnpm start:prod
pnpm db:logs
```

## Architecture

Code is organized by feature under `src/`:

- Controllers handle HTTP routing, request boundaries, and response shapes.
- Services contain business rules and coordinate persistence.
- Modules define feature boundaries and dependency-injection wiring.
- DTOs and pipes validate and transform external input.
- `src/prisma/` owns the Prisma client lifecycle and database provider.

The `prisma/` directory contains the schema, migrations, and seed entry point. The `test/` directory contains end-to-end test configuration.

## Testing and quality

Run the same quality commands used by GitLab CI:

```bash
pnpm lint
pnpm exec prettier --check "src/**/*.ts" "test/**/*.ts" "prisma/*.ts" "*.md" "*.json" "*.yml"
pnpm test
pnpm build
```

`pnpm lint` runs ESLint with zero warnings allowed. The other commands check formatting, run Jest tests, and build the application.

End-to-end tests use `test/jest-e2e.json` and require a configured database.

## GitLab workflow

GitLab is the canonical platform for repository collaboration and releases. Create a short-lived branch from the protected default branch, push the branch to the GitLab `origin` remote, and open a merge request in GitLab.

Every merge request should include:

- A focused description of the change and its scope
- Evidence of behavior, configuration, or documentation changes
- The verification commands and their results
- Confirmation that no secrets are included

All required CI jobs and approval rules must pass before the project owner squash-merges the merge request. Do not push directly to the protected default branch.

## Security notes

- Validate all external input at the HTTP boundary.
- Keep secrets in the deployment environment, never in source control or logs.
- Use separate credentials and databases for development, testing, and production.
- Review migration plans before production deployment and take backups first.
- Run behind TLS termination and configure trusted-proxy behavior for the deployment environment.
- Set restrictive database permissions and rotate credentials regularly.
- Review dependency and container updates before release.

## License

This repository is not currently distributed under an open-source license. Add an explicit license before redistributing it.
