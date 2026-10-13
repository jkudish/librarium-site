---
title: Commands
description: Research, show, summarize, sources, groups, setup, and MCP.
order: 3
---

## Research

```bash
librarium research "Compare managed PostgreSQL services" --only exa,openai --dry-run --json
librarium research "Compare managed PostgreSQL services" --deep --only exa,openai --max-cost 1
librarium research "Compare managed PostgreSQL services" --deep --no-wait
```

| Option | Meaning |
| --- | --- |
| `--deep` | Choose deep variants; quick is the default |
| `--only <names>` | Comma-separated sources, engines, or saved groups |
| `--skip <names>` | Remove names after group expansion |
| `--max-cost <usd>` | Admit bounded estimates greedily in catalog order and stop unstarted work as reported spend and reservations consume the cap |
| `--dry-run` | Return a planned Run without provider calls or storage |
| `--no-wait` | Detach deep work; invalid for quick except dry runs |
| `--json` | Write the public Run as JSON |

With a cap, unpriced sources are skipped, not guessed free. In-flight work can finish above the cap. A named source without credentials is an error. Failed sources are not replaced by other sources.

## Read and summarize

```bash
librarium show <run-id> --wait --json
librarium show <run-id> --source exa
librarium summarize <run-id> --source openai --verify --json
```

`show` and `summarize` use the latest Run when no id is supplied. `show --wait` finishes saved durable work; old 1.x folders are not readable. `summarize` makes a new paid Run linked by `summary_of`; the source Run stays unchanged. Verification uses the same synthesis source and can also spend. Source choice is configured `summarize.source`, then `--source`, then the first set-up source in `openai`, `claude`, `gemini`, `openrouter` order. There is no failure cascade.

## Discover and configure

```bash
librarium sources --json
librarium groups add editorial exa claude
librarium groups remove editorial
librarium setup
librarium setup --check
librarium mcp
```

Groups are user-saved source lists; there are no built-ins. Offline setup checks do not authenticate. `setup --live` can make billable requests and needs spending authorization. The MCP server exposes exactly `research`, `get_run`, and `list_sources`.

## Local tools

| Command | Purpose |
| --- | --- |
| `browse` | Saved Run history |
| `html [id] --output report.html` | HTML export |
| `jsonl [id] --output run.jsonl` | JSONL export |
| `usage` | Known provider-reported spend |
| `cleanup --dry-run` | Preview configured retention |
| `config path`, `config show`, `config set <path> <value>` | Inspect or edit v3 config |
| `completions bash\|zsh\|fish` | Shell completions |
| `upgrade` | Update an existing installation |
| `install-skill --force` | Install the version-matched bundled skill |

See [migration replacements](/docs/upgrading-to-v2) for retired commands, and [recovery](/docs/request-and-retry) before manually repeating ambiguous provider work.
