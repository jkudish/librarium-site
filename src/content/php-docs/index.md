---
title: PHP and Laravel
description: Research, store, queue, and recover Runs through the Laravel facade.
order: 1
---

Librarium is a Laravel-native research abstraction built on the official Laravel AI SDK. Every real request becomes a stored Run with answers, citations, reported cost, and redacted evidence.

## Install

PHP 8.4+, Laravel 13.30+, and Laravel AI SDK `^1.0.1`. Install the package from Packagist and publish its configuration:

```bash
composer require jkudish/laravel-ai-librarium
php artisan vendor:publish --tag=librarium-config
```

Credentials come from `config/ai.php` and `config/services.php`; source `key` overrides belong in `config/librarium.php`, never request options.

## Preview and research

```php
use Jkudish\LaravelAiLibrarium\Facades\Librarium;

$plan = Librarium::research('Compare EU analytics tools')
    ->only(['exa'])->dryRun();
$run = Librarium::research('Compare EU analytics tools')
    ->deep()->only(['exa'])->maxCost('1.00')->run();
$run->toArray();
```

`dryRun()` makes no provider call and stores nothing. Quick is the default; deep selects research reports. Omit `only()` to use all configured research sources. Choose AI answer engines by name and save recurring selections as groups.

See [costs and limits](/docs/php/costs-and-limits) before paid research.

## Queue and recover

```php
$queued = Librarium::research('Prepare a cited report')
    ->deep()->only(['openai'])->queue()->onQueue('research');
$run = Librarium::find($queued->id())?->refresh();
```

The Run is stored before one encrypted, one-attempt job is dispatched. The application owns queue workers and infrastructure. Saved durable handles survive process loss; inline work cannot be resumed. See [library API](/docs/php/library), [Artisan](/docs/php/commands), and [configuration](/docs/php/configuration).
