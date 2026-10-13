---
title: PHP and Laravel
description: Research, store, queue, and recover Runs through the Laravel facade.
order: 1
---

Librarium is a Laravel-native research abstraction built on the official Laravel AI SDK. Every real request becomes a stored Run with answers, citations, honest reported cost, and redacted evidence.

## Install

PHP 8.4+, Laravel 13.30+, and Laravel AI SDK `^1.0.1`. The package pins `jkudish/librarium-spec`; consumers must copy its Composer package repository declaration because Composer does not inherit repositories.

Merge this entry into your application's `composer.json` `repositories` array, preserving existing entries:

```json
{
  "type": "package",
  "package": {
    "name": "jkudish/librarium-spec",
    "version": "dev-spec-15c8a306",
    "type": "library",
    "license": "MIT",
    "source": {
      "type": "git",
      "url": "https://github.com/jkudish/librarium-spec.git",
      "reference": "15c8a30673b43b006944623be2ddf99f216b846c"
    },
    "dist": {
      "type": "zip",
      "url": "https://api.github.com/repos/jkudish/librarium-spec/zipball/15c8a30673b43b006944623be2ddf99f216b846c",
      "reference": "15c8a30673b43b006944623be2ddf99f216b846c"
    }
  }
}
```

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

`dryRun()` makes no provider call and stores nothing. Quick is the default; deep selects durable research variants. Omit `only()` to use all configured research sources, never engines. Groups are user-saved source lists without built-ins.

`maxCost()` admits bounded estimates greedily in catalog order; unpriced and over-budget sources are skipped. In-flight work can exceed the cap. Unknown reported cost is `null`, not zero.

## Queue and recover

```php
$queued = Librarium::research('Prepare a cited report')
    ->deep()->only(['openai'])->queue()->onQueue('research');
$run = Librarium::find($queued->id())?->refresh();
```

The Run is stored before one encrypted, one-attempt job is dispatched. The application owns queue workers and infrastructure. Saved durable handles survive process loss; inline work cannot be resumed. See [library API](/docs/php/library), [Artisan](/docs/php/commands), and [configuration](/docs/php/configuration).
