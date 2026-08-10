# Postman — manual API testing

## Why use Postman when automated tests already exist?

The two tools answer different questions:

|                                       | Answers the question                                           |
| ------------------------------------- | -------------------------------------------------------------- |
| **Automated tests** (jest, supertest) | _"Does this behavior remain correct after I change the code?"_ |
| **Postman**                           | _"How is this API actually used?"_                             |

Postman is where you **explore** the API: try a request, inspect the actual response, change the payload, and see how errors are returned. It is also **living documentation** that you send to frontend developers or QA — they can import the collection and call the API immediately without reading the code.

In professional work, a Postman collection is often the first thing the frontend team asks for when you finish an endpoint.

## Collection structure

Collection `NestJS Training API` is organized into folders and grows with the learning roadmap:

| Folder     | Starting lesson                                             |
| ---------- | ----------------------------------------------------------- |
| `Health`   | L01 — `GET /`                                               |
| `Tasks`    | L04 — CRUD in-memory, then connected to the database in L07 |
| `Auth`     | L12–L15 — register, login, refresh token                    |
| `Projects` | Phase 4 — including owner/member authorization checks       |
| `Comments` | Phase 4                                                     |

## Environment variables

Use variables instead of hardcoding the URL in each request — changing environments then requires changing only one place.

| Variable       | Local value             | Notes                                                               |
| -------------- | ----------------------- | ------------------------------------------------------------------- |
| `baseUrl`      | `http://localhost:3000` | Change when API versioning is added in L19                          |
| `accessToken`  | _(leave blank)_         | The login request writes to this variable automatically (see below) |
| `refreshToken` | _(leave blank)_         | Same as above                                                       |

**A major time-saving tip:** in the _Scripts → Post-response_ tab of the login request, add:

```js
const body = pm.response.json();
pm.environment.set('accessToken', body.accessToken);
pm.environment.set('refreshToken', body.refreshToken);
```

From then on, every request only needs Authorization = `Bearer {{accessToken}}`, and you never need to copy a token manually again.

## Conventions

- Each endpoint should have **at least 2 requests**: one happy path and one error case (`404`, `401`, `422`). Verifying that errors are returned as designed is as important as verifying success.
- Each request should have a saved **example response** — that is the collection's "documentation".
- After changing an endpoint, update the collection **in the same lesson**. An outdated collection is worse than no collection because it makes users trust incorrect information.

## Connection to later lessons

- **L18 (Swagger)** — Nest will generate the OpenAPI specification from decorators. You can then import that specification into Postman to generate the collection instead of creating requests manually. This is why Swagger is worth the investment: one definition source, usable in many places.
- **L17 (E2E test)** — the same request, but run automatically with result assertions. Postman is for exploration; e2e is for protection.
