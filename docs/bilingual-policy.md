# 🌐 Bilingual Policy — two-version rule (vi/en)

> This is the official policy page. Every agent (Claude Code, Hermes, codex, opencode...) touching docs/config **must read this file first**.

## Purpose

The repo is mirrored into English for the company GitLab (`origin` remote) — the daily canonical repository, which only accepts English content under a dedicated identity. The Vietnamese version (`main`) remains the primary place for learning content. The two versions must **always be equivalent in content**, differing only by language.

## Two-version structure

| Branch                    | Language   | Role                                             |
| ------------------------- | ---------- | ------------------------------------------------ |
| `main`                    | Vietnamese | Learning source and Vietnamese version           |
| `example/nestjs-training` | English    | Daily canonical version and only GitLab source   |

Code in `src/` and `test/` is **identical** in both versions — there is no per-language logic. Only docs (`docs/`, `AGENTS.md`, `CLAUDE.md`, `.hermes.md`, README...) and config with natural-language comments/descriptions differ between the two versions.

## Workflow when changing docs

1. Edit the Vietnamese version on `main` as usual.
2. Translate exactly the changed content into English and apply it to `example/nestjs-training` — keep the file structure, headings, tables, code fences; translate only the natural-language text. Technical terms (provider, guard, interceptor, pipe, DI, decorator...) stay the same in both versions.
3. Do not translate code comments or identifiers in `src/`/`test/` — both versions share the same code.
4. Run the checklist below before considering the task done.

## GitLab sync workflow

- GitLab **only accepts the English version** from `example/nestjs-training`. Never push the Vietnamese version (`main`) to the `origin` remote.
- Commits on GitLab: author = `hienduong-agility`, **no** `Co-authored-by` trailer, commit message in English following Conventional Commits.
- Update the English canonical branch for each daily milestone before opening or updating its GitLab merge request.

## Checklist before calling it done

- [ ] The 2 versions (`main` and `example/nestjs-training`) do not drift beyond language — `git diff` between the 2 branches (ignoring translation differences) must be empty.
- [ ] The EN version has no Vietnamese characters left (diacritics, leftover Vietnamese words).
- [ ] Code (`src/`, `test/`) is identical in both versions.
- [ ] If GitLab was synced: author = `hienduong-agility`, no trailer, English message.

## Who does what

| Task                                                             | Who                                                             |
| ---------------------------------------------------------------- | --------------------------------------------------------------- |
| Write/edit Vietnamese docs on `main`                             | User (hands-on) or Claude Code (docs/ADR/workflow)              |
| Translate and update the EN version on `example/nestjs-training` | Claude Code or the agent assigned the docs task (per AGENTS.md) |
| Check the diff between the 2 versions + scan EN for Vietnamese   | Hermes (independent verification) or the agent doing the task   |
| Sync the EN version to GitLab                                    | Hermes or user — use `origin` for the canonical GitLab remote   |
| Decide when to sync GitLab (per milestone)                       | User                                                            |

## See also

- `AGENTS.md` — Bilingual Policy section
- `CLAUDE.md` — Bilingual Policy section
- `.hermes.md` — section 8, Bilingual line
- `docs/workflow/WORKFLOW.md` — Conventions › Bilingual
- `docs/workflow/AGENT-MODEL.md` — final paragraph
