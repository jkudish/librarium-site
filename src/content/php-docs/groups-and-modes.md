---
title: Depth, sources, and groups
description: Select flat source names and named-only engines without modes or fallbacks.
order: 5
---

```php
Librarium::research($question)->only(['exa', 'claude']);
Librarium::research($question)->deep()->only(['exa', 'openai']);
Librarium::research($question)->only(['chatgpt', 'copilot']);
```

Quick is the default; deep selects durable research variants. Sources without a deep variant are skipped as `no_deep_variant`. Durability belongs to the driver/collector: quick DataForSEO standard tasks and Firecrawl agent collection can also save signed handles.

Omit `only()` to use every configured research source, never engines. `skip()` removes names after expansion. Unknown and explicitly unconfigured names fail. Inspect `Librarium::sources()` or `librarium:sources` for language and variant availability.

## Saved groups

```php
// config/librarium.php
'groups' => ['editorial' => ['exa', 'claude']],
```

```php
$plan = Librarium::research($question)->only(['editorial'])->dryRun();
```

Groups are user source lists without a `custom:` prefix; no built-in groups remain. Group names cannot collide with sources or engines. There are no public modes, selectors, or fallback reserves.

## Cost and execution

With `maxCost('1.00')`, unpriced sources are skipped and remaining estimates are admitted greedily in catalog order. Runtime spend plus reservations stops unstarted work. In-flight work can exceed the cap; failed calls can bill. No failed source is automatically replaced.

`run()` waits in the calling process; `queue()` dispatches one encrypted job. PHP's runtime owns sequential driver execution, not the JS concurrency implementation. Both expose the same semantic Run shape, not interchangeable private runtimes.

Engine observations are `surface`, while research answers are `api`. Shared collectors make observations correlated, not independent proof. API baselines join only when the caller names them.
