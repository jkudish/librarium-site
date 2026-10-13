---
title: Connect your coding agent to better research tools.
description: Install the CLI once, register the MCP server in your agent, and let it ask a question across many providers and read every answer with its sources.
kind: product
ctaHref: /docs/using-with-agents
ctaLabel: Read the agent docs
---

## One install, two ways to work

Your agent gets research through the same CLI you use. Install it once:

```bash
npm install -g librarium
```

The MCP server and the agent skill ship with that install. This is the unreleased simplified-surface candidate; check both the version and `librarium research --help`. A version number alone does not prove these tools exist. [Getting started](/docs#install) covers installation, and the [CLI page](/cli) covers terminal use.

## How you'd use it

Ask your agent a research question in plain language, and say how far it may go: for example, a quick pass, then a deep pass if coverage is thin, inside the budget your librarium configuration already sets. A typical session over MCP:

1. `list_sources` to discover research sources, named-only engines, saved groups, and availability offline.
2. `research` with `question`, `only`, and `dry_run: true` to preview without storage or provider calls.
3. After authorizing spend, `research` without `dry_run`; keep the returned Run id.
4. `get_run` with that id to resume pending work, or with `source` to read an answer and citations. Follow `cursor` until null; concatenate JSON-text chunks before parsing.
5. If more research is needed, deepen only within the existing authorization; a new Run can incur new charges. Preserve source identity and uncertainty in the answer.

## Give your agent the setup prompt

Paste this into your coding agent. It points the agent at the install instructions, which install v2, register the MCP server, check the install offline, and stop before any paid call:

```text
Install Librarium for me by following https://librarium.agentsy.build/install.md. Don't run research or make paid provider calls without my approval, and keep my API keys out of chat and source control.
```

The agent reads [install.md](/install.md): the Node.js and command checks, installation, MCP registration without changing other servers, `librarium setup` with keys kept out of chat and source control, and offline `setup --check`.

## Register the MCP server in your agent

Every host launches the same local command: `librarium mcp`. The registration spelling differs per host, so use your own agent's form below.

**Claude Code** ([MCP docs](https://code.claude.com/docs/en/mcp)):

```bash
claude mcp add --scope user librarium -- librarium mcp
```

**Codex** ([MCP docs](https://developers.openai.com/codex/mcp)): add it by command, or edit `~/.codex/config.toml` (project-scoped: `.codex/config.toml`):

```bash
codex mcp add librarium -- librarium mcp
```

```toml
[mcp_servers.librarium]
command = "librarium"
args = ["mcp"]
```

**Cursor** ([MCP docs](https://cursor.com/docs/mcp)): create `.cursor/mcp.json` in your project, or `~/.cursor/mcp.json` to add it everywhere:

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

```bash
amp mcp add librarium -- librarium mcp
```

Servers added to your global config (`~/.config/amp/settings.json`) run without approval; servers declared in a project's `.amp/settings.json` are approved once with `amp mcp approve librarium`.

**Hermes Agent** ([MCP docs](https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp)): add it to `~/.hermes/config.yaml`:

```yaml
mcp_servers:
  librarium:
    command: "librarium"
    args: ["mcp"]
```

**Any other MCP host**: register a stdio server named `librarium` with command `librarium` and args `["mcp"]`, following your host's own config format.

After registering, have your agent call `list_sources` to confirm the connection. It is local and free.

## What your agent can call

The server exposes exactly three tools. `max_cost` may lower but not raise the configured cap. In-flight calls can exceed admission caps; unknown reported spend remains null.

**`research`** starts a stored Run. Input: `question`, optional `depth` (`quick` or `deep`), `only`, `skip`, `max_cost`, `dry_run`, and `wait_seconds`. Output: bounded id, statuses, citation counts, costs, skips, and next hint. Dry runs neither store nor call providers. Waiting defaults to 45 seconds, maximum 50; zero returns without waiting.

**`get_run`** resumes or reads an existing Run. Input: `id`, optional `wait_seconds`, `source`, and `cursor`. Without source it returns a summary; with source it returns paged JSON text containing answer and citations. Continue with the returned cursor and unchanged id/source until cursor is null. A changed answer invalidates an old cursor; concatenate pages before parsing. It can retrieve accepted provider work but starts no new research.

**`list_sources`** reports sources, engines, user groups, availability, and price hints. No inputs. It is offline discovery, not authentication or spending permission.

No separate plan tool exists: `research` with `dry_run: true` is the offline preview, equivalent to CLI `research --dry-run`.

## Ask for the whole answer

The first response to `research` is an index, not the findings. A good agent follows the pages until it has everything: completed results stay readable while slower providers finish. Tell it to. The [coding-agent guide](/guides/agent-research) walks a real engineering question through this loop.

## Check the sources, not just the summary

Every answer keeps the provider that wrote it and the links it cited. When several providers agree, that is a lead, not proof; open the sources before you build on it. The [agent docs](/docs/using-with-agents) record every boundary in detail.
