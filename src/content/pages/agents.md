---
title: Connect your coding agent to better research tools.
description: Give your agent research with sources, without leaving your workflow.
kind: product
ctaHref: /docs/using-with-agents
ctaLabel: Read the agent docs
---

*A meta harness for research queries*

Query search, AI answers, and deep research with citations.

## Ask a question. Your agent does the reading.

Ask in plain language and get a source-backed recommendation.

### Example prompt

```text
Use Librarium to compare SQLite and Postgres for our team app, with sources.
```

### Illustrative outcome

A recommendation grounded in deployment and concurrency evidence, with links to the sources.

## Set it up once.

### Install the CLI

The CLI includes the MCP server.

The npm install requires Node.js 22.12+; Homebrew includes its own runtime.

```bash
npm install -g librarium
# or: brew install jkudish/tap/librarium
librarium setup
librarium research "Lisbon or Porto without a car?" --only exa --dry-run --json
librarium research "Lisbon or Porto without a car?" --only exa --json
```

Configure your source credentials first. The preview makes no calls; research uses paid services.

### Choose your agent below

Copy its prompt to install and verify Librarium; [install.md](/install.md) has the full instructions.

**Amp** ([MCP docs](https://ampcode.com/docs/customize/mcp)): register user-wide from your terminal.

```text
Install Librarium for me in Amp by following https://librarium.agentsy.build/install.md
```

```bash
amp mcp add librarium -- librarium mcp
```

**Claude Code** ([MCP docs](https://code.claude.com/docs/en/mcp)): register user-wide from your terminal.

```text
Install Librarium for me in Claude Code by following https://librarium.agentsy.build/install.md
```

```bash
claude mcp add --scope user librarium -- librarium mcp
```

**Claude Desktop** ([local server docs](https://modelcontextprotocol.io/docs/develop/connect-local-servers)): open Settings, then Developer, then Edit Config; merge this entry and restart Claude Desktop.

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

**Codex** ([MCP docs](https://learn.chatgpt.com/codex/extend/mcp)): merge into `~/.codex/config.toml` for user-wide setup.

```text
Install Librarium for me in Codex by following https://librarium.agentsy.build/install.md
```

```toml
[mcp_servers.librarium]
command = "librarium"
args = ["mcp"]
```

**Command Code** ([MCP docs](https://commandcode.ai/docs/mcp)): register user-wide from your terminal.

```text
Install Librarium for me in Command Code by following https://librarium.agentsy.build/install.md
```

```bash
cmd mcp add --scope user librarium -- librarium mcp
```

**Cursor** ([MCP docs](https://cursor.com/docs/mcp)): merge into `~/.cursor/mcp.json` for user-wide setup.

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

**Devin** ([MCP docs](https://docs.devin.ai/cli/extensibility/mcp/configuration)): for Devin for Terminal, register user-wide from your terminal.

```text
Install Librarium for me in Devin by following https://librarium.agentsy.build/install.md
```

```bash
devin mcp add --scope user librarium -- librarium mcp
```

**Gemini CLI** ([MCP docs](https://geminicli.com/docs/tools/mcp-server/)): register user-wide from your terminal.

```text
Install Librarium for me in Gemini CLI by following https://librarium.agentsy.build/install.md
```

```bash
gemini mcp add --scope user librarium librarium mcp
```

**Grok Bot** ([computer docs](https://docs.x.ai/grok-bot/computer-and-apps), [setup guide](https://composio.dev/content/how-to-add-mcp-servers-to-grok-bot)): confirm when asked; add your provider keys (`EXA_API_KEY`, `TAVILY_API_KEY`, `PERPLEXITY_API_KEY`) as environment variables on the server entry, never in chat text.

```text
Install Librarium for me in Grok Bot by following https://librarium.agentsy.build/install.md
```

Send in Grok Bot:

```text
Add a custom MCP server called librarium that runs: npx -y librarium@2 mcp
```

Grok Bot runs the server on its own cloud computer, so it can't use a config file or localhost on your machine.

**Grok Build** ([MCP docs](https://docs.x.ai/build/features/mcp-servers)): register user-wide from your terminal.

```text
Install Librarium for me in Grok Build by following https://librarium.agentsy.build/install.md
```

```bash
grok mcp add librarium -- librarium mcp
```

**Hermes Agent** ([MCP docs](https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp)): merge into `~/.hermes/config.yaml` for user-wide.

```text
Install Librarium for me in Hermes Agent by following https://librarium.agentsy.build/install.md
```

```yaml
mcp_servers:
  librarium:
    command: "librarium"
    args: ["mcp"]
```

**Muse** ([official page](https://muse.ai/)): Muse doesn't document a manual MCP config; let Muse follow [install.md](/install.md).

```text
Install Librarium for me in Muse by following https://librarium.agentsy.build/install.md
```

**OpenClaw** ([MCP registry docs](https://docs.openclaw.ai/cli/mcp/registry)): register in OpenClaw's user configuration.

```text
Install Librarium for me in OpenClaw by following https://librarium.agentsy.build/install.md
```

```bash
openclaw mcp add librarium --command librarium --arg mcp
```

Ask before stopping a running Gateway; CLI changes require it stopped, or use the Control UI.

**OpenCode** ([v2 MCP docs](https://opencode.ai/v2/docs/mcp-servers/)): with OpenCode v2, register user-wide from your terminal.

```text
Install Librarium for me in OpenCode by following https://librarium.agentsy.build/install.md
```

```bash
opencode mcp add librarium --global -- librarium mcp
```

**Pi** ([MCP docs](https://pi.dev/docs/latest/mcp)): register user-wide with Pi's native MCP support.

```text
Install Librarium for me in Pi by following https://librarium.agentsy.build/install.md
```

```bash
pi mcp add librarium -- librarium mcp
```

An extension providing `/mcp` overrides native support; resolve that conflict first.

**VS Code (GitHub Copilot)** ([MCP docs](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)): run MCP: Open User Configuration and merge this entry.

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

**Zed** ([MCP docs](https://zed.dev/docs/ai/mcp)): open zed: open settings file and merge this user-wide entry into settings.

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

## What your agent can call

Three tools, with [inputs and limits](/docs/using-with-agents#mcp-server) in the agent docs.

| Tool | What it does |
| --- | --- |
| `research` | Preview or start research across your chosen sources. |
| `get_run` | Read saved answers and citations, or resume pending research. |
| `list_sources` | Discover configured sources and price hints without making provider calls. |

## Read everything. Then check it.

### Ask for the whole answer

Ask your agent to [read every saved answer](/docs/using-with-agents#read-evidence-not-just-the-index) before summarizing.

### Check the sources, not just the summary

[Open the cited sources](/docs/using-with-agents#read-evidence-not-just-the-index) before relying on a recommendation.
