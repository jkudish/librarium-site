---
title: Using Librarium with agents
description: Call Artisan safely from automation and agent processes.
order: 8
---

Use `--agent` when an automation process invokes Librarium through Artisan. It
is a deterministic CLI mode, not an MCP server, tool protocol, daemon, or
JavaScript bridge.

## Preview-first workflow

```bash
php artisan librarium:query 'Compare memory systems.' \
  --agent --profile=gemini-grounded
```

On success stdout contains one JSON preview envelope with
`schema_version: 1` and `type: "preview"`. Parse and enforce the selected
Profiles, fallbacks, timeout, and pricing policy before allowing dispatch.
Preview does not make a research provider call.

Dispatch requires a separate explicit action:

```bash
# Synchronous terminal response
php artisan librarium:query 'Compare memory systems.' \
  --agent --profile=gemini-grounded --run

# Queue receipt
php artisan librarium:query 'Compare memory systems.' \
  --agent --group=deep --queue
```

Never infer authorization to spend from the presence of credentials or a valid
preview. Your agent policy should separately authorize the Profile set, maximum
cost, and action. Prefer `--max-cost` when preview proves a complete, current,
conservative, single-currency hard bound; the command rejects an unsafe bound
rather than treating missing pricing as zero.

## Machine-readable contracts

A queued command emits `{schema_version, type: "queued", request_id}`. Status
and Profile listing use corresponding version-1 envelopes:

```bash
php artisan librarium:status "$REQUEST_ID" --agent
php artisan librarium:profiles --agent
```

A synchronous completed `--run` emits `ResearchResponse::toArray()` directly,
without a command envelope. Branch on its `status`, not only process exit:
`succeeded`, `partial`, and `failed` correspond to exit codes 0, 4, and 5.

Invalid input exits 2; missing status exits 3; unexpected infrastructure errors
exit 1. In agent mode, validation and command failures leave stdout empty and
write a bounded credential-safe line to stderr when stderr is available. Do not
merge stderr into a JSON parser.

## Operational boundaries

- Repeat `--profile` for fan-out; do not combine it with `--group`.
- `--run` and `--queue` are mutually exclusive.
- Profiles in a group execute sequentially under one deadline.
- `librarium:status` is transient and must not be used as durable memory.
- `librarium:profiles` reports eligibility but omits secrets and options.
- Queue worker operation and result persistence belong to the Laravel app.

If the agent needs in-process PHP integration rather than process execution,
use the [fluent library API](/docs/php/library). If it needs an MCP interface,
build and secure that interface in the application; `--agent` does not expose
one.
