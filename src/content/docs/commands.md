---
title: Commands
description: The core research workflow commands -- run, answer, status, browse, usage, and related flags.
order: 2
---

## Interactive wizard

Running `librarium` with no arguments in a terminal starts an interactive wizard: enter the query, pick a group (with provider counts and tier breakdowns as hints) or hand-pick providers, choose the mode, confirm, and the run executes with the live table. Afterwards it offers to open the results in the browser. Non-TTY invocations print help instead, so scripts never hang.

When an LLM client key is configured, the wizard also offers a synthesis toggle after its refine prompt: confirm it to synthesize a grounded answer from the results, producing the same `answer.md` and run metadata as [`librarium answer`](#answer).

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
| `--max-cost <usd>` | Stop launching providers once API-reported cost crosses this budget (see [Spend guardrails](#spend-guardrails)) |
| `--max-estimated-cost <usd>` | Reserve each provider's pre-dispatch *estimated* cost and skip launches once the estimate crosses this ceiling (see [Spend guardrails](#spend-guardrails)) |
| `-y, --yes` | Skip the deep-research pre-flight confirm |
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

The `--providers` flag accepts canonical IDs, legacy aliases, or display names (case- and punctuation-insensitive, so `"Exa Search"`, `exa-search`, and `EXA SEARCH` all resolve to `exa`). Display names are a CLI input convenience only. If a name is ambiguous, the run stops and lists the matching candidates; if it is unrecognized, the run stops with a short did-you-mean list of suggestions. Config files (provider keys, custom groups, fallback targets) still require canonical IDs or legacy aliases.

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
  ◷ openai-research        deep-research   submitted

  5 succeeded, 0 failed, 1 async pending in 3.5s
  ▸ 74 unique sources after dedupe (74 total citations)
  ▸ ~/research/agents/librarium/1781136000-postgres-pooling-best-practices/

  ◷ async tasks pending: run `librarium status --wait` to poll and retrieve
```

Successes are green, failures red with the reason inline, async submissions amber. Durations of 10s or more are highlighted. When a provider's API reports usage, a dim suffix shows it on the line (`· 8.4k tok` or `· $0.012`), and the summary adds a `reported cost` line covering the providers that reported one -- costs are never estimated from pricing tables, only taken from API responses. Piped or CI output degrades to plain append-on-completion lines, and `--json` keeps stdout pure JSON (the table goes to stderr).

## answer

Fan out a query and synthesize one grounded, cited answer from the results.

```bash
librarium answer <query> [options]
```

`answer` runs the same fan-out as `run` (defaulting to the `quick` group, overridable with `-g`/`-p`/`-m` and the usual run flags), then makes one LLM synthesis call over the successful providers' content plus the deduped source list. The model is instructed to answer only from the findings, cite with inline `[n]` indices that map to the numbered source list, and state what is uncertain rather than invent. The answer is rendered in the terminal followed by a hyperlinked source list, and written to `answer.md` in the run directory.

```
$ librarium answer "what changed in postgres 17 logical replication"

  fanning out to 5 providers

  ✓ gemini-grounded     ai-grounded        2.7s     8 sources
  ✓ openrouter-online   ai-grounded        2.1s     7 sources
  ✓ brave-answers       ai-grounded        0.9s    15 sources
  ✓ exa                 ai-grounded        1.6s    19 sources
  ✓ kagi-fastgpt        ai-grounded        3.4s     4 sources

  Postgres 17 makes logical replication materially easier to operate. Replication
  slots and subscription state now survive a major-version upgrade with pg_upgrade,
  so you no longer have to resync subscribers after an upgrade [1] [3]. It also adds
  failover-aware slots that can follow a promoted standby, closing a long-standing
  gap for high-availability setups [2].

  What the findings do not settle is exact performance deltas under heavy write load;
  the sources describe the features but not benchmarked throughput [4].

  Sources
  [1] PostgreSQL 17 Release Notes
  [2] Logical replication failover in PG17
  [3] pg_upgrade and replication slots
  [4] What's new in Postgres 17

  5 succeeded, 0 failed, 0 async pending in 3.4s
  ▸ 38 unique sources after dedupe (53 total citations)
  ▸ ~/research/agents/librarium/1781136000-what-changed-in-postgres-17/
```

The synthesis call uses the first available of OpenAI (`gpt-5-mini`), Gemini (`gemini-2.5-flash`), or Perplexity (`sonar`), overridable via an `answer: { provider, model }` config key that falls back to the `refine` config and then to those defaults. Synthesis fails open: if every client fails (quota, auth, timeout), a detailed warning prints and the run summary and output directory still appear, so the research is never lost. The exit code reflects the run, not the synthesis.

`answer` accepts the usual run flags, including `--max-cost`, `--max-estimated-cost`, `--html`, and `--jsonl`. When the run directory contains `answer.md`, both `report.html` (an Answer section leading the report) and `results.jsonl` (a `"type":"answer"` line) pick it up automatically on generation and regeneration -- see [Output formats](/docs/output-formats). The [interactive wizard](#interactive-wizard) also offers grounded synthesis after its refine prompt when an LLM client key is configured.

## Spend guardrails

Two opt-in guardrails help avoid surprise spend on large fan-outs.

**Deep-research pre-flight confirm.** When a run would dispatch three or more deep-research-tier providers, an interactive terminal shows a confirmation first, listing the providers and warning that deep research takes minutes and bills per call. Pass `-y, --yes` to skip it. Non-TTY runs (pipes, CI) never prompt and are never refused, so scripts never hang. The wizard's own confirm counts as consent, so running through the wizard never double-prompts.

**Cost budget (`--max-cost <usd>` or `defaults.maxCostUsd`).** A runtime circuit breaker, not an estimator. As provider results arrive, librarium accumulates the cost each provider's API actually reported. Once the accumulated total crosses the budget, providers that have not started yet are skipped (shown as `skipped` in the table and `run.json`, with a budget reason); in-flight requests are allowed to finish, because aborting a request mid-flight is hostile to most provider APIs and you would be billed anyway. The flag wins over the config key. When the breaker trips, the summary adds a line like:

```
  ▸ budget reached: $0.48 reported of $0.50 budget, skipped 3 providers
```

### What counts toward the budget

The budget is honest, not predictive. Only costs an API actually reports count toward it. A provider that reports no cost contributes `0`, so the accumulated total is always a lower bound on real spend, never an estimate from a pricing table. That has two consequences worth understanding:

- Providers that report nothing can run "for free" as far as the breaker is concerned, even though they may cost real money. The budget cannot stop what it cannot see.
- Deep-research costs land at *retrieval* (when you run `librarium status --wait`), long after the dispatch that submitted them has returned. Those async costs cannot be pre-metered and so cannot be enforced by `--max-cost` at submit time.

Use `--max-cost` as a backstop against runaway synchronous fan-outs, not as a hard billing cap.

### Metering registry and the estimated budget

`--max-cost` is deliberately reported-only: it never guesses. The gap it leaves -- providers that report no cost (most raw-search APIs) run "for free" as far as the breaker is concerned -- is filled by a separate, opt-in **estimated** lane.

Every provider declares a **metering kind** in a built-in registry, visible in [`librarium ls`](#ls) (and its `--json`):

| Kind | Meaning | Examples |
|---|---|---|
| `native_cost` | API returns a real per-call cost | Perplexity, Exa, OpenRouter |
| `native_tokens` | API returns token counts but no cost | Claude, OpenAI, Gemini |
| `request_priced` | Deterministic/plan price per request | SerpAPI, SearchAPI, Brave Search, Kagi |
| `credit_priced` | Priced in account credits per request | Tavily, Firecrawl, You.com |
| `api_unit_priced` | Priced per API unit/token, size known only after the call | Jina, Brave AI Answers |
| `manual_unmetered` | No reliable per-call metering | custom providers |

For request- and credit-priced providers, librarium can produce a **network-free estimate** *before* a call runs. Estimates are guesses, never facts: they live under each result's `metering.estimate` (never in `usage.costUsd`), carry a `costConfidence` (`estimated` from a built-in default snapshot, `configured` when you supply pricing, `unknown` when there's no basis) and a `pricingVersion`. Plan-dependent credit providers emit unit metadata (`billableUnits`, `unit`) **without** an invented dollar figure until you configure a price via provider `options` (`perRequestUsd`, or `creditUsd` + `creditsPerRequest`).

**Estimated budget (`--max-estimated-cost <usd>` or `defaults.maxEstimatedCostUsd`).** A pre-dispatch *reservation* ceiling, independent of `--max-cost` (the two never reconcile into one number). Before each provider launches, its estimated cost is reserved; once the reservation crosses the ceiling, not-yet-started providers are skipped with an estimated-budget reason. Providers with no estimable cost reserve `0`, so the reserved total is an honest lower bound. This gives products pre-call budget reservation that `--max-cost` (which only learns cost *after* a call) cannot. When it trips, the summary adds a line like:

```
  ▸ estimated budget reached: ~$0.05 reserved of $0.05 budget, skipped 2 providers
```

The actual-cost provenance of a reported figure is recorded as `metering.actual.source` (`provider_reported` today; values like `computed_from_tokens`/`computed_from_credits` are reserved for future computed lanes).

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
  ✓ openai-research   deep-research     95.0s    14 sources   openai-research.md, 2310 words
```

## usage

Aggregate API-reported cost and tokens across past runs.

```bash
librarium usage [options]
```

| Flag | Description |
|---|---|
| `--days <n>` | Only include runs from the last N days (filtered by manifest timestamp) |
| `--json` | Output JSON |
| `-o, --output <dir>` | Output base directory |

`usage` walks the `run.json` manifests under the output base directory and totals up cost and tokens per provider, plus a run count and date range. As with the run summary, only API-reported costs are counted in the `cost` column (providers that report nothing contribute `0`), so figures are honest lower bounds, never pricing-table estimates. A separate `est. cost` column sums any pre-dispatch estimates from the [metering registry](#metering-registry-and-the-estimated-budget) -- a guess, never billed, never mixed with reported cost. The output notes how many runs had no reported usage.

```
$ librarium usage --days 30

Usage (last 30 days):

  provider       cost  est. cost  tokens  runs
  -----------  ------  ---------  ------  ----
  openai-research   $0.50          -    5.0k     1
  exa          $0.020          -    1.5k     1
  serpapi           -    ~$0.015       -     1

  runs: 2
  total reported cost: $0.52
  total estimated cost: ~$0.015 (pre-dispatch estimate, not billed)
  date range: 2026-01-14 15:58 to 2026-01-14 16:00
  1 of 2 runs had no reported usage
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

Shows each provider's ID, display name, tier, [metering kind](#metering-registry-and-the-estimated-budget), source (`builtin`, `npm`, `script`), enabled state, and whether an API key is configured.

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

## mcp

Start an MCP server over stdio so AI agents can drive librarium through tool calls. See [Using with AI agents](/docs/using-with-agents) for setup and the full tool list.

```bash
# Register with Claude Code
claude mcp add librarium -- librarium mcp

# Or run directly (stdout is the protocol stream; diagnostics go to stderr)
librarium mcp
```
