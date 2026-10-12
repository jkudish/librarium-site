# Install Librarium for a coding agent

These are step-by-step instructions for a coding agent installing Librarium v2 as a CLI and MCP tool on the user's machine. Follow them in order.

## Ground rules

- Do not run research or make paid provider calls without the user's approval. Every step below is local and free; `librarium doctor --live`, `librarium run`, and the MCP `research` tool are not.
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

## 5. Configure providers

Ask which providers the user wants, then have the user run the setup wizard in their own terminal:

```bash
librarium init
```

`init` asks where to store each key: the OS keychain (macOS), a shell environment variable, or the user's config file. The user types keys into the wizard, not into chat. If their keys are already exported as environment variables, `librarium init --auto` enables the providers it finds; opt-in providers need `librarium init --enable <ids>`.

Keys stored as environment-variable references must also be present in the MCP server's environment. Claude Code passes the shell environment. Codex passes only a small default set, so list the variables in `env_vars` under `[mcp_servers.librarium]`. In Cursor, add an `env` entry such as `"EXA_API_KEY": "${env:EXA_API_KEY}"`. Other hosts have their own `env` setting, such as `amp mcp add --env`. Reference variable names only; never write key values into a committed file.

## 6. Verify offline

```bash
librarium doctor
```

Run `doctor` without `--live`. It checks configuration and credential presence offline; `--live` makes provider requests and may incur charges. Credential presence is not authentication.

Then confirm the MCP connection from the agent: call `list_providers` and `list_groups`. Both are local and free, and neither authenticates a provider. The host may need a restart or a new session before the tools appear.

## 7. Summarize

Stop here and tell the user:

- the installed version and how it was installed;
- which MCP client and scope were configured, and the file or command used;
- which providers are configured and any credential setup that remains;
- that no research or paid provider calls were made.

Do not run a first query unless the user asks for one. When they do, `librarium plan "<question>" --group quick --json` previews it offline first. The [agent docs](https://librarium.agentsy.build/docs/using-with-agents.md) cover the MCP tools and how to read complete results.
