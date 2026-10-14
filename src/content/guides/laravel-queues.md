---
title: Queue and recover research in Laravel
description: Store a Run before dispatch, observe it by Run ID, and recover in-progress research without duplicate submissions.
order: 3
---

Queued research can outlive an HTTP response. Librarium stores a Run before dispatching one encrypted Laravel job. Applications own queue workers, authorization, retention, and domain records.

Follow [installation](/docs/php#install), configure Exa, and choose a durable [supported store](/docs/php/configuration). Process-local memory and ArrayStore cannot share Runs with a separate worker. Run a worker for the configured queue; the default queue is `research`.

## Preview before dispatch

```php
use Jkudish\LaravelAiLibrarium\Facades\Librarium;

$question = 'Compare PostgreSQL connection-pooling options for Laravel workers.';
$plan = Librarium::research($question)
    ->deep()->only(['exa'])->maxCost('0.50')->dryRun();
```

Dry-run is offline and stores nothing. Inspect estimates, selected sources, skips, and notices. See [costs and limits](/docs/php/costs-and-limits) before dispatching; keep your cap when reviewing an empty preview.

## Queue the research

```php
$queued = Librarium::research($question)
    ->deep()->only(['exa'])->maxCost('0.50')
    ->queue()->onQueue('research');

$id = $queued->id();
// In a later authorized request:
$run = Librarium::find($id)?->refresh();
$payload = $run?->toArray();
```

Authorize access to the Run ID in your application before reading it. `refresh()` checks in-progress research rather than submitting it again. A Run can be `running`, `done`, `partial`, or `failed`; persist only the domain facts your application needs, keeping failures, citations, and uncertainty visible. The optional query-builder database store is package storage, not an application evidence model.

## Recover without duplicate spend

The encrypted job has one attempt. If a worker stops, inspect the stored Run and its errors before starting another job: a provider may already be doing paid research. Use `refresh()` to check existing research instead of submitting a duplicate request.

Research that runs entirely in the calling process depends on that process staying alive. Recovery requires valid saved state and signing keys; keep those keys stable and private. If a local writer crashes, remove its ownership marker only after confirming that the writer cannot resume. The marker's age alone is not enough.

## Test without provider calls

```php
config()->set('librarium.sources.exa.key', 'testing-only');
$fake = Librarium::fake()->preventStrayQueries();

Librarium::research('Produce a report')->deep()->only(['exa'])->queue();
$fake->assertQueued('Produce a report');
$fake->assertNeverQueried();
```

Queued fake requests record the request without dispatching jobs. Fake assertion closures receive request arrays. For queue infrastructure tests use Laravel's queue fake and disposable stores. See [testing](/docs/php/testing) and [recovery reference](/docs/php/request-and-retry).
