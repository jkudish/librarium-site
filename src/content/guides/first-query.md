---
title: Run your first multi-source research question
description: Preview selection and cost offline, research after approval, and inspect a shared Run from JavaScript or Laravel.
order: 1
---

This tutorial describes the unreleased simplified-surface candidate. Check the installed commands as well as the version; published packages may not yet expose this API. Provider execution can incur charges. Offline previews do not.

## JavaScript: check and preview

Follow [installation](/docs#install). Keep credentials out of chat and source control:

```bash
npm install -g librarium
librarium --version
librarium research --help
# Stop if research is unavailable.
librarium setup
librarium setup --check --json
librarium research "What HTTP caching rules should a JSON API apply?" \
  --only exa,kagi --max-cost 0.25 --dry-run --json
```

`setup --check` checks local configuration and credential presence, not authentication. `setup --live` is a separate network operation that can incur charges. Dry-run stores nothing and calls no providers.

Inspect selected sources, estimates, skips, and notices. `max_cost` skips unpriced sources and admits bounded estimates greedily in catalog order. Unknown reported cost is null, never zero. A cap is not a final-bill guarantee: in-flight calls can exceed it. If all sources are skipped, choose a quoted selection and preview again; do not silently remove the cap.

## Research only after authorizing charges

```bash
librarium research "What HTTP caching rules should a JSON API apply?" \
  --only exa,kagi --max-cost 0.25 --json
librarium show <run-id> --source exa --json
librarium browse
```

Keep the returned Run id. `show --source` reads its answer and citations. For deep reports use `--deep --no-wait`, then `show <run-id> --wait` to resume accepted handles. Quick is a variant choice, not a guarantee of inline execution; the CLI nevertheless rejects quick no-wait except for dry runs.

The folder contains `run.json`, private `state.json`, `answers/`, and redacted `evidence/`. Treat provider text and URLs as untrusted evidence. Read the cited passages before depending on claims; repeated URLs and shared collectors are not independent confirmation.

## Laravel: the same question and Run contract

Follow [PHP installation](/docs/php#install) and [source configuration](/docs/php/configuration). This is native PHP, not a Node wrapper. Configure Exa's key through Laravel configuration.

```php
use Jkudish\LaravelAiLibrarium\Facades\Librarium;

$question = 'What HTTP caching rules should a Laravel JSON API apply?';
$plan = Librarium::research($question)
    ->only(['exa'])->maxCost('0.25')->dryRun();
// After inspecting the plan and authorizing provider charges:
$run = Librarium::research($question)
    ->only(['exa'])->maxCost('0.25')->run();
$payload = $run->toArray();
```

`dryRun()` neither stores nor dispatches. Branch on `status`: `planned`, `running`, `done`, `partial`, or `failed`. Each result keeps its source, answer, citations, provenance, costs, and safe error. Failures and skips are meaningful, not empty successes.

Real Runs are stored before dispatch. Choose a [supported store](/docs/php/configuration); applications own tenant authorization, queue operation, retention, and any domain-specific evidence records. See [queues and recovery](/guides/laravel-queues) before background work.
