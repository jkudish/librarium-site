---
title: Commands
description: "The core research workflow commands: run, answer, status, browse, usage, and related flags."
order: 3
---

## Run and answer

```bash
librarium run <query> [options]
librarium answer <query> [options]
```

| Option | Meaning |
| --- | --- |
| `--providers <ids>` | Comma-separated provider IDs for the Node CLI compatibility layer |
| `--group <name>` | Select a v2 workflow or `custom:<name>` |
| `--mode <mode>` | `sync`, `async`, or `mixed` |
| `--output <dir>` | Run-directory base path |
| `--parallel <n>` | Concurrency limit |
| `--timeout <n>` | Inline per-attempt timeout in seconds; does not replace a background or whole-request deadline |
| `--max-cost <usd>` | Require bounded primary/reserve estimates, then stop launches when reported spend reaches the bound |
| `--max-estimated-cost <usd>` | Require bounded primary/reserve estimates and fit the complete primary plan before admission |
| `--yes` | Skip the deep preflight confirmation |
| `--no-fallback` | Require the primary matrix |
| `--json` | Write machine output to stdout |
| `--refine` | Refine the query before dispatch |
| `--html` | Write an HTML presentation |
| `--jsonl` | Write JSONL presentation records |
| `--open` | Open generated presentation output |

`answer` accepts all run options and adds `--verify`. Verification is bounded and opt-in. Incomplete, budget-limited, or failed verification leaves the original answer intact.

## Preview before paying

```bash
librarium plan "HTTP caching" --json
librarium plan "HTTP caching" --answer --verify --json
```

`plan` uses the execution preflight path but stops before adapter initialization. It makes no provider calls, imports no custom modules, spawns no scripts, runs no helpers, and creates no run directory or ledger. Local credential-reference resolution may consult the OS keychain after structural validation; presence is not authentication.

The versioned receipt includes exact profiles and targets, workflow omissions, fallback reserve, all four paid stages, known/unknown estimates, effective limits and sources, and diagnostics. It previews first-attempt wallet admission with future synthesis capacity reserved. Later stages remain conditional on prior spending; helpers with unknown estimates can be skipped under hard budgets even when research is admitted. It is not an executable frozen plan, account check, price quote, or final-bill guarantee. Blocked plans and invalid syntax exit 2; JSON-mode errors remain structured and sanitized. `--verify` requires `--answer`.

## Offline and live doctor

`doctor` checks config and credential presence without networking or custom-code execution. JSON rows separate `credentialStatus` from `connectivity`; `unchecked` is not successful authentication. Custom declarations may have unknown credential status. Disabled or untrusted providers are skipped.

Exit 1 means a connectivity failure (including an enabled provider missing its key) or config/initialization failure, in both text and JSON modes. Exit 0 does not establish that every provider is usable. Initialization failures may emit stderr text instead of a JSON row array. Only `doctor --live` runs available provider tests and loads trusted custom providers; it may incur charges. Providers without tests report `no-test`.

## Complete command ledger

| Command | Options |
| --- | --- |
| `plan` | `--providers`, `--group`, `--mode`, `--parallel`, `--timeout`, `--max-cost`, `--max-estimated-cost`, `--no-fallback`, `--refine`, `--answer`, `--verify`, `--json` |
| `answer` | `--providers`, `--group`, `--mode`, `--output`, `--parallel`, `--timeout`, `--max-cost`, `--max-estimated-cost`, `--yes`, `--no-fallback`, `--json`, `--refine`, `--verify`, `--html`, `--jsonl`, `--open` |
| `live-validation` | `--targets`, `--approval`, `--confirm`, `--paid`, `--continue`, `--candidate-root`, `--artifact-root`, `--artifact`, `--fixture` |
| `status` | `--wait`, `--retrieve`, `--json` |
| `usage` | `--days`, `--json`, `--output` |
| `browse` | `--output` |
| `html` | `--open` |
| `jsonl` | no explicit option |
| `refine` | `--json` |
| `completions` | no explicit option |
| `ls` | `--json` |
| `groups` | `--json` |
| `init` | `--auto` |
| `doctor` | `--json`, `--live` |
| `config` | `--json`, `--global`, `--menu` |
| `config migrate` | `--from`, `--project`, `--output`, `--force` |
| `cleanup` | `--days`, `--all`, `--interactive`, `--dry-run`, `--yes`, `--output`, `--json` |
| `clear` | `--interactive`, `--dry-run`, `--yes`, `--output`, `--json` |
| `upgrade` | `--check`, `--dry-run`, `--force` |
| `install-skill` | `--force`, `--dry-run` |
| `mcp` | no explicit option |

The public commands are `run`, `plan`, `answer`, `live-validation`, `status`, `usage`, `browse`, `html`, `jsonl`, `refine`, `completions`, `ls`, `groups`, `init`, `doctor`, `config`, `cleanup`, `clear`, `upgrade`, `install-skill`, and `mcp`.

`config migrate --from <global-path>` previews a v1-to-v2 migration. `--project <project-path>` adds an existing project layer to the effective preview and cannot be combined with `--output`. Writing requires an explicit `--output <new-path>` and a v1 global source. Existing destinations require `--force`; source files are never output targets. Follow [Upgrade from v1](/docs/upgrading-to-v2) before activating the result.

## Resume and validation

```bash
librarium status --wait --retrieve
librarium live-validation --fixture /absolute/path/to/fixture.json
```

Use `status --wait --retrieve` to finish durable async work. Use `live-validation --fixture` for an offline fixture replay. Live validation can make paid provider calls, so review the selected targets and provider pricing before using `--paid`.

See [Requests, retries, and fallbacks](/docs/request-and-retry) before manually repeating a failed submission. HTTP retry, durable-task reconciliation, and provider fallback are separate mechanisms.
