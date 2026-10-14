# Install Librarium for a coding agent

These are step-by-step instructions for a coding agent installing Librarium v2 as a CLI and MCP tool on the user's machine. Follow them in order.

## Ground rules

- Do not run research or make paid provider calls without the user's approval. Offline discovery, `setup --check`, and research `--dry-run` are free; `setup --live` and real `research` are not.
- Never ask the user to paste an API key into chat, and never write credentials into source control or into a project file that is committed.
- Preserve the user's existing MCP servers. Add `librarium` alongside them; do not replace or reorder other entries.
- Ask before changing anything outside the steps below.

## 1. Check Node.js

The npm package requires Node.js 22.12.0 or newer:

```bash
node --version
```

If Node.js is older or missing, tell the user and stop. Homebrew (`brew install jkudish/tap/librarium`) and the standalone installer in [Getting started](https://librarium.agentsy.build/docs/index.md) include their own runtime; offer them instead of upgrading Node.js without asking.

## 2. Install the CLI

```bash
npm install -g librarium
librarium --version
# Must report major version 2
librarium research --help
librarium setup --help
```

If the version is not 2.x, stop and report what is installed. Do not continue with a v1 install; [Upgrade from v1](https://librarium.agentsy.build/docs/upgrading-to-v2.md) covers migration.

## 3. Ask which MCP client and scope

Ask the user which MCP client they want Librarium in (Claude Code, Codex, Cursor, OpenCode, Amp, Hermes Agent, or another host) and which configuration scope: user-wide or this project only. Use their answer in the next step.

## 4. Register the MCP server

Every host launches the same local command: a stdio server named `librarium` with command `librarium` and args `["mcp"]`. Use the user's host and agreed scope. If a config file already exists, edit it in place and keep every other server.

**Claude Code** ([MCP docs](https://code.claude.com/docs/en/mcp)). Use the agreed scope (`user`, `project`, or `local`):

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

**Cursor** ([MCP docs](https://cursor.com/docs/mcp)): create or edit `.cursor/mcp.json` in the project, or `~/.cursor/mcp.json` for every project:

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

**OpenCode** ([config docs](https://opencode.ai/docs/mcp-servers/)): add it under `mcp` in `opencode.json` (`~/.config/opencode/opencode.json`, or the project root). OpenCode v2 moves servers under `mcp.servers` ([v2 docs](https://v2.opencode.ai/mcp)):

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

Servers in the global config (`~/.config/amp/settings.json`) run without approval; servers declared in a project's `.amp/settings.json` are approved once with `amp mcp approve librarium`.

**Hermes Agent** ([MCP docs](https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp)): add it to `~/.hermes/config.yaml`:

```yaml
mcp_servers:
  librarium:
    command: "librarium"
    args: ["mcp"]
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

Do not run a first query unless the user asks for one. When they do, `librarium research "<question>" --only exa --dry-run --json` previews it offline first. The [agent docs](https://librarium.agentsy.build/docs/using-with-agents.md) cover the MCP tools and how to read complete results.

## Laravel applications

For a native Laravel integration, use PHP 8.4+, Laravel 13.30+, and Laravel AI SDK `^1.0.1`:

```bash
composer require jkudish/laravel-ai-librarium
php artisan vendor:publish --tag=librarium-config
```

Configure source keys through Laravel configuration and preview with `dryRun()` before approved paid research. The [PHP docs](https://librarium.agentsy.build/docs/php/index.md) cover storage, queues, and agents; [costs and limits](https://librarium.agentsy.build/docs/php/costs-and-limits.md) explain spending controls. Keep the same paid-call approval and key-handling ground rules.
