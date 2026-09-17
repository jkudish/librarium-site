---
title: Give your coding agent a research workflow.
description: Install the CLI once, hand your agent the canonical setup prompt, and connect over MCP with compact indexes and complete, inspectable evidence.
kind: product
ctaHref: /docs/using-with-agents
ctaLabel: Read the agent docs
---

## One installation, not three

The MCP server and the agent skill ship with the CLI installation—`npm install -g librarium@^2`—not as separate packages. Verify that `librarium --version` reports major version 2 before connecting an agent. [Getting started](/docs#install) covers the other supported installation channels, and the [CLI page](/cli) covers terminal use of the same install.

## The canonical setup prompt

Paste this into your coding agent. It installs v2, registers the MCP server, and stops short of paid provider calls:

```text
Install Librarium v2 as a CLI and MCP tool for my coding agent. Read https://librarium.agentsy.build/docs/index.md and https://librarium.agentsy.build/docs/using-with-agents.md. Check that Node.js is at least 22.12, then run `npm install -g librarium@^2` and confirm `librarium --version` reports major version 2. Ask which MCP client and configuration scope I use. Preserve existing servers and register a stdio server named librarium with command `librarium` and args `["mcp"]`; for Claude Code, use `claude mcp add librarium -- librarium mcp` with the agreed scope. Ask which providers I want and guide me through `librarium init` without exposing credentials in chat or source control. Run `librarium doctor` without --live and verify MCP discovery with list_providers and list_groups. Do not run research or make paid provider calls without my approval. Summarize the installation, client configuration, and any remaining credential setup.
```

## Connect over MCP

Register the stdio server with Claude Code:

```bash
claude mcp add librarium -- librarium mcp
```

Other MCP clients launch the same `librarium mcp` command. The server exposes exactly five tools: `research`, `get_results`, `check_async`, `list_providers`, and `list_groups`. The first response is a compact index, not the whole answer; follow the content and citation cursors until the evidence is complete. Successful results stay readable while other providers are still pending. [Using with AI agents](/docs/using-with-agents) documents every paging and provenance boundary.

## Install the agent skill

```bash
librarium install-skill
```

The bundled skill teaches the v2 profile catalog, workflow selection, durable monitoring, artifact reading, and evidence-aware synthesis. Its triggers include `/librarium`, `/research`, and `/deep-research`. Published builds embed the authoritative root skill, so installation is version-matched and works offline without a release-tag download. It does not upgrade the CLI. Amp uses the Librarium User Skill and the v2 CLI, not a plugin.

## Keep the evidence

Every finding keeps its provider, citations, and provenance. Shared collectors and repeated URLs can create correlated evidence; they are not independent corroboration by themselves. The [coding-agent guide](/guides/agent-research) walks through a real engineering question, source inspection, and the distinction between provider agreement and independent evidence.
