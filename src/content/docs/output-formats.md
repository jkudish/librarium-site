---
title: Output formats
description: Run directory anatomy, summary.md, report.html, results.jsonl, run.json, and exit codes.
order: 3
---

## Run directory anatomy

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
  answer.md              # Present when the run was `librarium answer` or the wizard's synthesis toggle
  async-tasks.json       # Present if any async tasks were submitted
```

`summary.md` is generated at the end of every run. It includes the query, a deduplicated source count, a per-provider results table (status, duration, citation count, reported usage), and a combined unique-sources section. When a provider is still pending async, its row shows `pending` until `status --retrieve` updates it.

## run.json schema

`run.json` is the machine-readable run manifest. It is also what `--json` prints to stdout.

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

## --json vs results.jsonl

`--json` (the `run` flag) prints the `run.json` manifest to stdout. This is metadata only -- provider IDs, statuses, timing, citation counts -- not the full content.

`--jsonl` writes a `results.jsonl` file into the run directory. This is a newline-delimited JSON file where every line is independently parseable with `JSON.parse`. It embeds the full markdown content from every provider.

## results.jsonl line shapes

Each line in a `results.jsonl` file has a `type` field:

**Line 1 -- run header** (`"type":"run"`): query, slug, timestamp, mode, succeeded/failed/pending counts, unique source count, total citation count, and optional `refinedQueries` (only present when `--refine` was used).

**Optional answer line** (`"type":"answer"`): emitted right after the run header when the run directory contains an `answer.md` (from [`librarium answer`](/docs/commands#answer) or the wizard's synthesis toggle). Carries optional `provider` and `model` (from `run.json`'s `answer` metadata) and `content` (the full `answer.md` body).

**One line per provider** (`"type":"result"`): id, tier, status, durationMs, citationCount, optional usage object, optional error string, optional fallbackFor string, and `content` (the full markdown from the provider's `.md` file, or `null` when missing or pending).

**One line per deduped source** (`"type":"source"`): url, optional title, providers array, citationCount.

Keys with undefined values are omitted. `--jsonl` and `--html` are independent and combinable. `status --retrieve` regenerates an existing `results.jsonl` automatically when one is present. The JSONL export is also available as an action in `librarium browse`.

```bash
# Run and produce both formats at once
librarium run "postgres pooling" --html --jsonl

# Regenerate JSONL for an existing run
librarium jsonl ./agents/librarium/20250601-123456-postgres-pooling

# Stream-process with jq
librarium jsonl | xargs cat | jq 'select(.type=="result") | {id, status, citationCount}'
```

Note that `--jsonl` is distinct from `run --json`: `--json` prints the `run.json` manifest metadata to stdout, while `--jsonl` writes a `results.jsonl` file into the run directory with the full markdown content of every provider result embedded.

## html command

Generate a self-contained `report.html` for a run directory (default: the most recent run).

```bash
librarium html [run-dir] [--open]
```

The report contains the query, run metadata, the provider results table as tabs, with each provider's rendered markdown in a panel below, and the deduped source list with provider attribution. When the run directory contains an `answer.md` (from [`librarium answer`](/docs/commands#answer) or the wizard's synthesis toggle), an Answer section leads the report before the provider tabs, showing the synthesizing provider/model dimly. Answer and provider markdown are HTML-escaped with the same untrusted handling, so untrusted output cannot inject script. Results retrieved after the run (async deep research) fill in when the report is regenerated; `status --retrieve` regenerates an existing `report.html` automatically.

## jsonl command

Generate a machine-readable `results.jsonl` for a run directory (default: the most recent run).

```bash
librarium jsonl [run-dir]
```

## Exit codes

| Code | Meaning |
|---|---|
| `0` | All providers succeeded |
| `1` | Partial success (some providers failed) |
| `2` | Total failure (all providers failed, or configuration error) |
