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

The MCP server and the agent skill ship with that install. There is nothing else to download. Check that `librarium --version` reports major version 2 before you connect an agent. [Getting started](/docs#install) covers other install channels, and the [CLI page](/cli) covers terminal use.

## How you'd use it

Ask your agent a research question in plain language, and say how far it may go: for example, a quick pass, then a deep pass if coverage is thin, inside the budget your librarium configuration already sets. A typical session over MCP:

1. `list_groups` to see the configured workflows, so the agent picks a group without guessing.
2. `research` with `group: "quick"`, which returns an index of the run rather than the answers.
3. `get_results` on that run, following `nextCursor` until `hasMore` is false.
4. If coverage is thin, `research` again with `group: "deep"` and `mode: "async"`, then `check_async` to move the pending work forward.
5. `get_results` on the deep run, then an answer that keeps each finding tied to the provider that wrote it and the sources it cited.

## Give your agent the setup prompt

Paste this into your coding agent. It installs v2, registers the MCP server, checks the install offline, and stops before any paid call:

```text
Install Librarium v2 as a CLI and MCP tool for my coding agent. Read https://librarium.agentsy.build/docs/index.md and https://librarium.agentsy.build/docs/using-with-agents.md. Check that Node.js is at least 22.12, then run `npm install -g librarium` and confirm `librarium --version` reports major version 2. Ask which MCP client and configuration scope I use. Preserve existing servers and register a stdio server named librarium with command `librarium` and args `["mcp"]`; for Claude Code, use `claude mcp add --scope user librarium -- librarium mcp` with the agreed scope. Ask which providers I want and guide me through `librarium init` without exposing credentials in chat or source control. Run `librarium doctor` without --live and verify MCP discovery with list_providers and list_groups. Do not run research or make paid provider calls without my approval. Summarize the installation, client configuration, and any remaining credential setup.
```

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

After registering, have your agent call `list_providers` and `list_groups` to confirm the connection. Those calls are local and free.

## What your agent can call

The server exposes five tools. None of them takes a budget or fallback flag; spending limits and fallback behavior come from your librarium configuration, so a budget promised in a prompt is only real if the matching config is in place.

**`research`** starts a run. Input: a required `query`, plus optional `group` (a workflow like `quick` or `deep`), `providers` (exact profile ids), `mode` (`sync` or `async`), and `refine`. Output: a short index of the run; statuses, which provider returned what, source counts, known and unknown costs, and where results are saved. It does not paste whole answers into chat. Use it inside the scope and budget already authorized; only steps beyond that scope need fresh approval.

**`get_results`** reads what a run saved. Input: the run directory, optionally one `provider` or `resultId`, a `part` (`content` or `citations`), a `cursor`, and a `limitChars` page size (256 to 12,000; default 8,000). Output: complete text and citations, one bounded page at a time. Use it to read the whole answer; follow `nextCursor` with the same filters until `hasMore` is false. It reads saved files only: no provider calls, no credential lookups.

**`check_async`** moves a long-running job forward. Input: the run directory, and a `retrieve` toggle that only matters for runs saved by an older schema. Output: counts plus an updated index, committing results as they finish. Use it to advance work already submitted, under its original time and cost limits; a charge still pending with a provider stays unknown until the provider reports it. It may contact providers to fetch completed work; it starts no new research.

**`list_providers`** shows what can run. Input: optional `detail: "profiles"` and one `provider` id. Output: static summaries, or exact profile declarations with targets, capabilities, workflows, and availability reasons. Use it to plan a run. It is local: no custom code is loaded, no credentials are resolved, and nothing is authenticated, so a listed provider is not a verified one.

**`list_groups`** shows the configured workflows. Input: none. Output: group names and their member profiles. Use it to pick a group without guessing. Local and free.

There is no `plan` tool. Offline previews are a CLI command (`librarium plan "…" --group quick --json`), so over MCP an agent designs a run with `list_providers` and `list_groups` instead.

## Ask for the whole answer

The first response to `research` is an index, not the findings. A good agent follows the pages until it has everything: completed results stay readable while slower providers finish. Tell it to. The [coding-agent guide](/guides/agent-research) walks a real engineering question through this loop.

## Check the sources, not just the summary

Every answer keeps the provider that wrote it and the links it cited. When several providers agree, that is a lead, not proof; open the sources before you build on it. The [agent docs](/docs/using-with-agents) record every boundary in detail.
