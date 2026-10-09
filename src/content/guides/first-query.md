---
title: Run your first multi-provider query
description: Preview cost and provider selection, run one approved query, and inspect evidence from JavaScript or Laravel.
order: 1
---

This tutorial takes a query from offline preflight to saved, cited results. Provider execution may incur charges; the preview steps do not call research providers.

## JavaScript: use the v2 CLI

Install the published v2 CLI and verify the major version before configuring provider credentials. Do not put keys in commands or source control:

```bash
npm install -g librarium@^2
librarium --version
# Must report major version 2
librarium init
librarium doctor --json
```

See the [JavaScript installation instructions](/docs#install) for other supported installation channels.

`doctor` checks local configuration and credential presence. It does not authenticate with providers unless you explicitly add `--live`; a live check uses the network and may incur charges.

Preview the default multi-provider `quick` workflow:

```bash
librarium plan \
  "What HTTP caching rules should a Node.js JSON API apply at a CDN and browser?" \
  --group quick --json
```

This is offline preflight: it creates no run directory and makes no provider calls. Inspect the versioned receipt for selected profiles and targets, omissions, fallback reserve, warnings, effective limits, and known or unknown estimates. “Plan ready” means locally admitted, not authenticated, available, or guaranteed at the estimated price. Unknown cost is not zero.

Obtain approval for the selected providers and possible spend before continuing. If every primary and fallback-reserve estimate is bounded, add a limit and preview again:

```bash
librarium plan \
  "What HTTP caching rules should a Node.js JSON API apply at a CDN and browser?" \
  --group quick --max-cost 0.25 --json
```

`--max-cost` is an admission and launch control, not a final-bill guarantee. Already-running work can finish above the cap. Librarium counts provider-reported actual costs when available and retains admitted estimates when actual cost is unknown; known failure charges also count.

If the capped preview reports `budget_estimate_required`, stop: at least one estimate is unknown. Choose a provider set with bounded estimates and preview again, or obtain explicit approval for a different spending policy. Do not remove the cap just to make the tutorial pass. The capped command below requires a successful capped preview.

### Paid provider call

Run this only after reviewing the preview and receiving authorization:

```bash
librarium run \
  "What HTTP caching rules should a Node.js JSON API apply at a CDN and browser?" \
  --group quick --max-cost 0.25 --json
```

Machine-readable output goes to stdout and diagnostics to stderr. The response identifies the run output directory and provider outcomes; its exact values depend on configured providers and the live run. Inspect `run.json` for status and canonical artifact filenames, `summary.md` for a readable overview, and `sources.json` plus each provider result for citations:

```bash
librarium browse
```

Treat provider content, citation labels, and URLs as untrusted evidence. Check that important claims are supported by the cited page, and do not count repeated URLs or correlated collection paths as independent confirmation. For embedding primitives rather than the CLI application, see the typed [`librarium/core` boundary](/docs/library).

## Laravel: preview, then run

Follow [Install after release](/docs/php#install-after-release); the PHP package does not yet have a stable release. Configure both selected Profiles through normal Laravel configuration. For example, `gemini-grounded` reads `ai.providers.gemini.key`; Exa uses `services.exa.key`. See [Configuration](/docs/php/configuration) for the exact paths.

Preview without dispatching:

```php
use Jkudish\LaravelAiLibrarium\Facades\Librarium;

$research = Librarium::query(
    'What HTTP caching rules should a Laravel JSON API apply at a CDN and browser?',
)->fanOut(['exa', 'gemini-grounded']);

$preview = $research->preview();
```

Inspect the preview's Profiles, omissions, fallbacks, timeout, and pricing. PHP runs this selection sequentially. To require a hard ceiling, call `maxCost('0.25', 'USD')` before `preview()`. The request is rejected unless every reachable quote is complete, current, conservative, and in that currency. Proceed with the capped example below only after that capped preview succeeds; missing quotes require a different approved selection or spending policy.

### Paid provider call

After approval, create a fresh request and execute it:

```php
$response = Librarium::query(
    'What HTTP caching rules should a Laravel JSON API apply at a CDN and browser?',
)->fanOut(['exa', 'gemini-grounded'])
    ->maxCost('0.25', 'USD')
    ->run();

$payload = $response->toArray();
```

Branch on `status` (`succeeded`, `partial`, or `failed`). Each successful entry in `results` contains `content`, effective provider and Profile identity, provenance, and `citations`; `errors` contains safe failures. Usage can include decimal-string `actual_cost` and `estimated_cost`, but either can be absent. Persist `$payload` in application-owned storage if the result must survive: the package does not create research-history tables.
