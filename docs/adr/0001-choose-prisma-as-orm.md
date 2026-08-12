# ADR-0001: Select Prisma as ORM instead of TypeORM

- **Status:** Accepted
- **Date:** 2026-08-10
- **Decision maker:** Hien Duong

## Context

The project needs a PostgreSQL data access layer. Two practical options:

- **TypeORM** — is the ORM used as the primary example in NestJS documentation ([/techniques/database](https://docs.nestjs.com/techniques/database)), has the official `@nestjs/typeorm` package, and integrates deeply with Nest's DI via the `@InjectRepository` pattern.
- **Prisma** — has its own official recipe ([/recipes/prisma](https://docs.nestjs.com/recipes/prisma)), is schema-first, and generates types from the schema.

A unique constraint for this project: **this is a learning project, and the learner has previously used Prisma in an Express + hexagonal architecture project.**

## Decision

Use **Prisma + PostgreSQL** as the primary data layer. Lesson notes will include a short comparison section "How TypeORM does the same thing" to ensure readers can still understand NestJS docs and codebases that use TypeORM.

## Considered Options

| Option              | Pros                                                                                                                                                          | Cons                                                                                                                  | Reason for not selecting                               |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| **Prisma** _(selected)_ | Reuse existing knowledge → clearly separate "what's new in Nest" and "what's new in the ORM"; good type safety; clear migration workflow; has official recipe | Not the default example in Nest docs; is a pre-generated client so it's hard to see Nest's Repository pattern | —                                               |
| **TypeORM**            | Closest to NestJS docs; `@InjectRepository` teaches how DI works with data; used by many Vietnamese companies | Learning a new ORM and new framework at the same time → hard to tell where errors come from; decorator-based entities are easy to confuse with Nest decorators | Learning two new variables at the same time slows down the learning process |
| **Both in parallel**   | Widest coverage                                                                                                                                           | Double the workload, easy to abandon                                                                                           | Not suitable for beginners             |

## Consequences

**Positive**

- In Phase 2, the only "new" part to learn is _how to wrap Prisma into Nest's DI system_ — no need to re-learn how to write queries. This aligns with the principle: each lesson only adds one new variable.
- Creates a direct bridge to Phase 7 / L25 (hexagonal): compare the same Prisma schema placed in two different architectures.

**Trade-offs**

- When reading NestJS database docs, code examples will be in TypeORM → you have to manually translate them to Prisma. This is actually a **required skill**: reading examples in technology A and applying them to technology B.
- You don't get to learn the `@InjectRepository` pattern naturally → this is compensated by a comparison section in lesson note L07.

**Next steps**

- L07: write `PrismaService` that extends `PrismaClient`, implements `OnModuleInit` — this is where Prisma meets Nest's DI.
- L07 note: add a section _"If you encounter TypeORM in another project"_ to understand TypeORM code.
- Check the major version of Prisma at the time of learning (Prisma changes fairly quickly between major versions, especially the way generator/output is declared).

---

<!-- CO-OP TRANSLATOR DISCLAIMER START -->
**Disclaimer**:
This document has been translated using AI translation service [Co-op Translator](https://github.com/Azure/co-op-translator). While we strive for accuracy, please be aware that automated translations may contain errors or inaccuracies. The original document in its native language should be considered the authoritative source. For critical information, professional human translation is recommended. We are not liable for any misunderstandings or misinterpretations arising from the use of this translation.
<!-- CO-OP TRANSLATOR DISCLAIMER END -->