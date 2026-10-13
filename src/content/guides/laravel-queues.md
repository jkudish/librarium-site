---
title: Queue and recover research in Laravel
description: Store a Run before dispatch, observe it by id, and recover accepted work without blindly repeating provider charges.
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

Dry-run is offline and stores nothing. Inspect estimates, selected sources, skips, and notices. Unpriced sources are skipped under a cap; unknown reported USD remains null. In-flight work can exceed the admission cap. Do not remove it just to obtain a nonempty plan.

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

Authorize access to the id in your application before reading it. `refresh()` observes saved durable handles rather than submitting new research. A Run can be `running`, `done`, `partial`, or `failed`; persist only the domain facts your application needs, keeping failures, citations, and uncertainty visible. The optional query-builder database store is package storage, not an application evidence model.

## Recover without duplicate spend

The encrypted job has one attempt; do not blindly release or redispatch after worker loss. A provider may have accepted paid work before the worker died. Inspect the stored Run, safe errors, and accepted handle, then refresh recoverable work. Ambiguous acceptance is not permission to resubmit.

Inline work cannot be recovered like a durable handle. Missing or invalid signing state must fail before provider I/O. Keep signing keys stable and private. A crashed local writer's nonexpiring ownership marker requires explicit cleanup after confirming that no writer remains; age alone is not evidence that it is safe to take over.

## Test without provider calls

```php
config()->set('librarium.sources.exa.key', 'testing-only');
$fake = Librarium::fake()->preventStrayQueries();

Librarium::research('Produce a report')->deep()->only(['exa'])->queue();
$fake->assertQueued('Produce a report');
$fake->assertNeverQueried();
```

Queued fake requests record the request without dispatching jobs. Fake assertion closures receive request arrays, not the retired ResearchPlan. For queue infrastructure tests use Laravel's queue fake and disposable stores. See [testing](/docs/php/testing) and [recovery reference](/docs/php/request-and-retry).
