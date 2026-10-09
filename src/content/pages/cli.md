---
title: Research from your terminal.
description: Ask once, preview for free, then run the question across the providers you choose. Keep every answer with its sources.
kind: product
ctaHref: /docs#install
ctaLabel: Set up the CLI
---

## Ask once. Keep the sources.

The CLI is the full runtime: provider connections, saved results, cost tracking, and the tools your agent uses too. You will spend most of your time between two commands.

Preview first. It checks what would run and what it might cost, without calling any provider:

```bash
librarium plan \
  "Lisbon or Porto for a long weekend without a car?" \
  --group quick --json
```

Happy with the selection? Run the same question for real:

```bash
librarium run \
  "Lisbon or Porto for a long weekend without a car?" \
  --group quick --json
```

This command can incur charges and has no explicit dollar cap. Add `--max-cost` when the preview establishes bounded estimates for the selected work and its fallback reserve. Unknown estimates fail hard-budget admission rather than becoming zero. See [your first query](/guides/first-query) for setup, costs, and result inspection.

These are v2 instructions. Install the published CLI with `npm install -g librarium`, verify that `librarium --version` reports major version 2, and see [Getting started](/docs#install) for other supported channels.

## Long research does not need a long chat message

Durable async runs retain accepted task identity and prior spend. Resume uses the original deadline instead of granting a fresh budget of time or money. Known failure charges count; unreported costs remain unknown.

Local cancellation stops local work. Remote cancellation depends on the provider and is not a refund. Do not infer that no work happened because a connection timed out.

See [request and recovery behavior](/docs/request-and-retry) for the exact retry and cancellation boundaries.

## The same install serves your agent

The MCP server and agent skill ship with this CLI installation, not as separate packages. To connect a coding agent over MCP or install the bundled agent skill, see [Agents & MCP](/agents). If you need an in-process Laravel integration instead, use [the first-party Laravel package](/laravel); its Artisan agent mode is not an MCP server.
