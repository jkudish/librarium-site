---
title: A research workflow for your terminal and your agent.
description: Preview a query, run it across selected providers, and keep the complete evidence. Give your coding agent the same workflow over MCP.
kind: product
runtime: cli
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

These are v2 instructions. Follow the [source installation boundary](/docs#install) until matching v2 distribution is published.

## Give your coding agent the same evidence

Register the stdio MCP server with Claude Code:

```bash
claude mcp add librarium -- librarium mcp
```

Other MCP clients can launch the same `librarium mcp` command. The server exposes five tools:

| Tool | What the agent does with it |
| --- | --- |
| `list_providers` | Inspect the available provider selection without research calls |
| `list_groups` | Discover named research workflows |
| `research` | Start approved research and receive a compact index |
| `check_async` | Advance eligible pending work and see newly committed results |
| `get_results` | Read full content and citations in bounded pages |

The first response is an index, not the whole answer. An agent should follow content and citation cursors until it has the complete evidence it needs. Successful results remain readable while other providers are pending.

## Long research does not need a long chat message

Durable async runs retain accepted task identity and prior spend. Resume uses the original deadline instead of granting a fresh budget of time or money. Known failure charges count; unreported costs remain unknown.

Local cancellation stops local work. Remote cancellation depends on the provider and is not a refund. Do not infer that no work happened because a connection timed out.

See [request and recovery behavior](/docs/request-and-retry) for the exact retry and cancellation boundaries.

## Bring the workflow into Amp

Use the v2 CLI's `install-skill` command to write the bundled Librarium skill to your agent's skill directory. The bundled instructions install offline and do not need a release-tag download. Amp uses a skill and the CLI, not an Amp plugin.

The [coding-agent guide](/guides/agent-research) walks through a real engineering question, source inspection, and the distinction between provider agreement and independent evidence. If you need in-process Laravel integration instead, use [the first-party Laravel package](/laravel); its Artisan agent mode is not an MCP server.
