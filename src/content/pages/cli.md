---
title: Research from your terminal.
description: Ask a question and keep every source’s answer for later.
kind: product
ctaHref: /docs#install
ctaLabel: Set up the CLI
---

*A meta harness for research queries*

Ask a question and keep every source’s answer for later.

The npm install requires Node.js 22.12+; Homebrew includes its own runtime.

```bash
npm install -g librarium
```

```bash
brew install jkudish/tap/librarium
```

```bash
librarium setup
librarium research "Lisbon or Porto without a car?" --only exa --dry-run --json
librarium research "Lisbon or Porto without a car?" --only exa --json
```

## Read a saved Run

Every answer stays with its citations. [The command reference](/docs/commands) covers browsing, summaries, and export.

```bash
librarium show <run-id> --source exa
```

## Come back later

Start deep research without waiting, then reopen the same Run. [Recovery docs](/docs/request-and-retry) explain what happens after interruption.

```bash
librarium research \
  "Lisbon or Porto without a car?" \
  --deep --only exa --no-wait
librarium show <run-id> --wait --json
```

## Connect your agent

The same install includes an MCP server and agent skill. [Agents & MCP](/agents) has the setup for your coding agent.

```bash
librarium mcp
```
