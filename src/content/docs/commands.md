---
title: Commands
description: Every CLI command with flags and examples.
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
| `-p, --providers <ids>` | Comma-separated provider IDs |
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

# Deep research, wait for completion
librarium run "AI agent architectures" --group deep --mode sync

# Fast results only
librarium run "Node.js 22 features" --group fast

# Run, generate HTML report, and open it
librarium run "postgres scaling" --html --open
```

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

## html

Generate a self-contained `report.html` for a run directory (default: the most recent run).

```bash
librarium html [run-dir] [--open]
```

The report contains the query, run metadata, the provider results table as tabs, with each provider's rendered markdown in a panel below, and the deduped source list with provider attribution. Provider markdown is HTML-escaped, so untrusted output cannot inject script. Results retrieved after the run (async deep research) fill in when the report is regenerated; `status --retrieve` regenerates an existing `report.html` automatically.

## jsonl

Generate a machine-readable `results.jsonl` for a run directory (default: the most recent run).

```bash
librarium jsonl [run-dir]
```

The file contains one JSON object per line (JSONL / newline-delimited JSON). Each line can be parsed independently with `JSON.parse`:

- **Line 1 - run header** (`"type":"run"`): query, slug, timestamp, mode, succeeded/failed/pending counts, unique source count, total citation count, and optional `refinedQueries` (only present when `--refine` was used).
- **One line per provider** (`"type":"result"`): id, tier, status, durationMs, citationCount, optional usage object, optional error string, optional fallbackFor string, and `content` (the full markdown from the provider's `.md` file, or `null` when missing or pending).
- **One line per deduped source** (`"type":"source"`): url, optional title, providers array, citationCount.

Keys with undefined values are omitted. `--jsonl` and `--html` are independent and combinable. `status --retrieve` regenerates an existing `results.jsonl` automatically when one is present. The JSONL export is also available as an action in `librarium browse`.

Note that `--jsonl` is distinct from `run --json`: `--json` prints the `run.json` manifest metadata to stdout, while `--jsonl` writes a `results.jsonl` file into the run directory with the full markdown content of every provider result embedded.

```bash
# Run and produce both formats at once
librarium run "postgres pooling" --html --jsonl

# Regenerate JSONL for an existing run
librarium jsonl ./agents/librarium/20250601-123456-postgres-pooling

# Stream-process with jq
librarium jsonl | xargs cat | jq 'select(.type=="result") | {id, status, citationCount}'
```

## refine

Rewrite a research goal into tier-tuned query variants without dispatching.

```bash
librarium refine "figure out how to scale postgres connections" [--json]
```

Prints a thorough brief for deep-research providers, a focused question for ai-grounded providers, a keyword query for raw-search providers, and a suggested group. The same transform powers `run --refine`, which dispatches each provider with its tier's variant (recorded in `run.json` and `prompt.md` for reproducibility). The LLM call uses the first available of OpenAI (`gpt-5-mini`), Gemini (`gemini-2.5-flash`), or Perplexity (`sonar`), overridable via a `refine: { provider, model }` config key. If the call fails, the run proceeds with the original query.

## completions

Print a static shell completion script covering commands, flags, and the builtin group names.

```bash
# zsh
eval "$(librarium completions zsh)"

# bash
eval "$(librarium completions bash)"

# fish
librarium completions fish > ~/.config/fish/completions/librarium.fish
```

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

## init

Set up librarium configuration. Auto mode discovers API keys from your environment and enables matching providers.

```bash
# Auto-discover (non-interactive)
librarium init --auto

# Interactive setup
librarium init
```

## doctor

Health check: tests API connectivity for all enabled providers.

```bash
librarium doctor [--json]
```

## config

Print the resolved configuration (global merged with project).

```bash
# Show resolved config
librarium config

# Show only global config
librarium config --global

# Output raw JSON
librarium config --json
```

## cleanup

Remove output directories. By default deletes runs older than 30 days; `--all` deletes every run regardless of age.

```bash
# Delete directories older than 30 days (default)
librarium cleanup

# Custom age threshold
librarium cleanup --days 7

# Preview what would be deleted (count, total size, oldest/newest)
librarium cleanup --dry-run

# Delete every run directory (interactive confirm in a TTY)
librarium cleanup --all

# Pick exactly which runs to delete from a checklist
librarium cleanup -i

# JSON output and an alternate output base dir
librarium cleanup --all --json -o ./agents/librarium
```

In a terminal, `--all` prompts for confirmation (showing run count and total size on disk) before deleting. In a non-interactive context (pipe, CI), pass `--yes` to confirm, otherwise the command refuses to delete. The `-i`/`--interactive` flag opens a multiselect of runs showing date, query, size, and a pending-async marker. Runs that still have pending async tasks are flagged in the list and confirm, since deleting them orphans the server-side task handle. After deleting, the command reports the disk space freed. It never deletes anything outside the resolved output base directory and refuses to operate if that directory resolves to your home directory or a filesystem root.

## clear

Alias for `librarium cleanup --all`: deletes every run directory. Same flags pass through (`--dry-run`, `-i`/`--interactive`, `--yes`, `-o`/`--output`, `--json`).

```bash
# Delete all runs (interactive confirm in a TTY, --yes required in non-TTY)
librarium clear

# Preview everything that would be removed
librarium clear --dry-run

# Interactively pick which runs to clear
librarium clear -i
```

## upgrade

Auto-detects your install method and runs the correct upgrade command.

```bash
librarium upgrade
```

## Output format

Each research run creates a timestamped output directory:

```
./agents/librarium/1771500000-postgresql-pooling/
  prompt.md              # The research query
  run.json               # Run manifest (machine-readable)
  summary.md             # Synthesized summary with statistics
  sources.json           # Deduplicated citations across all providers
  perplexity-sonar-pro.md    # Per-provider markdown results
  perplexity-sonar-pro.meta.json  # Per-provider metadata (model, timing, citations)
  brave-answers.md
  brave-answers.meta.json
  async-tasks.json       # Present if any async tasks were submitted
```

### run.json schema

```json
{
  "version": 1,
  "timestamp": 1771500000,
  "slug": "postgresql-pooling",
  "query": "PostgreSQL connection pooling best practices",
  "mode": "mixed",
  "outputDir": "/absolute/path/to/output",
  "providers": [
    {
      "id": "perplexity-sonar-pro",
      "tier": "ai-grounded",
      "status": "success",
      "durationMs": 2340,
      "wordCount": 850,
      "citationCount": 12,
      "outputFile": "perplexity-sonar-pro.md",
      "metaFile": "perplexity-sonar-pro.meta.json"
    }
  ],
  "sources": {
    "total": 45,
    "unique": 28,
    "file": "sources.json"
  },
  "asyncTasks": [],
  "exitCode": 0
}
```

## Exit codes

| Code | Meaning |
|---|---|
| `0` | All providers succeeded |
| `1` | Partial success (some providers failed) |
| `2` | Total failure (all providers failed, or configuration error) |
