# ADR-0001: Choose Prisma as the ORM instead of TypeORM

- **Status:** Accepted
- **Date:** 2026-08-10
- **Decision maker:** Hien Duong

## Context

The project needs a PostgreSQL access layer. Two practical options:

- **TypeORM** — is the ORM used as the main example in the NestJS documentation ([/techniques/database](https://docs.nestjs.com/techniques/database)), has the official `@nestjs/typeorm` package, and integrates deeply with Nest DI through the `@InjectRepository` pattern.
- **Prisma** — has its own official recipe ([/recipes/prisma](https://docs.nestjs.com/recipes/prisma)), is schema-first, and generates types from the schema.

A specific constraint of this project: **this is a learning project, and the learner has already used Prisma in a previous Express + hexagonal architecture project.**

## Decision

Use **Prisma + PostgreSQL** as the main data layer. Lesson notes will include a short comparison of "how TypeORM works similarly" so the learner can still understand the NestJS documentation and codebases that use TypeORM.

## Options considered

| Option                | Advantages                                                                                                                                                                        | Disadvantages                                                                                                                                                                  | Why it was not chosen                                |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| **Prisma** _(chosen)_ | Reuses existing knowledge → makes it possible to separate "what is new in Nest" from "what is new in the ORM"; good type safety; clear migration workflow; has an official recipe | Not the default example in the Nest docs; as a generated client, it makes the Nest Repository pattern harder to see                                                            | —                                                    |
| **TypeORM**           | Follows the NestJS docs most closely; `@InjectRepository` teaches how DI works with data; many Vietnamese companies use it                                                        | Learning a new ORM and a new framework at the same time → makes it difficult to know where errors come from; decorator-based entities are easy to confuse with Nest decorators | Mixing two new variables at once slows down learning |
| **Both in parallel**  | Broadest coverage                                                                                                                                                                 | Doubles the workload and makes abandonment more likely                                                                                                                         | Not suitable for a beginner                          |

## Consequences

**Positive**

- In Phase 2, the only "new" part to learn is _how to wrap Prisma in Nest's DI system_ — not how to write queries again. This follows the principle that each lesson adds only one new variable.
- Creates a direct bridge to Phase 7 / L25 (hexagonal): compare the same Prisma schema placed in two different architectures.

**Trade-offs**

- When reading the NestJS database documentation, code examples will use TypeORM → they must be translated to Prisma. This is actually a **necessary skill**: reading an example in technology A and applying it to technology B.
- The `@InjectRepository` pattern is not learned naturally → compensate with a comparison section in the L07 lesson note.

**Follow-up work**

- L07: write `PrismaService` extending `PrismaClient`, implement `OnModuleInit` — this is exactly where Prisma meets Nest DI.
- L07 note: add a _"If you encounter TypeORM in another project"_ section to make TypeORM code understandable.
- Check Prisma's major version at the time of learning (Prisma changes fairly quickly between majors, especially how generator/output are declared).
