// [NES-7 · lesson 06] Test setup — provide required non-secret configuration.

// E2E tests create the Nest application directly, so main.ts is not executed.
// AppModule still validates configuration while it is imported.
process.env.NODE_ENV ??= 'test';
process.env.PORT ??= '3000';
process.env.DATABASE_URL ??=
  'postgresql://postgres:postgres@localhost:5433/nestjs_training?schema=public';
