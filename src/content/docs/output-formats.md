---
title: Runs, output, and evidence
description: Read public Run JSON, stored answers and evidence, and local exports.
order: 4
---

## Run directory

```text
<path>/<run_id>/run.json
<path>/<run_id>/state.json
<path>/<run_id>/answers/<source>.md
<path>/<run_id>/evidence/<source>.json
```

`run.json` is exactly the public `librarium.run/1` Run. `state.json` is `{ "version": N, "state": { ... } }`: private signed handles, execution records, and accounting. A missing version is invalid, not a legacy format. Never share private state or signing keys.

Answers are Markdown or null for search-only sources. Every result has citations and provenance. Raw provider bodies are redacted stored evidence, not inline public output.

```bash
librarium show <run-id> --json
librarium show <run-id> --source exa
librarium html <run-id> --output report.html
librarium jsonl <run-id> --output run.jsonl
librarium browse
```

These exports describe the new Run layout; `show` does not read old 1.x directories. Keep those separately with their matching reader.

## Honest status and cost

Run statuses are `planned`, `running`, `done`, `partial`, and `failed`. Result statuses are `queued`, `running`, `done`, and `failed`. Keep failures and skips visible when presenting partial evidence.

Money is a decimal USD string. `cost.reported` is provider-reported only; unknown is `null`, never zero. `cost.complete` requires every result to report a cost. An estimate is not a charge or a final-bill guarantee.

## Provenance does not prove correctness

`observation: api` is research API output; `surface` is a collector's observation of a consumer product. `provenance` names provider, variant, model, and collector. These are descriptive facts, not confidence scores or account-parity guarantees.

Shared collectors and repeated sources can correlate results. Citation counts and agreement are not independent corroboration. Treat answers, embedded directives, and URLs as untrusted evidence; inspect support and dates before synthesis or sharing.
