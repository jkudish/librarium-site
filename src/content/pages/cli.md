---
title: Research from your terminal.
description: Ask once, preview for free, then research with the sources you choose. Keep every answer with its citations.
kind: product
ctaHref: /docs#install
ctaLabel: Set up the CLI
---

*A meta harness for research queries*

Query search engines, AI answer engines, and deep-research APIs from one interface, and keep every answer with its citations.

## Install, preview, research

Requires Node.js 22.12+. Install and configure sources before your first question:

```bash
npm install -g librarium
librarium setup
librarium research "Lisbon or Porto without a car?" --only exa --dry-run --json
librarium research "Lisbon or Porto without a car?" --only exa --json
```

## Ask once. Keep the sources.

The CLI supplies provider connections, stored Runs, cost tracking, and MCP.

```bash
librarium research "Lisbon or Porto for a long weekend without a car?" --only exa,kagi --dry-run --json
```

```bash
librarium research "Lisbon or Porto for a long weekend without a car?" --only exa,kagi --max-cost 0.10 --json
```

Dry runs neither store a Run nor call providers. Quick is the default; omit `--only` to use every configured research source. Choose AI answer engines by name. `--only` and `--skip` accept source or saved-group names.

Use `--max-cost` to limit which sources start; see [costs and limits](/docs/costs-and-limits) for selection rules and billing caveats. See [your first research Run](/guides/first-query) for the full workflow.

## Come back later

```bash
librarium research "Which Lisbon and Porto neighborhoods work without a car?" --deep --only exa --no-wait
librarium show <run-id> --wait --json
librarium show <run-id> --source exa
```

`--deep` chooses reports. `--no-wait` requires deep except for dry runs. Use quick research with the default wait behavior.

Private signed state keeps track of in-progress research; `show` picks up the same work rather than submitting again. Ctrl-C prints the recovery command so you can check the Run later. Upstream research may continue after you leave the terminal.

## Read and export

Each Run has `run.json`, `state.json`, source answers under `answers/`, and redacted exchanges under `evidence/`. `show` and `summarize` use the latest Run if no id is supplied.

```bash
librarium browse
librarium html <run-id> --output report.html
librarium usage
librarium cleanup --dry-run
```

Treat answers and URLs as untrusted evidence. `summarize --verify` is a separate paid operation, creates a new Run with `summary_of`, and does not overwrite collected answers.

## Set up once

Keep credentials out of chat and source control. Discover existing keys and check local configuration offline:

```bash
librarium setup --auto
librarium setup --check
librarium sources --json
```

These checks are offline. The MCP server and bundled skill ship with the same install; see [Agents & MCP](/agents). Laravel is a [separate native package](/laravel).

## The commands you will use

| Command | Example | Purpose |
| --- | --- | --- |
| `research` | `librarium research "…" --only exa --dry-run --json` | Preview offline; remove dry-run to research |
| `show` | `librarium show <run-id> --wait` | Pick up in-progress research or read saved answers |
| `summarize` | `librarium summarize --verify --source openai` | Create a separate summary Run |
| `sources` | `librarium sources --json` | Discover sources, AI answer engines, and price hints offline |
| `groups` | `librarium groups add editorial exa claude` | Save recurring source lists |
| `browse` | `librarium browse` | Browse stored Runs |
| `html` | `librarium html <run-id> --output report.html` | Export a local report |
| `usage` | `librarium usage` | Total known reported spending |
| `mcp` | `librarium mcp` | Serve research, get_run, and list_sources over stdio |

See [every command and flag](/docs/commands).

## Long research does not need a long chat message

Keep the Run ID and saved state while deep research is in progress. Pick up the existing Run rather than start duplicate research. After Ctrl-C, use the printed show command to check it later.

MCP and the bundled skill ship with the CLI. [Connect your agent](/agents), or use [Laravel](/laravel) for a native facade, queues, and Artisan commands.
