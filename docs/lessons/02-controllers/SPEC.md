<!--
SPEC.md — task handoff source for the Coder agent (NES-3, L02).
Only Claude may edit this file (see docs/adr/0004-mcp-single-writer-cho-coder-agent.md
and docs/workflow/AGENT-MODEL.md). Content is copied verbatim from the Linear NES-3
issue description. If the Linear issue changes later, update this file at the same time.
-->

# NES-3 — L02 — Controllers & Routing

## 🎯 Learning objectives

- [ ] Write a controller with GET/POST/PATCH/DELETE routes on your own
- [ ] Distinguish between `@Param`, `@Query`, `@Body`
- [ ] Know how to set status code and headers via decorators instead of Express's `res` object

## 📚 Official documentation

- [https://docs.nestjs.com/controllers](https://docs.nestjs.com/controllers)

## 🔗 Connecting to prior knowledge

Express: `router.get('/tasks/:id', (req, res) => ...)` ↔ Nest: a method in a class with `@Get(':id')`, the parameter obtained via `@Param('id')` instead of `req.params.id`. Nest hides `req`/`res` by default — only needed when you truly need full control (`@Res()`).

## 🛠 Hands-on

1. Create `TasksController` with basic CRUD routes (no service/DB needed yet, return static data)

## ✅ Definition of Done

- [ ] Lesson note complete
- [ ] Tests pass, quiz passed, PR merged
