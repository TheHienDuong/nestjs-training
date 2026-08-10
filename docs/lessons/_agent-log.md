# 🤖 Agent assignment log

> Every time you assign work to an AI agent, record one line. After the course, you will have **your own real data** to answer a very practical question in the profession: _which work should be assigned to AI, and which work helps you learn more when you do it yourself?_
>
> Record failures too. The lines with "poor results" are the most valuable lines.

| Date       | Lesson | Agent       | Assigned work                                                                                                              | Result  | Comments                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------- | ------ | ----------- | -------------------------------------------------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-10 | L00    | Claude Code | Build the entire Phase 0 infrastructure: docs, ADR, CI, husky/commitlint, docker-compose, 4 skills, lesson notes L00 + L01 | ✅ Good | "Building the framework + writing documentation" is the kind of work an agent does well: clear standards, large volume, little need for business judgment. Notably, the agent checked documentation URLs from the source repository `nestjs/docs.nestjs.com` instead of trusting memory — then discovered that `/middleware` corresponds to the `middlewares.md` file, and several paths in the initial plan were wrong. Lesson: **requiring an agent to cite sources exposes errors**. |

## Suggested result classification

| Symbol                              | Meaning                                                                                       |
| ----------------------------------- | --------------------------------------------------------------------------------------------- |
| ✅ Good                             | Usable almost unchanged                                                                       |
| 🟡 Requires substantial corrections | The direction is correct, but details are wrong/not idiomatic                                 |
| 🔴 Poor                             | The direction is wrong; fixing it takes longer than doing it yourself                         |
| 🎓 I learn more by doing it myself  | Even when the agent's output is good — this is the most important note for a learning project |
