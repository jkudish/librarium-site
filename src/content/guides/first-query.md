---
title: Run your first multi-source research question
description: Preview selection and cost offline, research, and inspect a shared Run from JavaScript or Laravel.
order: 1
---

## CLI: check and preview

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

Check the preview's selection, estimates, skips, and notices; credential presence is not authentication. If everything is skipped, choose priced sources and preview again—keep the cap ([budget rules](/docs/costs-and-limits)).

## Research and read the results

```bash
librarium research "What HTTP caching rules should a JSON API apply?" \
  --only exa,kagi --max-cost 0.25 --json
librarium show <run-id> --source exa --json
librarium browse
```

Keep the Run ID and read each source's answer and citations. For deep work, use `--deep --no-wait` and recover with `show <run-id> --wait` ([stored files](/docs/output-formats), [evidence checks](/docs/using-with-agents#read-evidence-not-just-the-index)).

## JavaScript: preview and read a Run

The [Node client](/docs/library) uses your configured sources. Dry-run stores nothing and calls no providers.

```ts
import { createLibrarium } from 'librarium';

const client = createLibrarium();
const question = 'Compare HTTP caching rules';
const selection = { only: ['exa'], maxCost: '0.25' };
const plan = await client.research(question, {
  ...selection, dryRun: true,
});
const run = await client.research(question, selection);
```

## Coding agent: the same workflow over MCP

[Connect your agent](/guides/agent-research), then ask it to preview before spending and inspect cited passages. Repeated URLs and shared retrieval services are not independent confirmation.

| Step | Tool |
| --- | --- |
| Discover configured sources | `list_sources` |
| Preview offline | `research` with `dry_run: true` |
| Research after spending approval | `research` |
| Resume and read complete source evidence | `get_run` with the Run ID |

## Laravel: the same question and Run contract

Follow [PHP installation](/docs/php#install) and configure Exa through [Laravel config](/docs/php/configuration). This is native PHP, not a Node wrapper.

```bash
composer require jkudish/laravel-ai-librarium
php artisan vendor:publish --tag=librarium-config
```

```php
use Jkudish\LaravelAiLibrarium\Facades\Librarium;

$question = 'Compare HTTP caching rules';
$plan = Librarium::research($question)
    ->only(['exa'])->maxCost('0.25')
    ->dryRun();
$run = Librarium::research($question)
    ->only(['exa'])->maxCost('0.25')
    ->run();
$payload = $run->toArray();
```

Keep failures and skips visible when reading [Run status and evidence](/docs/php/library#shared-run-json). Before background work, choose a [supported store](/docs/php/configuration) and read [queues and recovery](/guides/laravel-queues); your application owns authorization, retention, and domain records.
