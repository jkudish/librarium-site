---
title: A research workflow for your terminal.
description: Preview a query, run it across selected providers, and keep the complete evidence. The same installation provides the MCP server and agent skill.
kind: product
ctaHref: /docs#install
ctaLabel: Set up the CLI
---

## Ask once. Keep the sources.

Use the CLI when you want the complete JavaScript runtime: built-in provider bindings, configuration, paid-attempt accounting, saved run artifacts, and durable async recovery.

Start with an offline preview. It checks local selection and admission, not provider authentication or final pricing:

```bash
librarium plan \
  "Lisbon or Porto for a long weekend without a car?" \
  --group quick --json
```

After reviewing the selected providers and authorizing possible spend, run the same question:

```bash
librarium run \
  "Lisbon or Porto for a long weekend without a car?" \
  --group quick --json
```

This command can incur charges and has no explicit dollar cap. Add `--max-cost` when the preview establishes bounded estimates for the selected work and its fallback reserve. Unknown estimates fail hard-budget admission rather than becoming zero. See [your first query](/guides/first-query) for setup, costs, and result inspection.

These are v2 instructions. Install the published CLI with `npm install -g librarium@^2`, verify that `librarium --version` reports major version 2, and see [Getting started](/docs#install) for other supported channels.

## Long research does not need a long chat message

Durable async runs retain accepted task identity and prior spend. Resume uses the original deadline instead of granting a fresh budget of time or money. Known failure charges count; unreported costs remain unknown.

Local cancellation stops local work. Remote cancellation depends on the provider and is not a refund. Do not infer that no work happened because a connection timed out.

See [request and recovery behavior](/docs/request-and-retry) for the exact retry and cancellation boundaries.

## The same install serves your agent

The MCP server and agent skill ship with this CLI installation, not as separate packages. To connect a coding agent over MCP or install the bundled agent skill, see [Agents & MCP](/agents). If you need an in-process Laravel integration instead, use [the first-party Laravel package](/laravel); its Artisan agent mode is not an MCP server.
