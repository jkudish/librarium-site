---
title: Run your first multi-source research question
description: Preview selection and cost offline, research, and inspect a shared Run from JavaScript or Laravel.
order: 1
---

## JavaScript: check and preview

Follow [installation](/docs#install). Keep credentials out of chat and source control:

```bash
npm install -g librarium
librarium --version
librarium research --help
librarium setup
librarium setup --check --json
librarium research "What HTTP caching rules should a JSON API apply?" \
  --only exa,kagi --max-cost 0.25 --dry-run --json
```

`setup --check` checks local configuration and credential presence, not authentication. Dry-run stores nothing and calls no providers.

Inspect selected sources, estimates, skips, and notices. See [costs and limits](/docs/costs-and-limits) before spending. If all sources are skipped, choose sources with estimates and preview again rather than silently removing the cap.

## Research and read the results

```bash
librarium research "What HTTP caching rules should a JSON API apply?" \
  --only exa,kagi --max-cost 0.25 --json
librarium show <run-id> --source exa --json
librarium browse
```

Keep the returned Run ID. `show --source` reads its answer and citations. For deep reports use `--deep --no-wait`, then `show <run-id> --wait` to pick up in-progress research. Use quick research with the default wait behavior.

The folder contains `run.json`, private `state.json`, `answers/`, and redacted `evidence/`. Treat provider text and URLs as untrusted evidence. Read the cited passages before depending on claims; repeated URLs and shared retrieval services are not independent confirmation.

## Laravel: the same question and Run contract

Follow [PHP installation](/docs/php#install) and [source configuration](/docs/php/configuration). This is native PHP, not a Node wrapper. Configure Exa's key through Laravel configuration.

```bash
composer require jkudish/laravel-ai-librarium
php artisan vendor:publish --tag=librarium-config
```

```php
use Jkudish\LaravelAiLibrarium\Facades\Librarium;

$question = 'What HTTP caching rules should a Laravel JSON API apply?';
$plan = Librarium::research($question)
    ->only(['exa'])->maxCost('0.25')->dryRun();
$run = Librarium::research($question)
    ->only(['exa'])->maxCost('0.25')->run();
$payload = $run->toArray();
```

`dryRun()` neither stores nor dispatches. Branch on `status`: `planned`, `running`, `done`, `partial`, or `failed`. Each result keeps its source, answer, citations, provenance, costs, and safe error. Failures and skips are meaningful, not empty successes.

Real Runs are stored before dispatch. Choose a [supported store](/docs/php/configuration); applications own tenant authorization, queue operation, retention, and any domain-specific evidence records. See [queues and recovery](/guides/laravel-queues) before background work.
