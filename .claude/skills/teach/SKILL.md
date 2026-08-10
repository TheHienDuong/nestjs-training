---
name: teach
description: Teach a NestJS concept like a teacher — read the latest official documentation, explain it in English through a problem→solution flow, provide a working example using the project's domain, connect existing Express/Prisma/hexagonal knowledge, then give a quiz. Use when the user asks "explain X", "teach me X", "/teach X", or when the Theory section of a lesson note needs to be completed.
---

# teach

Teach a NestJS concept to a beginner backend developer already familiar with Node.js / Express / Prisma / basic hexagonal architecture.

## Why this skill is needed

Three reasons:

1. **Prevent teaching from memory.** Models have a knowledge cutoff; NestJS and its ecosystem change continuously. This skill makes "read official sources before teaching" a mandatory step, not a good intention.
2. **Consistent quality.** A new session has no memory of previous sessions. Without this skill, teaching quality depends on what remains in context that day.
3. **Require connections to prior knowledge.** This is the fastest learning lever for someone who knows Express and the easiest one to overlook.

## Step 0 (MANDATORY) — Retrieve the latest documentation

Do not teach before completing this step.

`docs.nestjs.com` is an **Angular SPA**; `WebFetch` returns only the title tag, with no content. Retrieve source Markdown from the official repository:

```bash
# Page content, for example /controllers
gh api "repos/nestjs/docs.nestjs.com/contents/content/controllers.md" \
  -H "Accept: application/vnd.github.raw"

# Page in a subsection, for example /techniques/validation
gh api "repos/nestjs/docs.nestjs.com/contents/content/techniques/validation.md" \
  -H "Accept: application/vnd.github.raw"
```

Some filename ↔ URL mappings differ, notably:

| URL                                      | File markdown                                  |
| ---------------------------------------- | ---------------------------------------------- |
| `/middleware`                            | `content/middlewares.md`                       |
| `/fundamentals/custom-providers`         | `content/fundamentals/dependency-injection.md` |
| `/fundamentals/injection-scopes`         | `content/fundamentals/provider-scopes.md`      |
| `/fundamentals/testing`, `/unit-testing` | `content/fundamentals/unit-testing.md`         |
| `/techniques/database`                   | `content/techniques/sql.md`                    |
| `/security/encryption-and-hashing`       | `content/security/encryption-hashing.md`       |
| `/faq/common-errors`                     | `content/faq/errors.md`                        |

If unsure which file: `gh api "repos/nestjs/docs.nestjs.com/contents/content" --jq '.[].name'`.

When a lesson needs an external library, **check the actual version** instead of guessing:

```bash
npm view @nestjs/config version
```

Code examples must match the major version used in the repository's `package.json`.

## Lesson structure

### 1. Start with the PROBLEM, not syntax

Incorrect: _"An interceptor is a class that implements `NestInterceptor`..."_

Correct: _"You want every response wrapped in `{ data: ... }`. Writing this in every controller repeats it 40 times and guarantees omissions. You need a place between the handler and response — that is the Interceptor's job."_

### 2. Explain the mechanism

How Nest does it, where it runs in the request lifecycle, and at which scope it is registered (method / controller / module / global).

### 3. Example using the project's domain

Do not copy `cats` from the docs. This project is a **Task Management API** (User, Project, Task, Comment) — examples must use that domain so lesson code can be used directly for hands-on work.

Code must **run**: complete imports, correct types, and compatibility with `tsconfig.json` in the repository (`strictNullChecks: true`, `noImplicitAny: false`).

### 4. Connect prior knowledge — do not omit

Always include a comparison table:

| Prior knowledge              | In NestJS                            | Differences                                                                     |
| ---------------------------- | ------------------------------------ | ------------------------------------------------------------------------------- |
| `app.use(logger)` in Express | `middleware` + `configure(consumer)` | Nest adds Guard/Interceptor/Pipe/Filter, each with its own position and purpose |

Anchor to the user's three prior knowledge sources: **Express**, **Prisma**, **hexagonal architecture** (ports & adapters, separating the domain from infrastructure).

### 5. Discuss trade-offs

When it **should not** be used, common pitfalls, and likely misunderstandings. Example: Guards run _before_ Interceptors, so do not expect transformed data; `ValidationPipe` does not strip unknown fields without `whitelist: true`.

### 6. Write to the lesson note

Complete the **📚 Theory**, **🔗 Connections to prior knowledge**, and **💻 Explained example** sections of `docs/lessons/XX-*/README.md`. Include a source documentation link for every concept.

### 7. End with 3–5 questions

Questions must test **understanding**, not **memory**.

- Weak: _"Which decorator retrieves the body?"_
- Good: _"What are the consequences of applying `ValidationPipe` at method scope instead of globally? When might that be desirable?"_

Write the questions in **✅ Review & Quiz**, **leave the answers blank** — the user answers in their own words.

## Boundaries

- **Do not** do the hands-on work for the user. Lessons provide illustrative examples; the user writes the hands-on code.
- **Do not** teach if step 0 fails. State that the documentation could not be retrieved and ask the user to open the link and read it together.
- **Do not** invent APIs. If it is not in the docs/source → state clearly that it is uncertain.
- Write in **English**, preserving English technical terms (provider, guard, interceptor, dependency injection) — because these are the terms the user will encounter in code and interviews.
