---
title: Depth, sources, and groups
description: Choose quick or deep research, select AI answer engines by name, and save source lists.
order: 5
---

```php
Librarium::research($question)->only(['exa', 'claude']);
Librarium::research($question)->deep()->only(['exa', 'openai']);
Librarium::research($question)->only(['chatgpt', 'copilot']);
```

Quick is the default; deep selects research reports. Sources without a deep variant are skipped as `no_deep_variant`. Recovery support depends on the retrieval service: quick DataForSEO standard tasks and Firecrawl agent retrieval can also save recovery details.

Omit `only()` to use every configured research source, never engines. `skip()` removes names after expansion. Unknown and explicitly unconfigured names fail. Inspect `Librarium::sources()` or `librarium:sources` for language and variant availability.

## Saved groups

```php
// config/librarium.php
'groups' => ['editorial' => ['exa', 'claude']],
```

```php
$plan = Librarium::research($question)->only(['editorial'])->dryRun();
```

Groups are source lists you save and choose by name. Their names must be distinct from sources and AI answer engines.

## Cost and execution

Use `maxCost('1.00')` to limit which sources start; see [costs and limits](/docs/php/costs-and-limits) for the exact rules and billing caveats.

`run()` waits in the calling process; `queue()` dispatches one encrypted job. PHP's runtime owns sequential driver execution, not the JS concurrency implementation. Both expose the same semantic Run shape, not interchangeable private runtimes.

AI answer-engine observations are `surface`, while research answers are `api`. Engines retrieved through the same service are correlated, not independent proof. Choose research sources by name to add an API comparison.
