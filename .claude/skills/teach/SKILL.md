---
name: teach
description: Teach a NestJS concept like a teacher — read the latest docs from official
  sources, explain in Vietnamese following the problem→solution flow, provide runnable
  examples aligned with the project's domain, connect to existing knowledge of Express/Prisma/hexagonal
  architecture, then add a quiz. Use when the user asks "explain X", "teach me about
  X", "/teach X", or when filling in the Theory section of a lesson note.
---
# teach

Teach a NestJS concept to a new backend developer who already knows basic Node.js / Express / Prisma / hexagonal architecture.

## Why this skill is needed

Three reasons:

1. **Avoid teaching from memory.** Models have a knowledge cutoff; NestJS and its ecosystem change constantly. This skill turns "read official sources before teaching" into a mandatory step, not a nice-to-have.
2. **Consistent quality.** New sessions have no memory of previous ones. Without this skill, teaching quality depends on what context is left over from that day.
3. **Force connections to prior knowledge.** This is the fastest learning lever for someone who already knows Express, and also the most easily overlooked thing.

## Step 0 (MANDATORY) — Get the latest documentation

Do not teach before completing this step.

`docs.nestjs.com` is an **Angular SPA**, `WebFetch` will only return the title tag, no content. Get the original markdown from the official repository:

```bash
# Page content, e.g. /controllers
gh api "repos/nestjs/docs.nestjs.com/contents/content/controllers.md" \
  -H "Accept: application/vnd.github.raw"

# Page in the subsection, e.g. /techniques/validation
gh api "repos/nestjs/docs.nestjs.com/contents/content/techniques/validation.md" \
  -H "Accept: application/vnd.github.raw"
```

The file name ↔ URL mapping has a few discrepancies, notably:

| URL                                      | File markdown                                  |
| ---------------------------------------- | ---------------------------------------------- |
| `/middleware`                            | `content/middlewares.md`                       |
| `/fundamentals/custom-providers`         | `content/fundamentals/dependency-injection.md` |
| `/fundamentals/injection-scopes`         | `content/fundamentals/provider-scopes.md`      |
| `/fundamentals/testing`, `/unit-testing` | `content/fundamentals/unit-testing.md`         |
| `/techniques/database`                   | `content/techniques/sql.md`                    |
| `/security/encryption-and-hashing`       | `content/security/encryption-hashing.md`       |
| `/faq/common-errors`                     | `content/faq/errors.md`                        |

Not sure which file? Run: `gh api "repos/nestjs/docs.nestjs.com/contents/content" --jq '.[].name'`.

When the lesson requires external libraries, **check the actual version** instead of guessing:

```bash
npm view @nestjs/config version
```

Code examples must match the major version used in the repo's `package.json`.

## Lesson structure

### 1. Start with the PROBLEM, not syntax

Wrong: _"An Interceptor is a class that implements `NestInterceptor`..."_

Correct: _"You want every response wrapped in `{ data: ... }`. Writing it in each controller repeats 40 times and you're guaranteed to forget somewhere. You need a place to inject between the handler and the response — that's what Interceptors do."_

### 2. Explain the mechanism

How Nest does it, where it runs in the request lifecycle, which scope it's registered in (method / controller / module / global).

### 3. Examples based on the project's domain

Don't copy the `cats` example from the docs. This project is a **Task Management API** (User, Project, Task, Comment) — examples must use this exact domain so the code in the lesson can be used directly for hands-on practice.

Code must **run correctly**: full imports, correct types, match the repo's `tsconfig.json` (`strictNullChecks: true`, `noImplicitAny: false`).

### 4. Connect to prior knowledge — never skip this

Always include a comparison table:

| Known                       | In NestJS                         | How it differs                                                                      |
| ----------------------------- | ------------------------------------ | ------------------------------------------------------------------------------- |
| `app.use(logger)` from Express | `middleware` + `configure(consumer)` | Nest adds Guard/Interceptor/Pipe/Filter, each with its own position and purpose |

Anchor to the user's 3 prior knowledge sources: **Express**, **Prisma**, **hexagonal architecture** (ports & adapters, separating domain from infrastructure).

### 5. Cover the downsides too

When **not** to use it, common pitfalls, things that are easy to misunderstand. For example: Guards run _before_ Interceptors, so don't expect to read transformed data; `ValidationPipe` does not automatically strip unknown fields if `whitelist: true` is missing.

### 6. Write to the lesson notes

Fill in the **📚 Theory**, **🔗 Prior Knowledge Connections**, **💻 Explained Examples** sections of `docs/lessons/XX-*/README.md`. Include a link to the original docs for each concept for future reference.

### 7. End with 3–5 questions

Questions must test **understanding**, not **memorization**.

- Weak: _"What is the decorator to get the body?"_
- Good: _"If you set `ValidationPipe` at the method level instead of global, what are the consequences? Are there any cases where you would want to do that?"_

Write the questions in the **✅ Review & Quiz** section, **leave the answer blank** — the user will answer in their own words.

## Boundaries

- **Do not** do the hands-on for them. The lesson provides illustrative examples; the user writes the hands-on code themselves.
- **Do not** teach if step 0 fails. Be straightforward that the docs could not be retrieved, and ask the user to open the link and read along.
- **Do not** invent APIs. If it's not in the docs/source → clearly state that you're not sure.
Write in **Vietnamese**, keep English terminology (provider, guard, interceptor, dependency injection) — because these are the terms the user will encounter in code and interviews.

---

<!-- CO-OP TRANSLATOR DISCLAIMER START -->
**Disclaimer**:
This document has been translated using AI translation service [Co-op Translator](https://github.com/Azure/co-op-translator). While we strive for accuracy, please be aware that automated translations may contain errors or inaccuracies. The original document in its native language should be considered the authoritative source. For critical information, professional human translation is recommended. We are not liable for any misunderstandings or misinterpretations arising from the use of this translation.
<!-- CO-OP TRANSLATOR DISCLAIMER END -->