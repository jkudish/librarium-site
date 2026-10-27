---
title: Upgrade from v1
description: Automatic backed-up v3 config migration, renamed commands, and old Run boundaries.
order: 2
---

npm needs Node.js 22.12 or newer. Preserve pending v1 tasks and their directories with a matching 1.x reader.

## Config migration

Loading an unversioned/1.x config saves its original bytes to `config.json.v1.backup` before writing version 3. Existing backups are never overwritten. Backup or validation failure prevents the new write. Config version 2 never shipped.

Provider entries become flat sources; extra profiles become source options. For example, combined Grok becomes `grok` with `search: both`. Environment references become `env:ENV_VAR`. User groups keep their names; the old visibility roster becomes a saved engine group. Removed modes/fallback settings produce notices.

Inspect notices and run `librarium setup --check` to verify the migrated config. To roll back, preserve the new config, restore the backup, and run the matching 1.x binary. Do not overwrite pending Run data.

## Replacements

| 1.x | 2.0 |
| --- | --- |
| `run` | `research` |
| `plan` | `research --dry-run` |
| `status` | `show` |
| `answer` | `summarize` |
| `ls` | `sources` |
| `init`, `doctor` | `setup`, `setup --check` |
| `-p`, `-g`, `custom:` names | `--only` / `--skip` with flat names |
| `--mode` | Automatic execution; `--deep` selects deep variants |
| `--max-estimated-cost` | `--max-cost` |
| Fallback reserves | Removed; no automatic source substitution |
| `refine` | Removed; write the question directly |

Removed commands fail with replacement guidance. Groups are user lists, not built-ins. The default set is all set-up research sources; engines are explicitly named.

## Runs and agents

New Runs have `run_` + ULID ids, public `run.json`, versioned private `state.json`, answers, and redacted evidence. `show` does not read 1.x folders. Keep old folders separate.

Use `createLibrarium().research/get/sources/summarize`. Root/node use filesystem storage; core is runtime-neutral with a memory default. Custom stores implement four methods.

MCP now exposes only `research`, `get_run`, `list_sources`. Requests use `question`, `depth`, `only`, `skip`, `max_cost`, `dry_run`, and `wait_seconds`. Read source evidence with `get_run` and cursor paging. Install the version-matched bundled skill rather than reusing old instructions.
