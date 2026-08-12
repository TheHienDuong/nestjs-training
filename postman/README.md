# Postman — Manually test APIs
## Why use Postman when you already have automated tests?
Two tools answer two different questions:
|                                    | Answers the question                                         |
| ---------------------------------- | ------------------------------------------------------- |
| **Automated tests** (jest, supertest) | _"Is this behavior still correct after I modify the code?"_ |
| **Postman**                        | _"How is this API actually used in practice?"_                   |
Postman is where you **explore** APIs: try out a request, view the actual response, modify the payload, check what errors are returned. It also serves as **living documentation** that you share with frontend developers or QA — they can import the collection and call the API immediately, no need to read the code.
In the industry, a Postman collection is usually the first thing the frontend team asks for when you finish an endpoint.
## Collection structure
The `NestJS Training API` collection is organized into folders, scaled according to the learning path:
| Folder     | From lesson                                       |
| ---------- | ----------------------------------------------- |
| `Health`   | L01 — `GET /`                                   |
| `Tasks`    | L04 — In-memory CRUD, then connect to the database in L07 |
| `Auth`     | L12–L15 — register, login, refresh token        |
| `Projects` | Phase 4 — includes owner/member authorization checks  || `Comments` | Phase 4                                         |
## Environment variables
Use environment variables, don't hardcode URLs into individual requests — you only need to change one place when switching environments.

| Variable     | Local value          | Notes                                      |
| ------------ | -------------------- | ------------------------------------------ |
| `baseUrl`    | `http://localhost:3000` | Change when API versioning is implemented at L19 |
| `accessToken`  | _(leave empty)_            | The login request will automatically write to this variable (see below) |
| `refreshToken` | _(leave empty)_            | Same as above                                     |

**Pro tip that saves a ton of time:** In the _Scripts → Post-response_ tab of the login request, add:

```js
const body = pm.response.json();
pm.environment.set('accessToken', body.accessToken);
pm.environment.set('refreshToken', body.refreshToken);
```

From that point on, all you need to do for every request is set Authorization = `Bearer {{accessToken}}`, and you will never have to manually copy the token again.

## Conventions

- Each endpoint should have **at least 2 requests**: one happy path and one error case (`404`, `401`, `422`). Verifying that returned errors match the design is just as important as verifying successful responses.
- Every request should have a saved **example response** — this serves as the collection's built-in documentation.- After changing the endpoint, update the collection **in the same lesson**. An outdated collection is worse than no collection at all, because it causes users to trust incorrect information.

## Relation to following lessons

- **L18 (Swagger)** — Nest automatically generates OpenAPI specs from decorators. You can then import that spec into Postman to auto-generate a collection, instead of manually creating requests. This is why Swagger is worth the investment: a single source of definition, usable in multiple places.
- **L17 (E2E test)** — the same requests, which run automatically and assert results. Postman is for exploration; E2E is for protection.