---
title: Connect your coding agent to better research tools.
description: Install the CLI once, register the MCP server in your agent, and let it ask a question across many providers and read every answer with its sources.
kind: product
ctaHref: /docs/using-with-agents
ctaLabel: Read the agent docs
---

*A meta harness for research queries*

Query search engines, AI answer engines, and deep-research APIs from one interface, and keep every answer with its citations.

## One install, two ways to work

Your agent gets research through the same CLI you use. Install it once:

```bash
npm install -g librarium
librarium setup
librarium research "Lisbon or Porto without a car?" --only exa --dry-run --json
librarium research "Lisbon or Porto without a car?" --only exa --json
```

The MCP server and the agent skill ship with that install. [Getting started](/docs#install) covers installation, and the [CLI page](/cli) covers terminal use.

## Ask a question. Your agent does the reading.

Requires Node.js 22.12+. Ask your agent a research question in plain language and approve how far it may go: a quick pass, then a deep pass if coverage is thin, inside the budget your Librarium configuration sets. A typical session over MCP:

1. `list_sources` to discover research sources, AI answer engines chosen by name, saved groups, and availability offline.
2. `research` with `question`, `only`, and `dry_run: true` to preview without storage or provider calls.
3. `research` without `dry_run`; keep the returned Run ID.
4. `get_run` with that id to resume pending work, or with `source` to read an answer and citations. Follow `cursor` until null; concatenate JSON-text chunks before parsing.
5. If more research is needed, select deep research. Preserve source identity and uncertainty in the answer.

## Set it up once.

Each host below has its own setup prompt and manual registration instructions. Choose your host, then paste its prompt into your coding agent to install and verify Librarium.

The agent reads [install.md](/install.md): the Node.js and command checks, installation, MCP registration without changing other servers, `librarium setup` with keys kept out of chat and source control, and offline `setup --check`.

## Register the MCP server in your agent

Every host launches the same local command: `librarium mcp`. The registration spelling differs per host, so use your own agent's form below.

**Claude Code** ([MCP docs](https://code.claude.com/docs/en/mcp)):

```text
Install Librarium for me in Claude Code by following https://librarium.agentsy.build/install.md. Verify the connection offline, and keep my API keys out of chat and source control.
```

```bash
claude mcp add --scope user librarium -- librarium mcp
```

**Codex** ([MCP docs](https://developers.openai.com/codex/mcp)): add it by command, or edit `~/.codex/config.toml` (project-scoped: `.codex/config.toml`):

```text
Install Librarium for me in Codex by following https://librarium.agentsy.build/install.md. Verify the connection offline, and keep my API keys out of chat and source control.
```

```bash
codex mcp add librarium -- librarium mcp
```

```toml
[mcp_servers.librarium]
command = "librarium"
args = ["mcp"]
```

**Cursor** ([MCP docs](https://cursor.com/docs/mcp)): create `.cursor/mcp.json` in your project, or `~/.cursor/mcp.json` to add it everywhere:

```text
Install Librarium for me in Cursor by following https://librarium.agentsy.build/install.md. Verify the connection offline, and keep my API keys out of chat and source control.
```

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

**OpenCode** ([config docs](https://opencode.ai/docs/mcp-servers/)): add it under `mcp` in `opencode.json` (`~/.config/opencode/opencode.json`, or your project root). OpenCode v2 moves servers under `mcp.servers` ([v2 docs](https://v2.opencode.ai/mcp)):

```text
Install Librarium for me in OpenCode by following https://librarium.agentsy.build/install.md. Verify the connection offline, and keep my API keys out of chat and source control.
```

```json
{
  "mcp": {
    "librarium": {
      "type": "local",
      "command": ["librarium", "mcp"]
    }
  }
}
```

**Amp** ([MCP manual](https://ampcode.com/manual/mcp)):

```text
Install Librarium for me in Amp by following https://librarium.agentsy.build/install.md. Verify the connection offline, and keep my API keys out of chat and source control.
```

```bash
amp mcp add librarium -- librarium mcp
```

Servers added to your global config (`~/.config/amp/settings.json`) run without approval; servers declared in a project's `.amp/settings.json` are approved once with `amp mcp approve librarium`.

**Hermes Agent** ([MCP docs](https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp)): add it to `~/.hermes/config.yaml`:

```text
Install Librarium for me in Hermes Agent by following https://librarium.agentsy.build/install.md. Verify the connection offline, and keep my API keys out of chat and source control.
```

```yaml
mcp_servers:
  librarium:
    command: "librarium"
    args: ["mcp"]
```

**Any other MCP host**: register a stdio server named `librarium` with command `librarium` and args `["mcp"]`, following your host's own config format.

```text
Install Librarium for me in my coding agent by following https://librarium.agentsy.build/install.md. Verify the connection offline, and keep my API keys out of chat and source control.
```

After registering, have your agent call `list_sources` to confirm the connection. It is local and free.

## What your agent can call

The server exposes exactly three tools. See [costs and limits](/docs/costs-and-limits) before paid research.

| Tool | Inputs | Outputs | Limits |
| --- | --- | --- | --- |
| `research` | `question`, optional `depth`, `only`, `skip`, `max_cost`, `dry_run`, `wait_seconds` | Bounded summary with Run ID, statuses, citation counts, costs, skips, and next hint | `dry_run: true` previews offline. `max_cost` may lower but not raise the configured cap. Wait defaults to 45 seconds, maximum 50; zero returns without waiting. |
| `get_run` | Run `id`, optional `wait_seconds`, `source`, `cursor` | Summary or one source's paged JSON answer and citations | Follow cursor with unchanged id/source until null. Concatenate pages before parsing; a changed answer invalidates the cursor. Picks up existing research without starting new research. |
| `list_sources` | None | Research sources, AI answer engines, saved groups, availability, price hints | Offline configuration checks, not authentication. |

Use `research` with `dry_run: true` for an offline preview.

## Things to ask your agent

- **Research a technical decision:** compare SQLite and Postgres for a small team app, read deployment and concurrency evidence, and cite the sources behind the recommendation.
- **Preview a source selection first:** discover sources, preview an API integration's authentication, rate limits, and retry guidance, then read complete results with `get_run`.
- **See how AI answer engines describe you:** compare ChatGPT, Gemini, and Copilot recommendations for luxury villa rentals on the Amalfi Coast, keeping each engine's findings separate.

## Read everything. Then check it.

### Ask for the whole answer

The first response to `research` is an index, not the findings. A good agent follows the pages until it has everything: completed results stay readable while slower providers finish. Tell it to. The [coding-agent guide](/guides/agent-research) walks a real engineering question through this loop.

## Check the sources, not just the summary

Every answer keeps the provider that wrote it and the links it cited. When several providers agree, that is a lead, not proof; open the sources before you build on it. The [agent docs](/docs/using-with-agents) record every boundary in detail.
