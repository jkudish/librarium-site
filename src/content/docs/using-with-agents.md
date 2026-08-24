---
title: Using with AI agents
description: The agent skill, the MCP server and its five tools, and the Amp plugin.
order: 11
---

## Agent skill

```bash
librarium install-skill
```

The shipped skill teaches the v2 profile catalog, workflow selection, durable monitoring, artifact reading, and evidence-aware synthesis. Its triggers include `/librarium`, `/research`, and `/deep-research`. Keep the skill version matched to the installed CLI.

## MCP server

```bash
claude mcp add librarium -- librarium mcp
```

The stdio server exposes exactly five tools:

* `research` writes a run directory and returns a public response. A terminal schema version 3 response includes the canonical `ResearchResponse`; pending output remains compact.
* `get_results` reads presentation content, caps each provider, marks truncation, and treats the content as untrusted.
* `check_async` performs one bounded resume pass. Schema version 3 retrieves and commits a result as soon as remote completion is observed. Its `retrieve` input gates retrieval only for historical schema version 2 runs.
* `list_providers` returns the configured registry snapshot.
* `list_groups` returns configured groups and members.

| Tool | Inputs |
| --- | --- |
| `research` | Required `query`; optional `group`, `providers`, `mode` (`sync`, `async`, or `mixed`), and `refine` |
| `get_results` | Optional `runDir` and `provider`; both default to the most recent applicable output |
| `check_async` | Optional `runDir` and `retrieve`; `retrieve` affects only historical schema version 2 runs |
| `list_providers` | None |
| `list_groups` | None |

Stdout is reserved for MCP protocol traffic. Diagnostics go to stderr.

This documentation is also published as [`llms.txt`](/llms.txt) and [`llms-full.txt`](/llms-full.txt) for agent consumption.

## Amp plugin

```bash
librarium install-plugin
```

The installer places the plugin at `~/.config/amp/plugins/librarium/`. It exposes the same five operations as native Amp tools and gates them behind the bundled skill. `librarium:set-agent-defaults` configures per-agent provider defaults. `librarium:research` dispatches a run from the command palette.

Agents should preserve profile and collection provenance in their synthesis. Shared collectors, shared upstream providers, repeated URLs, and citation counts can create correlated evidence. They are not independent corroboration by themselves.
