# ADR-0001: Select Prisma as the ORM

- **Status:** Accepted
- **Date:** 2026-08-10
- **Decision maker:** Project maintainers

## Context

The API requires a reliable PostgreSQL data-access layer that integrates cleanly with NestJS dependency injection. TypeORM is a strong NestJS option, while Prisma provides a schema-first workflow and generated, type-safe client.

## Decision

Use Prisma with PostgreSQL as the primary data layer. `PrismaService` exposes the generated client through NestJS dependency injection and owns its application lifecycle.

## Alternatives considered

| Option  | Advantages                                                                                            | Trade-offs                                                                     |
| ------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Prisma  | Schema-first workflow, generated types, clear migration tooling, official NestJS integration guidance | The client is generated rather than repository-based                           |
| TypeORM | Mature NestJS integration and repository pattern                                                      | Decorator-based entities and runtime mapping add a different persistence model |

## Consequences

Prisma schema changes are reviewed as migrations and the generated client must be refreshed when the schema changes. Engineers familiar with TypeORM can still apply the same persistence principles, but the implementation details differ.
