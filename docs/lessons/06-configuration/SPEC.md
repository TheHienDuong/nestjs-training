## 🎯 Learning objectives

- [ ] Use `@nestjs/config` with `ConfigModule.forRoot`
- [ ] Validate the environment variable schema (Joi or class-validator) — the app refuses to start if a variable is missing
- [ ] Inject `ConfigService` instead of reading `process.env` directly in business logic

## 📚 Official documentation

- [https://docs.nestjs.com/techniques/configuration](https://docs.nestjs.com/techniques/configuration)

## 🔗 Connecting to prior knowledge

Express + `dotenv`: reads `process.env.X` scattered everywhere, nothing guarantees the variable exists ↔ Nest: `ConfigService` centralizes it, with validation right at bootstrap — a missing env variable surfaces immediately at startup instead of at runtime.

## 🛠 Hands-on

1. `.env.example` already exists at the repo root (from L00) — inspect and reuse it, do not create a new file. Only add a variable to this file if the hands-on genuinely needs one that doesn't exist yet. The validation schema only needs to cover the variables the current code actually uses (`NODE_ENV`, `PORT`) — do not validate variables meant for later lessons (`DATABASE_URL`, `REDIS_HOST`, JWT, rate limiting).
2. Write the validation schema (Joi or `class-validator`, your choice), then try deleting/breaking a variable to see the app refuse to start.

## ✅ Definition of Done

- [ ] Lesson note complete
- [ ] Tests pass, quiz pass, PR merged
