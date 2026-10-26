# Install Librarium for a coding agent

These are step-by-step instructions for a coding agent installing Librarium v2 as a CLI and MCP tool on the user's machine. Follow them in order.

## Ground rules

- Do not run research or make paid provider calls without the user's approval. Offline discovery, `setup --check`, and research `--dry-run` are free; `setup --live` and real `research` are not.
- Keep the user's API keys out of chat and source control. Never ask the user to paste a key into chat, never echo a key back, and never write credentials into a committed file. The user enters keys in the setup wizard or their own environment.
- Verify the installation offline (step 6) before reporting success. Offline checks confirm configuration and credential presence without calling a provider.
- Preserve the user's existing MCP servers. Add `librarium` alongside them; do not replace or reorder other entries.
- Ask before changing anything outside the steps below.

## 1. Check Node.js

The npm package requires Node.js 22.12.0 or newer:

```bash
node --version
```

If Node.js is older or missing, tell the user and stop. Homebrew (`brew install jkudish/tap/librarium`) and the standalone installer in [Getting started](https://librarium.si/docs/index.md) include their own runtime; offer them instead of upgrading Node.js without asking.

## 2. Install the CLI

```bash
npm install -g librarium
librarium --version
# Must report major version 2
librarium research --help
librarium setup --help
```

If the version is not 2.x, stop and report what is installed. Do not continue with a v1 install; [Upgrade from v1](https://librarium.si/docs/upgrading-to-v2.md) covers migration.

## 3. Detect the MCP client and confirm scope

If you know which MCP client you are running in, use that client. Ask which client only if you cannot tell, or if the user wants Librarium in a different one. Default to user-wide scope unless the user asks for this project only. Confirm the client and scope with the user before changing configuration. Do not inspect environment variables to identify the client.

## 4. Register the MCP server

Every host launches the same local command: a stdio server named `librarium` with command `librarium` and args `["mcp"]`. Use the user's host and agreed scope. If a config file already exists, edit it in place and keep every other server.

**Amp** ([MCP docs](https://ampcode.com/docs/customize/mcp)): user-wide registration:

```bash
amp mcp add librarium -- librarium mcp
```

For this project, merge the entry below into `.amp/settings.json` instead of user settings (`~/.config/amp/settings.json`), then approve it with `amp mcp approve librarium`. User settings do not require that approval.

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

```bash
claude mcp add --scope user librarium -- librarium mcp
```

**Claude Desktop** ([local server docs](https://modelcontextprotocol.io/docs/develop/connect-local-servers)): open Settings, then Developer, then Edit Config. Merge this user-wide entry into `claude_desktop_config.json` (macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`; Windows: `%APPDATA%\Claude\claude_desktop_config.json`), then completely quit and restart Claude Desktop. These docs do not document a project-only scope; do not substitute a project file.

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

**Codex** ([MCP docs](https://learn.chatgpt.com/codex/extend/mcp)): merge this into `~/.codex/config.toml` for user-wide, or `.codex/config.toml` for this project (trusted projects only):

```toml
[mcp_servers.librarium]
command = "librarium"
args = ["mcp"]
```

**Command Code** ([MCP docs](https://commandcode.ai/docs/mcp)): use `--scope user` for user-wide (`~/.commandcode/mcp.json`); use `--scope local` for this project privately, or `--scope project` for a shared `.mcp.json`. Flags go before the server name:

```bash
cmd mcp add --scope user librarium -- librarium mcp
```

**Cursor** ([MCP docs](https://cursor.com/docs/mcp)): merge this into `~/.cursor/mcp.json` for user-wide, or `.cursor/mcp.json` for this project:

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

**Devin** ([MCP docs](https://docs.devin.ai/cli/extensibility/mcp/configuration)): use Devin for Terminal (the `devin` CLI) to run this local stdio server. Use `--scope user` for user-wide; use `--scope local` for this project privately, or `--scope project` for a shared configuration:

```bash
devin mcp add --scope user librarium -- librarium mcp
```

For manual configuration, merge this into `~/.config/devin/mcp_config.json` for user-wide (`%APPDATA%\devin\mcp_config.json` on Windows), `.devin/mcp_config.local.json` for this project privately, or `.devin/mcp_config.json` for a shared project configuration:

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

These dedicated MCP files apply from v3000.3 (Local 3.6); older versions store `mcpServers` in their main `config.json` or `config.local.json` files and migrate on startup.

**Gemini CLI** ([MCP docs](https://geminicli.com/docs/tools/mcp-server/)): use `--scope user` for user-wide (`~/.gemini/settings.json`), or `--scope project` for this project (`.gemini/settings.json`):

```bash
gemini mcp add --scope user librarium librarium mcp
```

**Grok Bot** ([computer docs](https://docs.x.ai/grok-bot/computer-and-apps), [add-in-chat guide](https://composio.dev/content/how-to-add-mcp-servers-to-grok-bot)): send this in Grok Bot and confirm when the bot asks. The server entry is account-wide:

```text
Add a custom MCP server called librarium that runs: npx -y librarium@2 mcp
```

Give the bot your provider API keys as environment variables on that server entry (`EXA_API_KEY`, `TAVILY_API_KEY`, `PERPLEXITY_API_KEY` for those sources), never in chat text. Librarium v2 reads those variables without a config file; only configure the sources you want. Keep `@2` so the command cannot resolve to v1.

Grok Bot runs the server on its own cloud computer, so it can't use a config file or localhost on your machine.

**Grok Build** ([MCP docs](https://docs.x.ai/build/features/mcp-servers)): register user-wide with the terminal coding agent; add `--scope project` before the server name for this project:

```bash
grok mcp add librarium -- librarium mcp
```

For manual registration, merge this into `~/.grok/config.toml` for user-wide, or `.grok/config.toml` for this project:

```toml
[mcp_servers.librarium]
command = "librarium"
args = ["mcp"]
```

**Hermes Agent** ([MCP docs](https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp)): merge this into `~/.hermes/config.yaml` for user-wide. These MCP docs do not document a project-only config file; if that scope is required, stop and ask rather than inventing one:

```yaml
mcp_servers:
  librarium:
    command: "librarium"
    args: ["mcp"]
```

**Muse** ([official page](https://muse.ai/)): Muse doesn't document a manual MCP config. If Muse can register a local stdio server, follow the generic "Any other MCP host" guidance below; otherwise stop and report that limitation. Do not invent a config file or claim a verified connection.

**OpenClaw** ([MCP registry docs](https://docs.openclaw.ai/cli/mcp/registry)): save it in OpenClaw's user configuration. The local Gateway must be stopped before CLI mutations; ask before stopping a running Gateway, or use its Control UI. These docs do not document a project-only registration scope:

```bash
openclaw mcp add librarium --command librarium --arg mcp
```

**OpenCode** ([v2 MCP docs](https://opencode.ai/v2/docs/mcp-servers/), [config locations](https://opencode.ai/v2/docs/config/)): for v2, use `--global` for user-wide; omit it for this project:

```bash
opencode mcp add librarium --global -- librarium mcp
```

For manual v2 configuration, merge this into `~/.config/opencode/opencode.json` for user-wide, or `opencode.json` in the project root for this project:

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

If the installed OpenCode is v1, its [v1 MCP docs](https://opencode.ai/docs/mcp-servers/) put `librarium` directly under `mcp`, without the `servers` wrapper. Keep the same `type` and `command` fields; do not apply the v2 layout to v1.

**Pi** ([MCP docs](https://pi.dev/docs/latest/mcp)): current Pi has native MCP support. User-wide is the default (`~/.pi/agent/mcp.json`); add `--local` for this project (`.pi/mcp.json`, loaded after project trust):

```bash
pi mcp add librarium -- librarium mcp
```

An extension that registers `/mcp` replaces Pi's built-in MCP support. If one is installed, resolve that conflict with the user before using these native instructions. Run `/reload` after changing configuration outside a session.

**VS Code (GitHub Copilot)** ([MCP docs](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)): run **MCP: Open User Configuration** for user-wide within the active VS Code profile; for this project, edit `.vscode/mcp.json`. Merge this VS Code-format entry:

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

For portable Copilot/Agent Host configuration, the same docs also support `~/.copilot/mcp-config.json` user-wide or `.mcp.json` in this project, with `mcpServers` instead of `servers`.

**Zed** ([MCP docs](https://zed.dev/docs/ai/mcp)): open **zed: open settings file** and merge this user-wide entry into settings. These MCP docs do not document project-only server registration; do not assume project settings support it:

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

**Any other MCP host**: register a stdio server named `librarium` with command `librarium` and args `["mcp"]`, following the host's own config format.

If the host cannot find `librarium`, use the absolute path that `command -v librarium` prints as the command.

## 5. Configure sources

Ask which sources the user wants, then have the user run the setup wizard in their own terminal:

```bash
librarium setup
```

The user types keys into the wizard, not into chat. `setup --auto` discovers existing credentials offline; `setup --enable <names>` chooses sources explicitly. Configuration uses source names, options, and source lists saved as groups. Choose AI answer engines by name.

Keys stored as environment-variable references must also be present in the MCP server's environment. Claude Code passes the shell environment. Codex passes only a small default set, so list the variables in `env_vars` under `[mcp_servers.librarium]`. In Cursor, add an `env` entry such as `"EXA_API_KEY": "${env:EXA_API_KEY}"`. Other hosts have their own `env` setting, such as `amp mcp add --env`. Reference variable names only; never write key values into a committed file.

## 6. Verify offline

```bash
librarium setup --check
librarium sources --json
```

Use the offline checks above to verify configuration and credential presence.

Then confirm the MCP connection from the agent: call `list_sources`. It is local and free, and does not authenticate a provider. The server exposes exactly `research`, `get_run`, and `list_sources`. The host may need a restart or a new session before the tools appear.

## 7. Summarize

Stop here and tell the user:

- the installed version and how it was installed;
- which MCP client and scope were configured, and the file or command used;
- which providers are configured and any credential setup that remains;
- that no research or paid provider calls were made.

Do not run a first query unless the user asks for one. When they do, `librarium research "<question>" --only exa --dry-run --json` previews it offline first. The [agent docs](https://librarium.si/docs/using-with-agents.md) cover the MCP tools and how to read complete results.

## Laravel applications

For a native Laravel integration, use PHP 8.4+, Laravel 13.30+, and Laravel AI SDK `^1.0.1`:

```bash
composer require jkudish/laravel-ai-librarium
php artisan vendor:publish --tag=librarium-config
```

Configure source keys through Laravel configuration and preview with `dryRun()` before approved paid research. The [PHP docs](https://librarium.si/docs/php/index.md) cover storage, queues, and agents; [costs and limits](https://librarium.si/docs/php/costs-and-limits.md) explain spending controls. Keep the same paid-call approval and key-handling ground rules.
