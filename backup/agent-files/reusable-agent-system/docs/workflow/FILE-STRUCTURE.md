# 🗂 FILE-STRUCTURE — File organization & agent coordination conventions

> Goal: the remaining 25 lessons must **not** create duplicate files, parallel
> modules, or misplaced logic — even when multiple agents run concurrently.

## a) Standard folder (Nest feature-based)

**One feature = one `src/<feature>/` folder**, created **exactly once** in the
lesson that introduces that feature. Later lessons only **extend** it; they do
not recreate it.

```text
src/<feature>/
  <feature>.module.ts
  <feature>.controller.ts
  <feature>.service.ts
  <feature>.controller.spec.ts
  dto/
    create-<feature>.dto.ts
    update-<feature>.dto.ts
test/<feature>.e2e-spec.ts
```

Existing examples: `src/users/` (L01), `src/tasks/` (L02).

## b) Look-before-create (avoid duplication)

Before creating a new file or feature, **always grep `src/`** to check whether
the feature already exists:

```bash
grep -ril "<feature>" src/
```

- A lesson **upgrades** an existing feature (for example, L05 adds DTO validation for `tasks`) → **extend** the existing module (`src/tasks/`); do **not** create a parallel copy (`tasks2/`, `tasks-v2/`) or put the logic in `AppController`.
- Shared files (`app.module.ts`, base DTOs, shared pipes, and so on) should be **reused**, not copied separately for each feature.

## c) Registering modules

A new module must be declared in `AppModule` (`imports`) so that the DI graph
is correct and no module becomes an orphan that nobody can reach.

## d) Smart coordination when agents run in parallel

- **Module ownership:** each agent owns one or more **separate** modules; two agents must not modify the same module at the same time.
- **Shared files** (`app.module.ts`, `package.json`, `docs/ROADMAP.md`, `docs/lessons/_agent-log.md`, `docs/templates/*`) must be serialized or merged by Hermes (the orchestrator); no agents should touch them concurrently.
- **Know the scope before assigning work:** run `pnpm lesson <NN>` to see which files the previous lesson created, then assign separate scopes to each agent before dispatching.

## e) File header comments

Every new reference code file must begin with:

```ts
// [NES-X · lesson NN] <file role>
```

Example: `// [NES-3 · lesson 02] Reference — controller, teaching comments inline`.

## References

- Seven-step process for each lesson: [WORKFLOW.md](WORKFLOW.md)
- Agent roles: [AGENT-MODEL.md](AGENT-MODEL.md)
- Path-based file boundaries: `AGENTS.md` § File Boundaries
