---
title: Commands
description: The core research workflow commands -- run, status, browse, and related flags.
order: 2
---

## Interactive wizard

Running `librarium` with no arguments in a terminal starts an interactive wizard: enter the query, pick a group (with provider counts and tier breakdowns as hints) or hand-pick providers, choose the mode, confirm, and the run executes with the live table. Afterwards it offers to open the results in the browser. Non-TTY invocations print help instead, so scripts never hang.

```bash
librarium
```

## run

Run a research query across multiple providers.

```bash
librarium run <query> [options]
```

| Flag | Description |
|---|---|
| `-p, --providers <ids>` | Comma-separated provider IDs or display names |
| `-g, --group <name>` | Use a predefined provider group |
| `-m, --mode <mode>` | Execution mode: `sync`, `async`, or `mixed` |
| `-o, --output <dir>` | Output base directory |
| `--parallel <n>` | Max parallel requests |
| `--timeout <n>` | Timeout per provider in seconds |
| `--json` | Output `run.json` to stdout |
| `--refine` | Rewrite the query into tier-tuned variants with one LLM call before dispatch |
| `--html` | Generate a self-contained `report.html` in the run directory |
| `--jsonl` | Generate a machine-readable `results.jsonl` in the run directory |
| `--open` | Open the output directory (or `report.html` with `--html`) when the run completes |

```bash
# Run with specific providers
librarium run "database indexing" --providers perplexity-sonar-pro,exa

# Provider display names also work on the CLI (mix and match with IDs)
librarium run "query" -p "Exa Search,brave-search"

# Deep research, wait for completion
librarium run "AI agent architectures" --group deep --mode sync

# Fast results only
librarium run "Node.js 22 features" --group fast

# Run, generate HTML report, and open it
librarium run "postgres scaling" --html --open
```

The `--providers` flag accepts canonical IDs, legacy aliases, or display names (case- and punctuation-insensitive, so `"Exa Search"`, `exa-search`, and `EXA SEARCH` all resolve to `exa`). Display names are a CLI input convenience only. Config files (provider keys, custom groups, fallback targets) still require canonical IDs or legacy aliases.

In an interactive terminal, `run` shows a live per-provider results table. Every row appears at fan-out with a spinner and ticking elapsed time, then resolves in place as results arrive:

```
$ librarium run "postgres pooling best practices"

  fanning out to 6 providers

  ✓ perplexity-sonar-pro   ai-grounded        2.1s    12 sources
  ✓ gemini-grounded        ai-grounded        3.4s     9 sources
  ✓ exa                    ai-grounded        1.8s    25 sources
  ✓ brave-search           raw-search         0.9s    20 results
  ✗ tavily                 raw-search         0.4s   HTTP 401 Unauthorized
    ↳ falling back to jina-search
  ✓ jina-search            raw-search         0.7s     8 results   (fallback for tavily)
  ◷ openai-deep            deep-research   submitted

  5 succeeded, 0 failed, 1 async pending in 3.5s
  ▸ 74 unique sources after dedupe (74 total citations)
  ▸ ~/research/agents/librarium/1781136000-postgres-pooling-best-practices/

  ◷ async tasks pending: run `librarium status --wait` to poll and retrieve
```

Successes are green, failures red with the reason inline, async submissions amber. Durations of 10s or more are highlighted. When a provider's API reports usage, a dim suffix shows it on the line (`· 8.4k tok` or `· $0.012`), and the summary adds a `reported cost` line covering the providers that reported one -- costs are never estimated from pricing tables, only taken from API responses. Piped or CI output degrades to plain append-on-completion lines, and `--json` keeps stdout pure JSON (the table goes to stderr).

## status

Check or wait for async deep-research tasks.

```bash
librarium status [options]
```

| Flag | Description |
|---|---|
| `--wait` | Block and poll until all async tasks complete |
| `--retrieve` | Fetch completed results and write output files |
| `--json` | Output JSON |

```bash
# Check pending tasks
librarium status

# Wait for completion then retrieve results
librarium status --wait --retrieve
```

Retrieved results render with the same table line format as `run`, with the output file and word count appended:

```
  ✓ openai-deep   deep-research     95.0s    14 sources   openai-deep.md, 2310 words
```

## browse

Browse past runs and their provider results.

```bash
librarium browse [-o <output-dir>]
```

Pick a recent run (date, query, status tallies) and see its providers rendered in the same table format. Selecting a provider (or the run's `summary.md`) opens the full document in a built-in fullscreen reader: markdown rendered with ANSI styling (bold headings, dim code, normalized bullets, clickable links) and hard-wrapped to the terminal width, re-wrapping on resize. Other actions: export an HTML report, export JSONL, back, quit.

Reader key bindings:

| Key | Action |
| --- | --- |
| `j` / `k` or arrow down / up | scroll one line |
| `space` / `PageDown` | next page |
| `b` / `PageUp` | previous page |
| `g` / `G` | jump to top / bottom |
| `o` | open the raw file in `$PAGER` (fallback `less -R`) |
| `q` / `escape` | back to the provider list |

## refine

Rewrite a research goal into tier-tuned query variants without dispatching.

```bash
librarium refine "figure out how to scale postgres connections" [--json]
```

Prints a thorough brief for deep-research providers, a focused question for ai-grounded providers, a keyword query for raw-search providers, and a suggested group. The same transform powers `run --refine`, which dispatches each provider with its tier's variant (recorded in `run.json` and `prompt.md` for reproducibility). The LLM call uses the first available of OpenAI (`gpt-5-mini`), Gemini (`gemini-2.5-flash`), or Perplexity (`sonar`), overridable via a `refine: { provider, model }` config key. If the call fails, the run proceeds with the original query.

## ls

List all available providers with their status.

```bash
librarium ls [--json]
```

Shows each provider's ID, display name, tier, source (`builtin`, `npm`, `script`), enabled state, and whether an API key is configured.

## groups

List and manage provider groups.

```bash
# List all groups
librarium groups

# Add a custom group
librarium groups add my-stack perplexity-sonar-pro exa tavily

# Remove a custom group
librarium groups remove my-stack

# Output as JSON
librarium groups --json
```
