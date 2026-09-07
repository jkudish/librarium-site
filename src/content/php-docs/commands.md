---
title: Artisan commands
description: Preview, dispatch, inspect, and automate Laravel research commands.
order: 2
---

Librarium registers three Artisan commands: `librarium:query`,
`librarium:status`, and `librarium:profiles`.

## Query

```bash
php artisan librarium:query {query?} \
  --profile=PROFILE --group=GROUP --fallback=PROFILE \
  --timeout=SECONDS --max-cost=AMOUNT --currency=USD \
  --run --queue --agent
```

In an interactive terminal, missing input and selection can be prompted. The
command always compiles a preview before offering `Run now`, `Queue`, or
`Exit without dispatching`. Supplying a query or selection does not itself
dispatch. `--run` and `--queue` are mutually exclusive explicit actions.

Repeat `--profile` to select several Profiles and repeat `--fallback` to retain
fallback priority. `--profile` cannot be combined with `--group`.

```bash
# Preview only: no provider call
php artisan librarium:query 'Compare memory systems.' \
  --agent --profile=gemini-grounded

# Paid synchronous execution may occur
php artisan librarium:query 'Compare memory systems.' \
  --agent --profile=gemini-grounded --run

# Dispatch one encrypted Laravel job
php artisan librarium:query 'Compare memory systems.' \
  --agent --group=deep --queue
```

`--agent` is strict non-interactive automation mode. It disables prompts,
decoration, and spinners, emits one deterministic JSON value to stdout on
success, and never dispatches without `--run` or `--queue`. It is not an MCP
server. `--no-interaction` uses plain human output, not JSON.

Agent previews and queued receipts use `schema_version: 1` envelopes. A
completed `--run` emits the public response array directly. Validation errors
leave stdout empty and write a bounded safe message to stderr where available.

## Status

```bash
php artisan librarium:status 01M13EXAMPLEREQUESTID --agent
```

Status is a read-only lookup in the package's transient status store. It is not
durable history and expires according to `status_ttl`. Persist terminal results
in application-owned storage when they must outlive the cache.

## Profiles

```bash
php artisan librarium:profiles --agent
```

This lists configured Profile IDs, providers, models, result kinds, eligibility,
and availability reasons. It omits credentials, prompts, Profile options, and
secret-bearing configuration.

## Exit codes

| Code | Meaning |
| ---: | --- |
| `0` | Preview, queue submission, lookup, or successful research |
| `1` | Unexpected command or infrastructure failure |
| `2` | Invalid or conflicting input |
| `3` | Requested status was not found |
| `4` | Research returned a partial terminal response |
| `5` | Research returned a failed terminal response |

For selection and execution behavior, see [Groups and modes](/docs/php/groups-and-modes).
