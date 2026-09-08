<!--
SPEC.md — task handoff source for the Coder agent (NES-4, L03).
Only Claude may edit this file (see docs/adr/0004-mcp-single-writer-for-coder-agent.md
and docs/workflow/AGENT-MODEL.md). Content is copied verbatim from the Linear NES-4
issue description. If the Linear issue changes later, update this file at the same time.
-->

# NES-4 — L03 — Providers & Dependency Injection

## 🎯 Learning objectives

Learn the IoC container and dependency injection through a constructor; implement an `@Injectable()` service with singleton provider scope; move task business logic into `TasksService`, keeping the controller thin (HTTP only).

## 🏷 Labels

hands-on, phase-1

## 📚 Official documentation

- [https://docs.nestjs.com/providers](https://docs.nestjs.com/providers)
