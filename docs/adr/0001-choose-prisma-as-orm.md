# ADR-0001: Choose Prisma as ORM instead of TypeORM
- **Status:** Accepted
- **Date:** 2026-08-10
- **Decision maker:** Hien Duong
## Context
The project requires a PostgreSQL access layer. Two practical options:
- **TypeORM** — is the ORM used as the primary example in NestJS documentation ([`/techniques/database`](https://docs.nestjs.com/techniques/database)), has the official package `@nestjs/typeorm`, and integrates deeply with Nest's DI via the `@InjectRepository` pattern.
- **Prisma** — has its own official recipe ([`/recipes/prisma`](https://docs.nestjs.com/recipes/prisma)), is schema-first, and generates types from its schema.
Project-specific constraint: **this is a learning project, and the learner has previously used Prisma in an Express + hexagonal architecture project.**
## Decision
Use **Prisma + PostgreSQL** as the primary data layer. Lesson notes will include a short comparison section titled "How TypeORM works similarly" to ensure readers can still understand NestJS documentation and codebases that use TypeORM.
## Alternatives Considered
| Alternative | Advantages | Disadvantages | Why not selected || ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| **Prisma** _(selected)_ | Reuse existing knowledge → clearly distinguish "what's new in Nest" from "what's new in the ORM"; good type safety; clear migration workflow; has official recipes | Not the default example in Nest documentation; it is a pre-generated client so it is hard to observe Nest's Repository pattern | —                                               |
| **TypeORM**            | Closest to NestJS official documentation; `@InjectRepository` teaches how Dependency Injection (DI) works with data; widely adopted by many Vietnamese companies | Learning a new ORM and a new framework at the same time makes it difficult to pinpoint error sources; decorator-based entities are easy to confuse with Nest's decorators | Combining two new variables at the same time slows down the learning process || **Both Parallel** | Widest coverage | Double the workload, easy to abandon | Not suitable for beginners |

## Consequences

**Positive**
- In Phase 2, the only _"new"_ content you need to learn is _how to wrap Prisma into Nest's DI system_ — you don't need to re-learn how to write queries. This fits the core philosophy perfectly: each lesson only adds one new variable.
- Creates a direct bridge to Phase 7 / L25 (hexagonal architecture): compare the same Prisma schema placed in two different architectures.

**Downsides**
- When reading NestJS documentation about databases, code examples will use TypeORM → you have to manually translate them to Prisma. This is actually a **required skill**: reading examples written with technology A and applying them to technology B.
- You won't naturally learn the `@InjectRepository` pattern → this is offset by a cross-reference section in the L07 lesson notes.

**Next steps**
- L07: Write `PrismaService` that extends `PrismaClient` and implements `OnModuleInit` — this is where Prisma integrates with Nest's DI system.
- L07 notes: Add a section _"If you encounter TypeORM in other projects"_ to help you understand TypeORM code.
- Check Prisma's major version at the time of learning (Prisma changes fairly quickly between major versions, especially the way generator and output are declared).