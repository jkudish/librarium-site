---
title: Testing
description: Test Laravel research behavior without provider or network calls.
order: 9
---

`Librarium::fake()` replaces the research executor while retaining normal
query compilation and Profile validation. It records synchronous and queued
plans and makes no provider call.

## Test an application service

```php
use Jkudish\LaravelAiLibrarium\Facades\Librarium;
use Jkudish\LaravelAiLibrarium\ResearchPlan;

it('researches the requested topic with the selected profile', function () {
    config()->set('librarium.profiles.exa.credential', 'testing-only');
    $fake = Librarium::fake();

    $response = Librarium::query(
        'Compare SQLite and PostgreSQL for a Laravel application.',
    )->using('exa')->run();

    expect($response->status->value)->toBe('succeeded');

    $fake->assertQueried(function (ResearchPlan $plan): bool {
        return $plan->preview->input ===
                'Compare SQLite and PostgreSQL for a Laravel application.'
            && $plan->preview->profiles->pluck('id')->all() === ['exa'];
    });
});
```

With no supplied response, the fake returns a valid synthetic successful
`ResearchResponse` for the first selected Profile. Its Markdown identifies the
query as fake and its provenance follows the compiled Profile. Do not use that
content to test provider quality or citation behavior.

`preventStrayQueries()` changes missing scripted responses from synthetic
success to a `RuntimeException`. Use it when every synchronous call must be
explicitly accounted for. It does not reject queued queries; assert those
separately.

## Queue assertions

Keep the selected Profile valid even with a fake executor. Synthetic credentials
are sufficient in these tests; no real keys or network calls are needed.

```php
it('queues deep research', function () {
    config()->set('librarium.profiles.perplexity-sonar-deep.credential', 'testing-only');
    $fake = Librarium::fake()->preventStrayQueries();

    Librarium::query('Produce a market landscape.')
        ->using('perplexity-sonar-deep')
        ->queue();

    $fake->assertQueued('Produce a market landscape.');
    $fake->assertNeverQueried();
});
```

Queued fake calls return a `QueuedResearchResponse` backed by a fake pending
dispatch; no Laravel job is dispatched. Available assertions are
`assertQueried`, `assertNotQueried`, `assertNeverQueried`, `assertQueued`,
`assertNotQueued`, and `assertNeverQueued`. String arguments match the exact
query; closures receive the compiled `ResearchPlan`. `queries()` and
`queuedQueries()` return collections for more detailed assertions.

## Script exact responses

Pass `ResearchResponse` instances in consumption order when application logic
must handle partial, failed, cited, or cost-bearing responses:

```php
config()->set('librarium.profiles.gemini-grounded.credential', 'testing-only');
$fake = Librarium::fake([$partialResponse])->preventStrayQueries();

$actual = Librarium::query('Investigate an incident.')
    ->using('gemini-grounded')
    ->run();

expect($actual)->toBe($partialResponse);
```

Construct fixtures with the package response value objects or load a known
array with `ResearchResponse::fromArray()`. Keep ordinary tests offline. Driver
integration tests should additionally use Laravel HTTP or Laravel AI SDK fakes
and prevent stray requests; live paid canaries require separate authorization.
