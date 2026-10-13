---
title: Artisan commands
description: Research, show, sources, and prune using stored Run JSON.
order: 2
---

## Preview and research

```bash
php artisan librarium:research 'Compare EU analytics tools' --deep --only=openai --dry-run --json
php artisan librarium:research 'Compare EU analytics tools' --deep --only=openai --max-cost=1 --json
php artisan librarium:research 'Prepare a cited report' --deep --only=openai --no-wait
```

`--only` and `--skip` take comma-separated sources, engines, or saved groups. `--max-cost` is a decimal USD cap. `--dry-run` makes no provider call and stores nothing. Normal research waits with progress; `--no-wait` queues one encrypted job and returns the Run. Unlike the JS CLI, PHP can queue quick work too.

## Read stored work

```bash
php artisan librarium:show <run-id> --wait --json
php artisan librarium:show <run-id> --source=openai
php artisan librarium:sources
php artisan librarium:prune
```

`show` defaults to the latest Run when no id is supplied, observes pending tasks, and optionally waits. `--source` reads one result. `sources` reports configuration and variants offline. `prune` uses `runs.keep_days`; choose retention longer than task life because deleting a handle does not cancel upstream work.

`--json` emits unformatted public data; keep stderr separate. These are Artisan commands, not an MCP server. The Laravel AI `Tools\RunEvidence` tool reads stored Runs.

## Exit codes and interruption

| Code | Meaning |
| ---: | --- |
| 0 | Done, running, planned, or successful operation |
| 2 | Invalid request |
| 3 | Not found |
| 4 | Partial Run |
| 5 | Failed Run |
| 130 | Detached |

Unexpected infrastructure failures can exit 1. Ctrl-C detaches and prints a `librarium:show` recovery command. Accepted tasks may continue and bill; process interruption does not authorize submitting a new paid Run. See [recovery](/docs/php/request-and-retry).
