# 🤖 Agent Task Assignment Log

> Every time you assign a task to an AI agent, log one entry. After the course, you will have **your own real data** to answer a very practical career question: _what tasks should be assigned to AI, and what tasks should you do yourself to learn more?_
>
> Also log failures. Entries with "poor results" are the most valuable ones.

| Date       | Lesson | Agent       | Assigned Task                                                                                                | Result | Notes                                                                                                                                                                                                                                                                                                                                                                     |
| ---------- | ------ | ----------- | ------------------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- || 2026-08-10 | L00 | Claude Code | Built the entire Phase 0 infrastructure: docs, ADR, CI, husky/commitlint, docker-compose, 4 skills, L00 + L01 lesson notes | ✅ Good | The "framework scaffolding + documentation writing" task is one that agents handle very well: clear standards, large scope, and minimal need for business domain judgment. Notable: the agent fetched documentation URLs from the source repository `nestjs/docs.nestjs.com` instead of relying on memorized information — it then correctly mapped the `/middleware` route to the `middlewares.md` file, and several paths in the initial plan were incorrect. Lesson learned: **requiring agents to cite their sources surfaces errors**. |

## Suggestions for result classification
| Symbol | Meaning |
| --- | --- |
| ✅ Good | Usable almost as-is |
| 🟡 Requires many fixes | Correct direction but details are wrong or not idiomatic |
| 🔴 Poor | Wrong direction, takes longer to fix than doing it manually |
| 🎓 I learn more when doing it myself | Even if the agent's output is good — this is the most important note for a learning project |