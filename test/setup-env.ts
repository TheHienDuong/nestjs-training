// Test setup — provide required non-secret configuration.

// E2E tests create the Nest application directly, so main.ts is not executed.
// AppModule still validates configuration while it is imported.
process.env.NODE_ENV ??= 'test';
process.env.PORT ??= '3000';

// Always source DATABASE_URL from DATABASE_URL_TEST so e2e tests cannot
// silently inherit and mutate the development database even when DATABASE_URL
// is already set in the environment (e.g. from a .env file).
process.env.DATABASE_URL =
  process.env.DATABASE_URL_TEST ??
  'postgresql://postgres:postgres@localhost:5433/nestjs_task_management_test?schema=public';
