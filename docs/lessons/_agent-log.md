# 🤖 Agent Task Assignment Log

> Every time you assign a task to an AI agent, log one entry. After the course, you will have **your own real data** to answer a very practical industry question: _which tasks should be assigned to AI, and which ones should you do yourself to learn more?_

> Log failures too. "Poor result" entries are the most valuable ones.

| Date       | Lesson | Agent       | Task Assigned                                                                                                        | Result  | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------- | ------ | ----------- | -------------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-10 | L00    | Claude Code | Built full Phase 0 infrastructure: docs, ADR, CI, husky/commitlint, docker-compose, 4 skills, lesson notes L00 + L01 | ✅ Good | The task of "building the framework + writing documentation" is the type of work agents excel at: it has clear standards, large volume, and requires little business judgment. Notably: the agent looked up documentation URLs from the source repo `nestjs/docs.nestjs.com` instead of relying on memory — then it discovered that `/middleware` maps to the `middlewares.md` file, and some paths in the initial plan were incorrect. Lesson learned: **forcing the agent to cite sources surfaces errors**. |

## Suggestions for Result Classification

| Symbol                              | Meaning                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| ✅ Good                             | Usable almost as-is                                                                         |
| 🟡 Requires many fixes              | Correct direction but details are wrong or not idiomatic                                    |
| 🔴 Poor                             | Wrong direction, takes longer to fix than doing it yourself                                 |
| 🎓 I learn more when I do it myself | Even if the agent's output is good — this is the most important note for a learning project |

---

<!-- CO-OP TRANSLATOR DISCLAIMER START -->

**Disclaimer**:
This document has been translated using AI translation service [Co-op Translator](https://github.com/Azure/co-op-translator). While we strive for accuracy, please be aware that automated translations may contain errors or inaccuracies. The original document in its native language should be considered the authoritative source. For critical information, professional human translation is recommended. We are not liable for any misunderstandings or misinterpretations arising from the use of this translation.
<!-- CO-OP TRANSLATOR DISCLAIMER END -->
