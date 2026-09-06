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
| `--timeout <n>` | Per-provider timeout |
| `--max-cost <usd>` | Reported-cost launch circuit breaker |
| `--max-estimated-cost <usd>` | Reserve exact known pre-dispatch estimates |
| `--yes` | Skip the deep preflight confirmation |
| `--no-fallback` | Require the primary matrix |
| `--json` | Write machine output to stdout |
| `--refine` | Refine the query before dispatch |
| `--html` | Write an HTML presentation |
| `--jsonl` | Write JSONL presentation records |
| `--open` | Open generated presentation output |

`answer` accepts all run options and adds `--verify`. Verification is bounded and opt-in. Incomplete, budget-limited, or failed verification leaves the original answer intact.

## Complete command ledger

| Command | Options |
| --- | --- |
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
| `doctor` | `--json` |
| `config` | `--json`, `--global`, `--menu` |
| `config migrate` | `--from`, `--project`, `--output`, `--force` |
| `cleanup` | `--days`, `--all`, `--interactive`, `--dry-run`, `--yes`, `--output`, `--json` |
| `clear` | `--interactive`, `--dry-run`, `--yes`, `--output`, `--json` |
| `upgrade` | `--check`, `--dry-run`, `--force`, `--target` |
| `install-skill` | `--force`, `--dry-run` |
| `install-plugin` | `--force`, `--dry-run` |
| `mcp` | no explicit option |

The public commands are `run`, `answer`, `live-validation`, `status`, `usage`, `browse`, `html`, `jsonl`, `refine`, `completions`, `ls`, `groups`, `init`, `doctor`, `config`, `cleanup`, `clear`, `upgrade`, `install-skill`, `install-plugin`, and `mcp`.

`config migrate --from <global-path>` previews a v1-to-v2 migration. `--project <project-path>` adds an existing project layer to the effective preview and cannot be combined with `--output`. Writing requires an explicit `--output <new-path>` and a v1 global source. Existing destinations require `--force`; source files are never output targets. Follow [Upgrade from v1](/docs/upgrading-to-v2) before activating the result.

## Resume and validation

```bash
librarium status --wait --retrieve
librarium live-validation --fixture /absolute/path/to/fixture.json
```

Use `status --wait --retrieve` to finish durable async work. Use `live-validation --fixture` for an offline fixture replay. Live validation can make paid provider calls, so review the selected targets and provider pricing before using `--paid`.

`upgrade --target <version>` exists only for local and fixture tests. It requires `--dry-run` and cannot be combined with `--check`.

See [Requests, retries, and fallbacks](/docs/request-and-retry) before manually repeating a failed submission. HTTP retry, durable-task reconciliation, and provider fallback are separate mechanisms.
