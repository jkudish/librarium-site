---
title: Testing Laravel integration
description: Use the facade fake, normal source validation, and disposable RunStore contracts.
order: 9
---

`Librarium::fake()` replaces execution while keeping normal request planning and source validation. It records synchronous and queued requests without provider calls.

```php
use Jkudish\LaravelAiLibrarium\Facades\Librarium;

it('researches the selected source', function () {
    config()->set('librarium.sources.exa.key', 'testing-only');
    $fake = Librarium::fake();
    $run = Librarium::research('Compare SQLite and PostgreSQL')
        ->only(['exa'])->run();
    expect($run->status())->toBe('done');
    $fake->assertQueried('Compare SQLite and PostgreSQL');
});
```

The default synthetic answer tests application flow, not provider quality. Supply scripted `Run` instances and `preventStrayQueries()` when every synchronous request must be accounted for. Closures in `assertQueried` and `assertQueued` receive request arrays.

```php
$fake = Librarium::fake()->preventStrayQueries();
Librarium::research('Produce a report')->deep()->only(['exa'])->queue();
$fake->assertQueued('Produce a report');
$fake->assertNeverQueried();
```

Keep source configuration valid and use dummy credentials. Queued fake requests do not dispatch Laravel jobs. For real driver boundaries use Laravel HTTP/SDK fakes and prevent stray requests.

Custom stores run `Testing\RunStoreContractTests` in a fresh disposable namespace: create/update/conflict, not-found, newest-first paging, delete, and files/state round-trip. Add backend-specific concurrency, expiry, and failure tests. Ordinary tests remain offline.
