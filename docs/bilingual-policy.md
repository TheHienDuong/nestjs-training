# 🌐 Bilingual Policy — two-version rule (vi/en)

> This is the official policy page. Every agent (Claude Code, Hermes, codex, opencode...) touching docs/config **must read this file first**.

## Purpose

The repo is mirrored into English so the docs/governance history stays readable to reviewers and tools that expect English content. **Both language versions live on GitHub only** (`github` remote) — GitLab (`origin`, the primary code repository and merge-of-record) does not receive docs/governance at all, only clean application code/config (`README.md` is the sole Markdown exception). The Vietnamese version (`main`) remains the primary place for learning and daily work. The two versions must **always be equivalent in content**, differing only by language.

## Two-version structure

| Branch                    | Language   | Role                                         |
| ------------------------- | ---------- | -------------------------------------------- |
| `main`                    | Vietnamese | Primary version, daily learning and work     |
| `example/nestjs-training` | English    | Mirror version, kept on GitHub (docs backup) |

Code in `src/` and `test/` is **identical** in both versions — there is no per-language logic. Only docs (`docs/`, `AGENTS.md`, `CLAUDE.md`, `.hermes.md`, README...) and config with natural-language comments/descriptions differ between the two versions.

## Workflow when changing docs

1. Edit the Vietnamese version on `main` as usual.
2. Translate exactly the changed content into English and apply it to `example/nestjs-training` — keep the file structure, headings, tables, code fences; translate only the natural-language text. Technical terms (provider, guard, interceptor, pipe, DI, decorator...) stay the same in both versions.
3. Do not translate code comments or identifiers in `src/`/`test/` — both versions share the same code.
4. Run the checklist below before considering the task done.

## GitLab clean-code scope (why docs are excluded)

- **GitLab (`origin`) is the primary development repository and merge-of-record** (target state — GitLab MR auth/permissions are currently unresolved and must be verified before this is operational; see `docs/workflow/WORKFLOW.md` "Code review & merge"). GitLab receives **only clean application code/required config** — `README.md` is the sole Markdown exception. Neither language version of `docs/`, ADRs, `AGENTS.md`, `CLAUDE.md`, or `.hermes.md` is pushed to GitLab.
- Governance/docs backup (both vi/en versions) stays on **GitHub** (`github` remote) only.
- Push clean code/config to GitLab **after each verified commit or verified change-set**, not only at milestones (this cadence applies to code/config, not docs — docs never go to GitLab, so no docs sync cadence applies).
- Commits pushed to GitLab: author = `hienduong-agility`, **no** `Co-authored-by` trailer, commit message in English following Conventional Commits.

## Checklist before calling it done

- [ ] The 2 versions (`main` and `example/nestjs-training`) do not drift beyond language — `git diff` between the 2 branches (ignoring translation differences) must be empty.
- [ ] The EN version has no Vietnamese characters left (diacritics, leftover Vietnamese words).
- [ ] Code (`src/`, `test/`) is identical in both versions.
- [ ] Confirm the change is docs/governance (stays on GitHub only) vs. clean code/config (may go to GitLab) — do not push docs/governance files to GitLab under any circumstance.

## Who does what

| Task                                                             | Who                                                             |
| ---------------------------------------------------------------- | --------------------------------------------------------------- |
| Write/edit Vietnamese docs on `main`                             | User (hands-on) or Claude Code (docs/ADR/workflow)              |
| Translate and update the EN version on `example/nestjs-training` | Claude Code or the agent assigned the docs task (per AGENTS.md) |
| Check the diff between the 2 versions + scan EN for Vietnamese   | Hermes (independent verification) or the agent doing the task   |
| Push clean code/config to GitLab (`origin`)                      | Hermes or user — never push docs/governance files to GitLab     |
| Decide GitLab MR merge (once auth verified)                      | User (sole merger, target state until verified)                 |

## See also

- `AGENTS.md` — Bilingual Policy section
- `CLAUDE.md` — Bilingual Policy section
- `.hermes.md` — section 8, Bilingual line
- `docs/workflow/WORKFLOW.md` — Conventions › Bilingual
- `docs/workflow/AGENT-MODEL.md` — final paragraph
