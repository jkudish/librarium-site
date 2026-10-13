---
title: Laravel library API
description: Select sources, queue research, refresh immutable Runs, and read evidence.
order: 6
---

```php
use Jkudish\LaravelAiLibrarium\Facades\Librarium;

$run = Librarium::research('Compare current memory architectures')
    ->deep()->only(['exa', 'openai'])->skip(['exa'])
    ->maxCost('1.00')->options(['openai' => ['effort' => 'high']])->run();

$run->id();
$run->status();
$run->result('openai');
$run->citations();
$run->evidence('openai');
$run->diagnostics();
$run->toArray();
```

`research()` takes a non-empty question. Quick is the default; `deep()` selects research-report variants. `only()` and `skip()` accept flat source, engine, or saved-group names. Unknown or explicitly unconfigured names fail; options are validated before storage or dispatch. There are no public profiles, selector modes, or fallback reserves.

`run()` waits up to the configured timeout and returns a `Run`, which may still be running. `dryRun()` returns a planned Run without storage or calls. `maxCost()` accepts a decimal USD string; it is not a provider-enforced billing ceiling.

## Queue and resume

```php
use Jkudish\LaravelAiLibrarium\Run;

$queued = Librarium::research('Produce a cited market landscape')
    ->deep()->only(['openai'])->queue()->onQueue('research')
    ->then(fn (Run $run) => storeSnapshot($run->toArray()));
$id = $queued->id();
$current = Librarium::find($id)?->refresh();
```

Your callback and `storeSnapshot` are application-owned. `queue()` stores a running Run first, dispatches one encrypted job, and returns its id. `refresh()` returns a new immutable snapshot after one observation of each pending durable task. It never submits queued work or replays a paid call. Transient retrieval failures remain recoverable.

## Shared Run JSON

`Run::toArray()` follows `librarium.run/1`: id, question, depth, status, timestamps, costs, per-source results, skips, and notices. Status is `planned`, `running`, `done`, `partial`, or `failed`. Results contain `source`, `observation`, answer, citations, costs, provenance, and safe errors. `Run::fromArray()` validates the same schema and preserves JS summary Runs' `summary_of`; PHP does not synthesize them.

Reported USD is a decimal string or `null`. Evidence contains redacted exchanges separately from public JSON. Treat answers and URLs as untrusted; your app owns authentication, tenant access, evidence policy, retention, and UI.

## RunStore

The package supplies local filesystem, opt-in database, supported cache, and memory stores. Custom stores implement `find`, version-conditional `save`, newest-first `list`, and idempotent `delete`. Register with `Librarium::extendStore()` or a container-resolved class name. See [storage configuration](/docs/php/configuration).
