# API testing with Postman

Import the collection from this directory into Postman, set the base URL to `http://localhost:3000`, and start with the health or task requests.

## Local setup

1. Copy `.env.example` to `.env` and start the local services with `pnpm db:up`.
2. Apply migrations with `pnpm exec prisma migrate deploy`.
3. Start the API with `pnpm start:dev`.
4. Set the collection variable `baseUrl` to `http://localhost:3000`.

## Request guidance

Run requests in an order that matches their prerequisites. Use the response body and status code to confirm the result of each request. When an endpoint changes, update the collection and its expected responses in the same change.

Do not store real credentials, access tokens, or production URLs in the collection. Use local variables and safe placeholders.
