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

Before creating a new file or feature, **always check the directory** to know
whether the feature already exists — **do not use content `grep`**: if a file
in `src/<feature>/` does not contain the exact literal token, grep returns
empty (a false negative), which makes an agent think the feature does not
exist yet and create a duplicate module:

```bash
test -d "src/<feature>" && echo "already exists — extend it" || echo "does not exist yet — safe to create"
# or list the existing feature directories:
find src -maxdepth 2 -type d -name "<feature>"
```

- A lesson that **upgrades** an existing feature (for example, L05 adds DTO
  validation for `tasks`) → **extend** the existing module (`src/tasks/`); do
  **not** create a parallel copy (`tasks2/`, `tasks-v2/`) or put the logic in
  `AppController`.
- Shared files (`app.module.ts`, base DTOs, shared pipes, and so on) should be
  **reused**, not copied separately for each feature.

## c) Registering modules

A new module must be declared in `AppModule` (`imports`), keeping the DI graph
correct — do not leave an "orphan" module that nothing imports.

## d) Smart coordination when agents run in parallel

- **Module ownership** — each agent owns 1+ module of its **own**; no two
  agents modify the same module at the same time.
- **Shared files** (`app.module.ts`, `package.json`, `docs/ROADMAP.md`,
  `docs/lessons/_agent-log.md`, `docs/templates/*`) — serialize them or let
  Hermes (the orchestrator) merge them; **no agent touches them concurrently**.
- **Know the scope before assigning work** — before dispatching lesson `<NN>`,
  run `pnpm lesson <NN-1>` (the **completed lesson immediately before it** —
  for example, before assigning L03, run `pnpm lesson 02`) to know which files
  that lesson already produced, then assign a distinct scope to each agent.
  `pnpm lesson <NN>` for the lesson about to be assigned reports "No tag yet"
  because the tag is only created after that lesson is merged.

## e) File header comments

Every new reference code file must begin with:

```ts
// [NES-X · lesson NN] <file role>
```

Example: `// [NES-3 · lesson 02] Reference — controller, teaching comments inline`.

## References

- 7-step process per lesson: [WORKFLOW.md](WORKFLOW.md)
- Agent role separation: [AGENT-MODEL.md](AGENT-MODEL.md)
- File boundaries by path: `AGENTS.md` § File boundaries
