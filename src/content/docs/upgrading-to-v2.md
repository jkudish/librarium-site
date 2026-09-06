---
title: Upgrade from v1
description: Migrate a v1 installation and config to v2, review breaking changes, verify the result, and roll back safely.
order: 2
---

This guide is for an existing Librarium v1 installation. Version 2 changes the Node requirement, configuration schema, provider identities, workflows, execution modes, retry rules, run artifacts, and library exports.

## Before upgrading

1. Install Node.js 22.12.0 or newer if you use the npm package.
2. Finish and retrieve pending v1 background work. V2 does not recreate custody from the retired `async-tasks.json` store.
3. Preserve existing run directories. Completed output remains useful as historical evidence even when its provider IDs or file layout are no longer current.
4. Back up global and project config files with their existing permissions:

```bash
cp -p ~/.config/librarium/config.json ~/.config/librarium/config.v1.backup.json
test ! -f .librarium.json || cp -p .librarium.json .librarium.v1.backup.json
```

Do not delete the backups until the migrated config passes the checks in this guide.

## Upgrade the executable

Preview the detected release channel, then upgrade:

```bash
librarium upgrade --check
librarium upgrade --dry-run
librarium upgrade
librarium --version
```

Upgrading the executable does not rewrite a v1 config.

## Run the automated config migrator

The migrator parses v1 or v2 JSON, applies deterministic transformations, validates the complete result, and returns structured notices or issues. Previewing does not modify the source file.

```bash
librarium config migrate \
  --from ~/.config/librarium/config.json
```

The migrated JSON is written to stdout. Notices and issues go to stderr. Treat stdout as sensitive if the source config contains an inline API key. Do not send it to logs or a shared terminal.

To inspect the interaction between global and project config without writing either file:

```bash
librarium config migrate \
  --from ~/.config/librarium/config.json \
  --project ./.librarium.json
```

This is an effective merged preview, not a rewritten project layer. Do not use it as a replacement `.librarium.json`.
The project path must name an existing file when supplied.

Write a reviewed global migration to a new owner-only file:

```bash
librarium config migrate \
  --from ~/.config/librarium/config.json \
  --output ~/.config/librarium/config.v2.json
```

An existing destination is refused unless you add `--force`. Prefer a new path over `--force`. The write uses the same validated atomic, owner-only boundary as `saveConfigV2()`. On Windows it fails before writing unless Librarium can establish and verify an owner-only ACL.

## Review migration notices

The migrator handles mechanical changes, including:

| V1 input | V2 result |
| --- | --- |
| camelCase config fields | strict snake_case fields |
| `mixed` mode | `async`, with a notice |
| timeout values in seconds | inline/background attempt deadlines and poll interval in milliseconds |
| USD budget numbers | exact micro-USD integer strings |
| authored group names | `custom:<name>` |
| retired provider IDs | their exact current provider/profile identities |
| old Brave Answers credential reference | the separate Brave Answers credential reference |

The following cases require a decision rather than an automatic guess:

- **Custom providers:** migration never adds an executable provider to `trusted_provider_ids`. Review its npm package or script and execution profile before granting trust.
- **Name collisions:** if a migrated provider or `custom:<name>` would overwrite another authored value, migration returns an issue instead of discarding one side.
- **Invalid fallback:** a fallback must resolve to an implemented, compatible profile. Unavailable or ambiguous replacements are reported.
- **Project overrides:** global plus project input produces one effective preview. Keep project-specific values separate when rebuilding a v2 project layer.
- **Pending handles:** completed artifacts retain their recorded IDs, but an unfinished task cannot be resumed through a renamed provider.

## Activate and verify

Keep the v1 backup, place the reviewed v2 file at the configured global path, then run zero-network inspection first:

```bash
mv ~/.config/librarium/config.json ~/.config/librarium/config.v1.json
mv ~/.config/librarium/config.v2.json ~/.config/librarium/config.json

librarium config --global --json
librarium groups --json
librarium ls --json
librarium doctor --json
```

Expected result:

- The config file on disk has `version: 2` and snake_case fields.
- `config --global --json` reads it without a schema error. The output remains v1-shaped because the current CLI projects native v2 config into its compatibility model.
- `groups --json` lists the four built-ins and any migrated `custom:<name>` groups.
- `doctor --json` reports missing credentials as skipped or unavailable without rewriting the config.
- No command reports a retired provider ID or a schema error.

Only after those checks pass should you run a provider call. Choose one exact profile with reviewed credentials and pricing rather than starting with `all`:

```bash
librarium run "HTTP cache-control guidance" --providers exa/search --no-fallback
```

That command can incur provider charges. It is not required for the zero-network migration check.

## What changed in v2

### Provider selection and workflows

V2 selects a public profile as `provider_id/profile_id`. A provider can expose multiple profiles with different evidence or custody semantics. The built-in workflows are now exactly `quick`, `deep`, `visibility`, and `all`.

The old `raw`, `fast`, `llm`, `models`, `comprehensive`, `social`, and `xai` built-ins were removed. Recreate an authored selection as `custom:<name>` rather than reusing a reserved workflow name.

Retired IDs migrate as follows:

| Retired ID | V2 replacement |
| --- | --- |
| `perplexity-sonar` | `perplexity-sonar-pro/grounded` |
| `perplexity-deep` | `perplexity-sonar-deep/research` |
| `perplexity-pro-search` | `perplexity-sonar-pro/grounded` |
| `perplexity-advanced-deep` | `perplexity-sonar-deep/research` |
| `openai-deep` | `openai-research/research` |
| `openai-deep-o3` | `openai-research/research` |

### Requests, retries, and custody

The CLI and MCP server compile input into one validated request before provider dispatch. Request, inline-attempt, and background-attempt deadlines are separate. HTTP GET retries are bounded; mutating and streaming requests do not retry unless a mutating endpoint has an explicit, provider-supported idempotency policy.

Durable work persists a provider-scoped handle. If submission acceptance is unknown, Librarium does not resubmit or launch a fallback until custody is resolved. Read [Requests, retries, and fallbacks](/docs/request-and-retry) before repeating failed work manually.

### Run artifacts

New runs use canonical `run.json` schema version 3 and artifact version `3.0.0`. Provider output and metadata filenames include a sanitized stem and SHA-256 digest. Read the concrete `outputFile` and `metaFile` names from `run.json`; do not construct filenames from provider IDs.

The separate provider metadata, source, and JSONL contracts are version `1.0.0`. The legacy `async-tasks.json` file is no longer an execution authority.

### Package imports

| Import | V2 responsibility |
| --- | --- |
| `librarium` | Worker-safe schemas, migration, validation, and public catalog |
| `librarium/core` | Injected planning, transport, coordination, and execution primitives |
| `librarium/node` | Config files, credentials, trusted custom providers, and Node services |

Code that imported dispatcher, registry, concrete adapter constructors, file runners, or raw keychain helpers from the package root must move to the supported boundary or keep that ownership in the application.

## Roll back

Do not try to convert v2 output back into v1 in place. Restore the backup and reinstall the prior v1 package:

```bash
mv ~/.config/librarium/config.json ~/.config/librarium/config.v2.failed.json
mv ~/.config/librarium/config.v1.json ~/.config/librarium/config.json
npm install -g librarium@1.4.1
librarium doctor
```

Keep v2 run directories separate while rolled back. If a v2 durable task may still be active, preserve its run directory so a v2 installation can reconcile the saved handle later.
