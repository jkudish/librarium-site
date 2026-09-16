---
title: Library API and responses
description: Use the Laravel facade and consume the typed response contract.
order: 6
---

Start a request through the first-party Laravel facade:

```php
use Jkudish\LaravelAiLibrarium\Facades\Librarium;

$pending = Librarium::query('Compare current agent memory architectures.')
    ->using('gemini-grounded')
    ->fallbacks(['openrouter-grounded'])
    ->timeout(600);

$preview = $pending->preview();
$response = $pending->run();
```

`query()` requires a non-empty string and allocates a request ULID.
`PendingResearch` supports `using()`, `group()`, `fanOut()`, `matching()`,
`fallbacks()`, `timeout()`, `maxCost()`, `preview()`, `run()`, and `queue()`.
See [Groups and modes](/docs/php/groups-and-modes) for selector rules.

To require a hard cost ceiling, add `maxCost('0.25', 'USD')`. This rejects the
plan unless every reachable quote is complete, current, conservative, and in
the requested currency. Token estimates alone do not establish that bound;
inspect the preview before choosing a budget policy. `run()` can incur charges.

`preview()` is non-dispatching. `run()` executes synchronously and returns
`Jkudish\LaravelAiLibrarium\Responses\ResearchResponse`. `queue()` returns a
`QueuedResearchResponse` with a `requestId` and Laravel dispatch methods:

```php
$queued = Librarium::query($query)
    ->group('deep')
    ->queue()
    ->onQueue('research')
    ->then(fn ($response) => storeResponse($response->toArray()))
    ->catch(fn ($exception) => report($exception));
```

## Response contract

`ResearchResponse::toArray()` contains:

| Field | Meaning |
| --- | --- |
| `generator`, `generator_version` | producing package identity |
| `request_id` | request ULID or preserved wire ID |
| `status` | `succeeded`, `partial`, or `failed` |
| `completed_at` | UTC timestamp |
| `results` | normalized successful Profile results |
| `errors` | safe `{code, message, profile?}` failures |
| `usage` | optional aggregate usage |

Each result includes `id`, `content_format`, `content`, `requested_profile`,
the effective `provider`, executed `profile`, `provenance`, `citations`, and
`completed_at`. Optional fields are `model`, `fallback_reason`, `usage`, and
allowlisted `provider_meta`. Content formats are `markdown`, `text`, or `json`.

Built-in Profiles require the reported provider to match the configured provider;
an unexpected mismatch fails rather than silently relabeling the result. A custom
Profile can explicitly permit routing with top-level `allow_provider_routing: true`.
Only then can a different effective provider be retained. Requested/executed
Profile attribution and the provider-reported model remain intact. This option
does not add routing itself; the Driver or SDK must implement it.

Provenance records result kind, retrieval methods, corpora, observation time,
and, where applicable, observation mode, collector, surface, and bounded
context. A citation records its derivation and a source with a URL or provider
reference. Treat absent fields as unknown rather than inferring them.

Usage may contain prompt, completion, cache-write, cache-read, and reasoning
token counts plus `actual_cost`, `estimated_cost`, and `currency`. Costs are
decimal strings; a currency is required when a cost is present. Result-level
usage can be more informative than aggregate usage, which may be absent.

`ResearchResponse::fromArray()` reconstructs and validates the same contract.
Unknown fields and inconsistent status/result/error combinations are rejected.

## Persistence ownership

Librarium ships no migrations, package-owned result tables, or research-history
repository. Queue status is transient. Store `toArray()` in application-owned
storage and define retention, authorization, redaction, and indexing there.
