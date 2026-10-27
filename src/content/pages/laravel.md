---
title: Research inside your Laravel app.
description: Bring multi-source research to your Laravel AI SDK agents.
kind: product
runtime: laravel
ctaHref: /docs/php
ctaLabel: Explore Laravel setup
---

*A meta harness for research queries*

Bring multi-source research to your Laravel AI SDK agents.

Requires PHP 8.4+, Laravel 13.30+, and Laravel AI SDK `^1.0.1`.

```bash
composer require jkudish/laravel-ai-librarium
php artisan vendor:publish --tag=librarium-config
```

```php
Librarium::research(
    'Lisbon or Porto without a car?',
)->only(['exa'])->dryRun();
```

```php
Librarium::research(
    'Lisbon or Porto without a car?',
)->only(['exa'])->run();
```

## Research with the facade

[Configure your source credentials](/docs/php/configuration), then collect a Run with answers and citations. Librarium is Laravel-native, built on the Laravel AI SDK.

```php
$evidence = Librarium::research(
    'Lisbon or Porto without a car?',
)->only(['exa'])->run();
```

## Keep every source

Read each source’s answer with its citations. [The Run reference](/docs/php/library) explains the shared format and safe rendering.

```php
$result = $evidence->result('exa');
$citations = $evidence->citations();
```

## Queue longer research

Queue deep research and check the saved Run without submitting again. [The queue guide](/guides/laravel-queues) covers callbacks and handing evidence to an agent.

```php
$queued = Librarium::research(
    'Lisbon or Porto without a car?',
)->deep()->only(['exa'])->queue();

$id = $queued->id();
$current = Librarium::find($id)
    ?->refresh();
```

## Give your agent the evidence

Let an AI SDK agent inspect a completed Run through a read-only tool. [The agent guide](/docs/php/using-with-agents#build-a-read-only-sdk-agent) has the full example.
