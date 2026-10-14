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

Default to user-wide unless you ask for this project only. Your agent uses its known client, asks only if it cannot tell or you want a different one, and confirms the client and scope before changing configuration. Merge entries without replacing other servers. If a host cannot find `librarium`, use the absolute path printed by `command -v librarium`.

**Amp** ([MCP docs](https://ampcode.com/docs/customize/mcp)): user-wide by command, or merge into `~/.config/amp/settings.json`. For this project, merge into `.amp/settings.json` instead, then approve with `amp mcp approve librarium`. User settings do not require workspace-server approval:

```text
Install Librarium for me in Amp by following https://librarium.agentsy.build/install.md
```

```bash
amp mcp add librarium -- librarium mcp
```

```json
{
  "amp.mcpServers": {
    "librarium": {
      "command": "librarium",
      "args": ["mcp"]
    }
  }
}
```

**Claude Code** ([MCP docs](https://code.claude.com/docs/en/mcp)): use `--scope user` for user-wide; use `--scope local` for this project privately, or `--scope project` for a shared `.mcp.json`:

```text
Install Librarium for me in Claude Code by following https://librarium.agentsy.build/install.md
```

```bash
claude mcp add --scope user librarium -- librarium mcp
```

**Claude Desktop** ([local server docs](https://modelcontextprotocol.io/docs/develop/connect-local-servers)): open Settings → Developer → Edit Config. Merge this user-wide entry into `claude_desktop_config.json` (macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`; Windows: `%APPDATA%\Claude\claude_desktop_config.json`), then completely quit and restart. These docs do not document a project-only scope:

```text
Install Librarium for me in Claude Desktop by following https://librarium.agentsy.build/install.md
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

**Codex** ([MCP docs](https://learn.chatgpt.com/codex/extend/mcp)): merge into `~/.codex/config.toml` for user-wide, or `.codex/config.toml` for this project (trusted projects only):

```text
Install Librarium for me in Codex by following https://librarium.agentsy.build/install.md
```

```toml
[mcp_servers.librarium]
command = "librarium"
args = ["mcp"]
```

**Command Code** ([MCP docs](https://commandcode.ai/docs/mcp)): use `--scope user` for user-wide (`~/.commandcode/mcp.json`); use `--scope local` for this project privately, or `--scope project` for a shared `.mcp.json`. Flags go before the server name:

```text
Install Librarium for me in Command Code by following https://librarium.agentsy.build/install.md
```

```bash
cmd mcp add --scope user librarium -- librarium mcp
```

**Cursor** ([MCP docs](https://cursor.com/docs/mcp)): merge into `~/.cursor/mcp.json` for user-wide, or `.cursor/mcp.json` for this project:

```text
Install Librarium for me in Cursor by following https://librarium.agentsy.build/install.md
```

```json
{
  "mcpServers": {
    "librarium": {
      "type": "stdio",
      "command": "librarium",
      "args": ["mcp"]
    }
  }
}
```

**Gemini CLI** ([MCP docs](https://geminicli.com/docs/tools/mcp-server/)): use `--scope user` for user-wide (`~/.gemini/settings.json`), or `--scope project` for this project (`.gemini/settings.json`):

```text
Install Librarium for me in Gemini CLI by following https://librarium.agentsy.build/install.md
```

```bash
gemini mcp add --scope user librarium librarium mcp
```

**Hermes Agent** ([MCP docs](https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp)): merge into `~/.hermes/config.yaml` for user-wide. These MCP docs do not document a project-only config file; ask rather than inventing one:

```text
Install Librarium for me in Hermes Agent by following https://librarium.agentsy.build/install.md
```

```yaml
mcp_servers:
  librarium:
    command: "librarium"
    args: ["mcp"]
```

**OpenClaw** ([MCP registry docs](https://docs.openclaw.ai/cli/mcp/registry)): save it in OpenClaw's user configuration. The local Gateway must be stopped before CLI mutations; ask before stopping it, or use its Control UI. These docs do not document a project-only registration scope:

```text
Install Librarium for me in OpenClaw by following https://librarium.agentsy.build/install.md
```

```bash
openclaw mcp add librarium --command librarium --arg mcp
```

**OpenCode** ([v2 MCP docs](https://opencode.ai/v2/docs/mcp-servers/), [config locations](https://opencode.ai/v2/docs/config/)): for v2, use `--global` for user-wide; omit it for this project. Or merge under `mcp.servers` in `~/.config/opencode/opencode.json` for user-wide, or `opencode.json` in this project:

```text
Install Librarium for me in OpenCode by following https://librarium.agentsy.build/install.md
```

```bash
opencode mcp add librarium --global -- librarium mcp
```

```json
{
  "mcp": {
    "servers": {
      "librarium": {
        "type": "local",
        "command": ["librarium", "mcp"]
      }
    }
  }
}
```

For OpenCode v1, the [v1 MCP docs](https://opencode.ai/docs/mcp-servers/) put `librarium` directly under `mcp`, without the `servers` wrapper. Keep the same `type` and `command` fields; do not apply the v2 layout to v1.

**Pi** ([MCP docs](https://pi.dev/docs/latest/mcp)): current Pi has native MCP support. User-wide is the default (`~/.pi/agent/mcp.json`); add `--local` for this project (`.pi/mcp.json`, loaded after project trust):

```text
Install Librarium for me in Pi by following https://librarium.agentsy.build/install.md
```

```bash
pi mcp add librarium -- librarium mcp
```

An extension that registers `/mcp` replaces Pi's built-in MCP support. Resolve that conflict with the user first. Run `/reload` after changing configuration outside a session.

**VS Code (GitHub Copilot)** ([MCP docs](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)): run **MCP: Open User Configuration** for user-wide within the active VS Code profile; for this project, edit `.vscode/mcp.json`. Merge this VS Code-format entry:

```text
Install Librarium for me in VS Code (GitHub Copilot) by following https://librarium.agentsy.build/install.md
```

```json
{
  "servers": {
    "librarium": {
      "type": "stdio",
      "command": "librarium",
      "args": ["mcp"]
    }
  }
}
```

For portable Copilot/Agent Host configuration, use `~/.copilot/mcp-config.json` user-wide or `.mcp.json` in this project, with `mcpServers` instead of `servers`.

**Windsurf** ([Cascade MCP docs](https://docs.windsurf.com/windsurf/cascade/mcp)): these current docs apply to legacy Cascade, not the default Devin Local agent. Open Cascade's Actions → Open MCP config file and merge this user-wide entry. Current documented locations: macOS/Linux `~/.config/devin/mcp_config.json`; Windows `%APPDATA%\devin\mcp_config.json`. No project-only scope is documented here; do not use these instructions for Devin Local:

```text
Install Librarium for me in Windsurf by following https://librarium.agentsy.build/install.md
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

**Zed** ([MCP docs](https://zed.dev/docs/ai/mcp)): open **zed: open settings file** and merge this user-wide entry into settings. These MCP docs do not document project-only server registration; do not assume project settings support it:

```text
Install Librarium for me in Zed by following https://librarium.agentsy.build/install.md
```

```json
{
  "context_servers": {
    "librarium": {
      "command": "librarium",
      "args": ["mcp"]
    }
  }
}
```

**Any other MCP host**: register a stdio server named `librarium` with command `librarium` and args `["mcp"]`, following your host's own config format.

```text
Install Librarium for me in my coding agent by following https://librarium.agentsy.build/install.md
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
