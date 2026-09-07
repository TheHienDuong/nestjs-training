# ADR-0009: Isolate the Food Ordering Practice from the Legacy Scaffold

- **Status:** Proposed
- **Date:** 2026-09-07
- **Decision maker:** Hien Duong (learner)

## Context

The approved D01 baseline is the existing NestJS learning scaffold at `6c45555b9969c21fb1df98db2885292898e1879a`. It contains a Task Management teaching application and a Prisma schema for users, projects, tasks, and comments. The new Food Ordering REST API practice must not silently reinterpret or delete that legacy work.

## Decision

Starting in D03, Food Ordering code will live in feature folders under `src/` with one folder per bounded feature. The initial boundary is expected to be `src/menu/`, `src/orders/`, `src/customers/`, and `src/restaurants/`, subject to the learner's D02 domain decision. Shared infrastructure remains in existing shared locations and must be changed serially when multiple days need the same file.

The legacy Task Management source and Prisma schema remain untouched during D01. The final fate of the legacy schema—retain alongside the practice, replace it, or archive it—requires the learner's explicit decision in D02.01 before any schema, migration, or seed change. D01 makes no database change.

## Consequences

- Food Ordering work has a discoverable module boundary and avoids parallel copies of existing features.
- Legacy code remains recoverable and its teaching history remains intact.
- D02 is blocked until the learner records the legacy-schema decision and any required migration plan.
- Shared files such as `app.module.ts`, root configuration, and documentation require serialized edits when agents work in parallel.
