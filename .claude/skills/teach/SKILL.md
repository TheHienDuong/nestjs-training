---
name: teach
description: Teach a NestJS concept like a teacher — read the latest docs from official sources, explain in Vietnamese following the problem→solution flow, provide runnable examples aligned with the project's domain, connect to existing Express/Prisma/hexagonal architecture knowledge, then include a quiz. Use when the user asks "explain X", "teach me about X", "/teach X", or when filling in the Theory section of a lesson note.
---

# teach

Teach a NestJS concept to a beginner backend developer who already knows basic Node.js / Express / Prisma / hexagonal architecture.

## Why this skill is needed

Three reasons:

1. **Prevent teaching from memory.** Models have a knowledge cutoff; NestJS and its ecosystem change constantly. This skill turns "read official sources before teaching" into a mandatory step, not just a good intention.
2. **Consistent quality.** New sessions have no memory of previous ones. Without this skill, lesson quality depends on what context is still available on that day.
3. **Enforce connection to prior knowledge.** This is the fastest learning lever for people who already know Express, and it is also the most easily overlooked point.

## Step 0 (MANDATORY) — Get the latest documentation

Do not teach before completing this step.

`docs.nestjs.com` is an **Angular SPA**, `WebFetch` will only return the title tag with no content. Get the original markdown from the official repository:

```bash
# Page content, example /controllers
gh api "repos/nestjs/docs.nestjs.com/contents/content/controllers.md" \
``````bash
  -H "Accept: application/vnd.github.raw"

# Page in a sub-section, for example /techniques/validation
gh api "repos/nestjs/docs.nestjs.com/contents/content/techniques/validation.md" \
  -H "Accept: application/vnd.github.raw"
```

There are a few discrepancies in the file name ↔ URL mapping, worth noting:

| URL                                      | Markdown file                                  |
| ---------------------------------------- | ---------------------------------------------- |
| `/middleware`                            | `content/middlewares.md`                       |
| `/fundamentals/custom-providers`         | `content/fundamentals/dependency-injection.md` |
| `/fundamentals/injection-scopes`         | `content/fundamentals/provider-scopes.md`      |
| `/fundamentals/testing`, `/unit-testing` | `content/fundamentals/unit-testing.md`         |
| `/techniques/database`                   | `content/techniques/sql.md`                    |
| `/security/encryption-and-hashing`       | `content/security/encryption-hashing.md`       |
| `/faq/common-errors`                     | `content/faq/errors.md`                        |

Not sure which file is which: `gh api "repos/nestjs/docs.nestjs.com/contents/content" --jq '.[].name'`.

When a lesson requires an external library, **check the actual version** instead of guessing:

```bash
npm view @nestjs/config version
```Code examples must match the major version currently used in the repo's `package.json`.

## Lecture Structure

### 1. Start with the PROBLEM, not syntax
Wrong: _"Interceptor is a class that implements `NestInterceptor`..."_
Correct: _"You want all responses wrapped in `{ data: ... }`. Adding this logic to every controller would be repetitive 40 times, and you're bound to forget a spot somewhere. You need a place to insert logic between the handler and the response — that is the role of Interceptors."_

### 2. Explain the mechanism
How Nest implements it, where it runs in the request lifecycle, and which scope it is registered in (method / controller / module / global).

### 3. Examples aligned with the project's domain
Do not copy the `cats` example from the docs. This project is a **Task Management API** (User, Project, Task, Comment) — examples must use this exact domain, so the lecture code can be used directly for hands-on practice.
Code must be **runnable**: include complete imports, correct types, and match the repo's `tsconfig.json` (`strictNullChecks: true`, `noImplicitAny: false`).

### 4. Connect to prior knowledge — do not omit this
Always include a comparison table:
| Already Known                       | In NestJS                         | Key Differences                                                                      |
| ----------------------------- | ------------------------------------ | ------------------------------------------------------------------------------- || `app.use(logger)` of Express | `middleware` + `configure(consumer)` | Nest adds Guard/Interceptor/Pipe/Filter, each with a distinct position and purpose |

Anchor content to the user's 3 existing knowledge bases: **Express**, **Prisma**, **hexagonal architecture** (ports & adapters, separate domain from infrastructure).

### 5. Cover the downsides
When **not** to use it, common pitfalls, and common misconceptions. For example: Guards run *before* Interceptors, so do not expect to access data that has already been transformed; `ValidationPipe` will not automatically strip unknown fields if `whitelist: true` is omitted.

### 6. Record in lesson notes
Fill in the **📚 Theory**, **🔗 Link to prior knowledge**, **💻 Explained examples** sections of `docs/lessons/XX-*/README.md`. Each concept is paired with a link to the original documentation for future reference.

### 7. End with 3–5 questions
Questions should assess **understanding**, not **memorization**.
- Weak: _"What is a decorator for retrieving the request body?"_
- Good: _"If `ValidationPipe` is set at the method level instead of globally, what are the consequences? Are there any scenarios where you would intentionally choose this configuration?"_

Write the questions in the **✅ Review & Quiz** section, **leave the answer field blank** — the user will provide their own answer in their own words.

## Boundaries
- **Do not** complete the hands-on work for the user. The lesson provides illustrative examples; the user completes the hands-on work themselves.
- **Do not** proceed with teaching if step 0 fails. State clearly that the documentation has not been retrieved, and suggest the user open the link to read along.
- **Do not** invent APIs. If a feature is not found in the docs/source, state clearly that you are not certain.- Write in **Vietnamese**, keep English technical terms (provider, guard, interceptor, dependency injection) unchanged — because these are terms the user will encounter in code and during interviews.