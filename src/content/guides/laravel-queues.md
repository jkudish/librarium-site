---
title: Queue research in Laravel
description: Dispatch research safely, persist terminal responses, handle failures, and test the workflow without paid calls.
order: 3
---

Queued research fits requests that may outlive an HTTP response. Librarium compiles the same plan as `run()`, dispatches one encrypted Laravel job, and returns a request ID immediately. Your application owns queue operation and durable result storage.

[Install the package](/docs/php#install), configure the selected Profiles, and run a worker for the configured connection and queue. The queue defaults to `research`; its job timeout defaults to 7,200 seconds, while the research deadline defaults to 6,900 seconds.

## Preview before dispatch

Preview is offline and does not call a research provider:

```php
use Jkudish\LaravelAiLibrarium\Facades\Librarium;

$preview = Librarium::query(
    'Compare current PostgreSQL connection-pooling options for Laravel workers.',
)->using('perplexity-sonar-deep')
    ->timeout(900)
    ->maxCost('0.50', 'USD')
    ->preview();
```

Inspect Profile selection, fallbacks, deadline, and pricing before approving dispatch. Unknown cost is not zero. `maxCost()` fails closed unless all reachable quotes establish a complete, current, conservative ceiling in one currency. If this Profile has no qualifying quote, stop here: choose a quoted Profile or agree a different spending policy before dispatch. The example below assumes the capped preview succeeded.

## Dispatch and persist the result

The following queue call can cause a paid provider request. Run it only after approval:

```php
use App\Actions\StoreResearchResponse;
use Throwable;

$queued = Librarium::query(
    'Compare current PostgreSQL connection-pooling options for Laravel workers.',
)->using('perplexity-sonar-deep')
    ->timeout(900)
    ->maxCost('0.50', 'USD')
    ->queue()
    ->onQueue('research')
    ->then(function ($response): void {
        app(StoreResearchResponse::class)->handle($response->toArray());
    })
    ->catch(function (Throwable $exception): void {
        report($exception);
    });

$requestId = $queued->requestId;
```

Create `App\Actions\StoreResearchResponse` in your application; it is not supplied by Librarium. Its `handle(array $payload)` method should store the terminal array in an application-owned table or object store, keyed by `request_id`. Define authorization, tenant ownership, retention, redaction, and indexing in that application layer. Librarium deliberately ships no result migration, Eloquent model, or research-history repository.

`Librarium::status($requestId)` exposes cache-backed `queued`, `running`, and terminal coordination state. Its default TTL is 10,800 seconds, so it is not durable history. Applications can also listen for `ResearchCompleted` and `ResearchFailed` events when event listeners are a better persistence boundary than per-dispatch callbacks.

## Handle failures without duplicate spend

The job has `tries = 1` and `failOnTimeout = true`; there is no automatic Laravel retry. Monitor workers and failed jobs, and alert on infrastructure failure separately from a terminal `ResearchResponse` whose status is `partial` or `failed`.

Do not blindly release or redispatch a failed job. A worker can die after a paid provider accepted work but before the terminal response was stored. First inspect application logs, transient status, provider dashboards, and any application-owned receipt. Reconcile possible spend, recover and persist a terminal result when possible, and submit a new request only when duplicate work and charges are acceptable.

## Test without network or paid calls

`Librarium::fake()` retains request compilation and Profile validation while replacing execution. Synthetic credentials keep the Profile selectable; they are not sent anywhere.

```php
use Jkudish\LaravelAiLibrarium\Facades\Librarium;
use Jkudish\LaravelAiLibrarium\ResearchPlan;

it('queues database research without contacting a provider', function () {
    config()->set(
        'librarium.profiles.perplexity-sonar-deep.credential',
        'testing-only',
    );

    $fake = Librarium::fake()->preventStrayQueries();

    Librarium::query(
        'Compare current PostgreSQL connection-pooling options for Laravel workers.',
    )->using('perplexity-sonar-deep')
        ->timeout(900)
        ->queue();

    $fake->assertQueued(function (ResearchPlan $plan): bool {
        return $plan->timeout === 900
            && $plan->preview->profiles->pluck('id')->all()
                === ['perplexity-sonar-deep'];
    });
    $fake->assertNeverQueried();
});
```

With the fake, queued calls record a plan but dispatch no Laravel job, invoke no callbacks, and make no provider request. Assert queued behavior separately: `preventStrayQueries()` rejects unscripted synchronous runs, not queued plans. Use a scripted `ResearchResponse` fixture when testing persistence of partial, failed, cited, or cost-bearing terminal data.

See [Requests, queues, and retries](/docs/php/request-and-retry) for recovery rules and [Testing](/docs/php/testing) for all fake assertions.
