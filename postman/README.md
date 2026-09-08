# Postman — Manual API Testing

## Why use Postman when you already have automated tests?

These two tools answer two different questions:

|                                       | Answers the question                                        |
| ------------------------------------- | ----------------------------------------------------------- |
| **Automated tests** (jest, supertest) | _"Is this behavior still correct after I change the code?"_ |
| **Postman**                           | _"How is this API actually used in practice?"_              |

Postman is where you **explore** APIs: try out a request, view the real response, modify the payload, see what errors are returned. It is also **living documentation** that you share with frontend developers or QA — they can import the collection and call the API immediately, no need to read code.

In the industry, a Postman collection is usually the first thing the frontend team asks for when you finish an endpoint.

## Collection structure

The `NestJS Training API` collection is organized into folders, following the learning path in order:

| Folder     | From lesson                                           |
| ---------- | ----------------------------------------------------- |
| `Health`   | L01 — `GET /`                                         |
| `Tasks`    | L04 — In-memory CRUD, then connect to database in L07 |
| `Auth`     | L12–L15 — register, login, refresh token              |
| `Projects` | Phase 4 — includes owner/member permission checks     |
| `Comments` | Phase 4                                               |

## Environment variables

Use variables instead of hardcoding URLs into each request — you only need to change one place to switch environments.

| Variable       | Local value             | Notes                                                                   |
| -------------- | ----------------------- | ----------------------------------------------------------------------- |
| `baseUrl`      | `http://localhost:3000` | Change when API versioning is added in L19                              |
| `accessToken`  | _(leave blank)_         | The login request will automatically write to this variable (see below) |
| `refreshToken` | _(leave blank)_         | Same as above                                                           |

**Time-saving tip:** In the login request's _Scripts → Post-response_ tab, add:

```js
const body = pm.response.json();
pm.environment.set('accessToken', body.accessToken);
pm.environment.set('refreshToken', body.refreshToken);
```

From then on, all you need to do for every request is set Authorization = `Bearer {{accessToken}}` and you will never have to copy the token manually again.

## Conventions

- Each endpoint should have **at least 2 requests**: one happy path and one error case (`404`, `401`, `422`). Verifying that returned errors match the design is just as important as verifying successful responses.
- Each request should have a **saved example response** — this is the "documentation" part of the collection.
- After modifying an endpoint, update the collection **in the same lesson**. An outdated collection is worse than no collection at all, because it makes users trust incorrect information.

## Relation to later lessons

- **L18 (Swagger)** — Nest will automatically generate an OpenAPI spec from decorators. At that point, you can import that spec into Postman to auto-generate the collection instead of creating requests manually. This is why Swagger is worth investing in: one source of truth, usable in many places.
- **L17 (E2E tests)** — the same requests, but run automatically and assert results. Use Postman for exploration; use e2e tests for protection.

---

<!-- CO-OP TRANSLATOR DISCLAIMER START -->

**Disclaimer**:
This document has been translated using AI translation service [Co-op Translator](https://github.com/Azure/co-op-translator). While we strive for accuracy, please be aware that automated translations may contain errors or inaccuracies. The original document in its native language should be considered the authoritative source. For critical information, professional human translation is recommended. We are not liable for any misunderstandings or misinterpretations arising from the use of this translation.
<!-- CO-OP TRANSLATOR DISCLAIMER END -->
