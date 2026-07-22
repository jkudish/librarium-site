---
title: Using with AI agents
description: The agent skill, the MCP server and its tools, agent prompts, and CLAUDE.md setup.
order: 10
---

## Overview

Librarium is designed to be used by AI coding agents. There are four ways to set it up: an agent skill, an MCP server, a drop-in agent prompt, or project-scoped CLAUDE.md instructions.

## Option 1: Agent skill (recommended)

The built-in skill teaches your agent how to use librarium through a 7-phase research workflow.

```bash
# Install via CLI
librarium install-skill

# Or manually
mkdir -p ~/.claude/skills/librarium
curl -o ~/.claude/skills/librarium/SKILL.md https://raw.githubusercontent.com/jkudish/librarium/main/SKILL.md
```

`install-skill` installs the librarium skill into `~/.claude/skills/librarium`. The skill version matches your installed CLI, falling back to the latest from main.

Once installed, Claude Code will automatically use librarium when you ask it to research a topic. Triggers: `/librarium`, `/research`, `/deep-research`.

## Option 2: MCP server

Librarium ships an MCP (Model Context Protocol) server over stdio so agents can drive it directly through tool calls instead of shelling out to the CLI. Register it with Claude Code:

```bash
claude mcp add librarium -- librarium mcp
```

Or add it to any MCP client's stdio config:

```json
{
  "mcpServers": {
    "librarium": {
      "command": "librarium",
      "args": ["mcp"]
    }
  }
}
```

The server exposes these tools:

- `research`: fan out a query across providers; writes the full run directory and returns a compact structured result (output dir, per-provider tallies, top deduped sources, pending async task ids). Full provider text is not inlined.
- `get_results`: read provider markdown from a run directory (defaults to the most recent run), capped per provider with a truncation marker, plus the manifest summary.
- `check_async`: one poll pass over pending async deep-research tasks; with `retrieve` it fetches completed results back into the run.
- `list_providers`: registry and config snapshot (id, name, tier, enabled, key configured).
- `list_groups`: configured provider groups and their members.

In MCP mode, stdout carries the protocol stream only; all diagnostics go to stderr. The server shuts down cleanly when the client disconnects.

## Option 3: Agent prompt

Drop this into any AI agent's system prompt to give it librarium capabilities:

```
You have access to the `librarium` CLI for deep multi-provider research.

To research a topic, run:
  librarium run "<query>" --group <group>

Groups:
  quick          -- Fast AI-grounded answers (seconds)
  deep           -- Thorough async research (minutes)
  fast           -- Quick results from multiple tiers
  comprehensive  -- Deep + AI-grounded combined
  llm            -- Ungrounded LLM baseline / contrast (no citations)
  all            -- All 21 grounded providers (excludes the llm tier)

Output lands in ./agents/librarium/<timestamp>-<slug>/:
  summary.md     -- Synthesized overview with stats
  sources.json   -- Deduplicated citations ranked by frequency
  {provider}.md  -- Per-provider detailed results
  run.json       -- Machine-readable manifest

For async deep research, check status with:
  librarium status --wait

Cross-reference sources appearing in multiple providers for higher confidence.
```

## Option 4: CLAUDE.md project instructions

Add to your project's `CLAUDE.md` for project-scoped research:

```markdown
## Research

Use `librarium` for research queries. It's installed globally.
- Quick lookups: `librarium run "query" --group quick`
- Deep research: `librarium run "query" --group deep --mode sync`
- Results land in `./agents/librarium/` -- read `summary.md` first, then `sources.json` for citations
```

## 7-phase research workflow

The skill guides agents through:

1. **Query analysis.** Classify the research question and pick the right provider group.
2. **Provider selection.** Match query type to tier (`quick` for facts, `deep` for thorough research, `all` for max coverage).
3. **Dispatch.** Run the query with appropriate flags.
4. **Monitor.** Track async deep-research tasks.
5. **Retrieve.** Fetch completed async results.
6. **Analyze.** Read `summary.md`, `sources.json`, and per-provider output files.
7. **Synthesize.** Cross-reference multi-provider findings, weight by citation frequency.
