---
title: Queue and recover research in Laravel
description: Store a Run before dispatch, observe it by Run ID, and recover in-progress research without duplicate submissions.
order: 3
---

## Prepare shared storage

Follow [installation](/docs/php#install), configure Exa, and choose a durable [supported store](/docs/php/configuration). Your application owns workers, authorization, retention, and domain records.

| Before dispatch | Requirement |
| --- | --- |
| Store | Shared durable storage, not memory or ArrayStore |
| Worker | Process the configured queue; default `research` |
| Other runtimes | [MCP](/docs/using-with-agents) or [JavaScript](/docs/library) can resume stored deep research, not Laravel jobs |

## Preview before dispatch

```php
use Jkudish\LaravelAiLibrarium\Facades\Librarium;

$question = 'Compare PostgreSQL pooling for workers';
$plan = Librarium::research($question)
    ->deep()->only(['exa'])->maxCost('0.50')
    ->dryRun();
```

Dry-run is offline and stores nothing; inspect estimates, selected sources, skips, and notices. Keep your cap when reviewing an empty preview ([budget rules](/docs/php/costs-and-limits)).

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

Authorize the Run ID before reading it; `refresh()` observes existing work, not a new submission. Persist only needed domain facts and keep [status, failures, citations, and uncertainty](/docs/php/library#shared-run-json) visible; package storage is not your evidence model.

## Recover without duplicate spend

The encrypted job has one attempt; worker loss can leave paid upstream work running. Inspect the stored Run and use `refresh()` before considering another submission ([recovery reference](/docs/php/request-and-retry)).

| Failure | Recovery boundary |
| --- | --- |
| Calling process stops | Inline work depends on that process staying alive |
| Saved state or signing key lost | Recovery needs valid state and stable private keys |
| Local writer crashes | Remove its marker only after proving it cannot resume; age is not enough |

## Test without provider calls

```php
config()->set('librarium.sources.exa.key', 'testing-only');
$fake = Librarium::fake()->preventStrayQueries();

Librarium::research('Produce a report')
    ->deep()->only(['exa'])->queue();
$fake->assertQueued('Produce a report');
$fake->assertNeverQueried();
```

Queued fakes record requests without dispatching jobs; assertion closures receive request arrays. Use Laravel's queue fake and disposable stores for infrastructure tests ([testing reference](/docs/php/testing)).
