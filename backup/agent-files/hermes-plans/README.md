# Hermes Agent Plans Backup

This directory is a version-controlled backup of the Markdown planning documents
that were previously stored under the local, Git-ignored `.hermes/plans/`
directory.

## Scope

- Source: `.hermes/plans/*.md`
- The source files are preserved byte-for-byte, including their original names.
- Runtime state is intentionally excluded: `.hermes/runs/`, `.hermes/tmp/`,
  `.claude/settings.local.json`, `.claude/.headroom_wrap_marker.json`, and
  `.codex/hooks.json` are not part of this backup.
- `MANIFEST.sha256` records the checksum of every backed-up file for future
  integrity checks.

## Agent governance note

The current user decision is that `agy` is the official counter-view agent.
The historical plans may contain earlier `opencode` references; those references
are preserved intentionally because this folder is an archive, not a rewrite of
historical records.

## Restore/check commands

From the repository root:

```bash
cd backup/agent-files/hermes-plans
shasum -a 256 -c MANIFEST.sha256
```

To compare an archived file with its original local plan from the repository root:

```bash
diff -u \
  .hermes/plans/<file>.md \
  backup/agent-files/hermes-plans/<file>.md
```
