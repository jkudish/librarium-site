---
title: PHP and Laravel
description: Get started with Librarium's first-party Laravel research API.
order: 1
---

Librarium for PHP is a Laravel-native research package. It provides Profiles,
cost previews, synchronous and queued execution, normalized responses, Artisan
commands, and a test fake through `jkudish/laravel-ai-librarium`.

Profiles are flat IDs. Most ship enabled but stay credential- and
configuration-gated; the DataForSEO Profiles ship disabled for explicit opt-in.

## Requirements

PHP 8.4 or newer, Laravel 13, and Laravel AI SDK `^1.0.1`.

## Install

```bash
composer require jkudish/laravel-ai-librarium
```

Laravel package discovery registers the service provider. Import the facade
shown below when using the library API. Publish
the configuration when your application needs to alter Profiles, groups,
timeouts, queue settings, or pricing freshness:

```bash
php artisan vendor:publish --tag=librarium-config
```

Add the credential required by the Profile you plan to use. Laravel AI Profiles
read Laravel AI configuration; most focused HTTP Profiles read
`config/services.php`, while DataForSEO reads provider login/password values
from the published `config/librarium.php`.
See [Configuration](/docs/php/configuration).

## Preview before dispatch

The minimum safe operator path is an offline preview. It compiles the effective
Profile and pricing information but does not call a research provider:

```bash
php artisan librarium:query 'Compare current agent memory architectures.' \
  --agent --profile=gemini-grounded
```

Inspect the JSON, especially `profiles`, `fallbacks`, `timeout`, and `pricing`.
Unknown cost is not zero. To dispatch synchronously, repeat the command with an
explicit action:

```bash
php artisan librarium:query 'Compare current agent memory architectures.' \
  --agent --profile=gemini-grounded --run
```

This can make a paid provider call. A successful run writes a
`ResearchResponse::toArray()` value. Use `--queue` instead of `--run` to submit
one encrypted Laravel job; your application must run and monitor its queue.

## Minimum library call

```php
use Jkudish\LaravelAiLibrarium\Facades\Librarium;

$preview = Librarium::query('Compare current agent memory architectures.')
    ->using('gemini-grounded')
    ->preview();

$response = Librarium::query('Compare current agent memory architectures.')
    ->using('gemini-grounded')
    ->run();
```

`run()` returns a typed `ResearchResponse`. Librarium does not create research
history tables: persist the response in your own application if you need durable
history. Continue with [the library API](/docs/php/library), or use
[Artisan commands](/docs/php/commands) for operator and automation workflows.
