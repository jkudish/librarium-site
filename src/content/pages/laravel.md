---
title: Research inside your Laravel app.
description: Bring search, AI answers, and deep research into the Laravel AI SDK. Preview before spending, queue the long runs, keep every source.
kind: product
runtime: laravel
ctaHref: /docs/php
ctaLabel: Explore Laravel setup
---

*A meta harness for research queries*

Query search engines, AI answer engines, and deep-research APIs from one interface, and keep every answer with its citations.

## Laravel-native, not a wrapper

This is a first-party Laravel package built on the Laravel AI SDK, not a Node process in disguise. Collect research through the facade, hand it to your agents as a tool, and move long runs into encrypted queue jobs. Your app owns storage and workflows.

It complements the SDK: the SDK owns your agent and model interaction; Librarium supplies research results with their citations attached. Your application decides what that evidence supports.

Requires PHP 8.4+, Laravel 13.30+, and Laravel AI SDK `^1.0.1`. See [Install](/docs/php#install).

```bash
composer require jkudish/laravel-ai-librarium
php artisan vendor:publish --tag=librarium-config
```

Configure your source credentials, preview offline, then research when ready:

```php
use Jkudish\LaravelAiLibrarium\Facades\Librarium;

Librarium::research('Lisbon or Porto without a car?')->only(['exa'])->dryRun();
Librarium::research('Lisbon or Porto without a car?')->only(['exa'])->run();
```

## Research before your agent recommends

Preview your source selection:

```php
use Jkudish\LaravelAiLibrarium\Facades\Librarium;

$research = Librarium::research(
    'Compare PostgreSQL connection-pooling options for Laravel workers.',
)->only(['exa', 'gemini'])->maxCost('0.25');

$preview = $research->dryRun(); // No storage or provider call.

$evidence = $research->run();
```

`only()` selects source names; PHP executes them sequentially. Use `maxCost('0.25')` to limit which sources start; see [costs and limits](/docs/php/costs-and-limits) for selection rules and billing caveats.

## Every result keeps its sources

`run()` returns an immutable `Run`. Each result keeps its source, answer, citations, and provenance:

```php
$evidence->result('exa');
$evidence->citations();
$evidence->evidence('exa');
$evidence->status(); // planned, running, done, partial, or failed.
$evidence->toArray(); // librarium.run/1 shared JSON.
```

Provider content and URLs remain untrusted evidence. Escape content for its output context and verify important claims against their cited sources.

## Let an AI SDK agent inspect the evidence

Separate research from reasoning. Run an approved research request, then give an AI SDK agent a read-only tool over the completed Run. The [Laravel agent docs](/docs/php/using-with-agents#build-a-read-only-sdk-agent) include the complete `ResearchEvidence` tool and `TechnicalAdvisor` agent.

Now pass the `$evidence` response from the approved research step into the agent:

```php
use App\Ai\Agents\TechnicalAdvisor;

$answer = (new TechnicalAdvisor($evidence))->prompt(
    'Recommend a pooling approach for our workers and explain the tradeoffs.',
);
```

Configure the agent's model/provider through the SDK. Its model call has a separate budget from Librarium research. For large responses, expose authorized result and citation pages instead of returning everything to the model at once.

## Use the same pattern for different jobs

- **A technical advisor:** compare current platform documentation before proposing an architecture. Require the cited passage to support each material claim.
- **A product analyst:** inspect how AI answer engines describe a luxury rental service, keeping each engine and retrieval service with its observation. Our [Agentsy Report field note](/stories/agentsy-report) shows how an application stores this evidence.
- **An editorial agent:** collect source material first, then draft with citations and explicit gaps. Provider output is evidence to verify, not permission to publish its claims.

For on-demand research inside a tool, keep authorization and a fixed allowed source set in application code. Enforce request limits and a total spend policy across repeated tool calls; never let the model supply its own permission to spend. The read-only example above is a safer starting point.

## Queue longer research, then hand it to an agent

```php
use App\Actions\StoreResearchResponse; // Your class, not Librarium's.

$queued = Librarium::research(
    'Research current connection-pooling guidance for Laravel deployments.',
)->deep()->only(['exa'])
    ->queue()
    ->onQueue('research')
    ->then(function ($response): void {
        app(StoreResearchResponse::class)->handle($response->toArray());
    })
    ->catch(function (Throwable $exception): void {
        report($exception);
    });

$runId = $queued->id();
$current = Librarium::find($runId)?->refresh();
```

`queue()` stores the Run before dispatching one encrypted Laravel job with `tries = 1`. `find($runId)->refresh()` checks saved research without starting it again. Webhooks can prompt another check; polling retrieves completed reports.

Save the completed Run in your own storage, then pass it into an agent or a review screen. The [Laravel queue guide](/guides/laravel-queues) covers callbacks, status, failures, and testing without paid calls.

Choose local filesystem, opt-in query-builder database, supported cache, memory, or a custom RunStore that rejects stale writes. Your application chooses migrations, retention, tenant ownership, and the product experience.

## Configure it like any Laravel package

Start with quick research. Save groups for recurring selections and choose storage that works across your web and queue workers. See [configuration](/docs/php/configuration) for storage, queue settings, and deadlines.

SDK sources read `config/ai.php`; focused HTTP sources read `config/services.php`. Source `key` overrides belong in config, never request options. Keep credentials out of chat and source control.

Preview through Artisan too:

```bash
php artisan librarium:research \
  'Compare PostgreSQL connection-pooling options for Laravel workers.' \
  --only=exa --dry-run --json
```

Remove `--dry-run` to research or add `--no-wait` to queue. Your coding agent can read the structured JSON output. See [Artisan commands](/docs/php/commands).
