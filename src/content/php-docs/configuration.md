---
title: Configuration
description: Configure Laravel Profiles, credentials, queues, deadlines, and pricing.
order: 3
---

Publish `config/librarium.php` when defaults need to change:

```bash
php artisan vendor:publish --tag=librarium-config
```

The package defaults to the `quick` group, a 6,900-second research timeout,
10,800-second status and webhook-signal TTLs, and the `research` queue with a
7,200-second job timeout. A per-request `timeout()` may be 1–86,400 seconds.

## Credentials

Laravel AI SDK Profiles resolve these normal Laravel AI paths:

| Profiles | Configuration path |
| --- | --- |
| Gemini | `ai.providers.gemini.key` |
| OpenRouter | `ai.providers.openrouter.key` |
| Anthropic | `ai.providers.anthropic.key` |
| OpenAI chat and research | `ai.providers.openai.key` |
| xAI Grok | `ai.providers.xai.key` |

Focused HTTP Profiles use service configuration:

```php
// config/services.php
return [
    'brave' => ['key' => env('BRAVE_API_KEY')],
    'exa' => ['key' => env('EXA_API_KEY')],
    'jina' => ['key' => env('JINA_API_KEY')],
    'kagi' => ['key' => env('KAGI_API_KEY')],
    'parallel' => ['key' => env('PARALLEL_API_KEY')],
    'perplexity' => ['key' => env('PERPLEXITY_API_KEY')],
    'searchapi' => ['key' => env('SEARCHAPI_KEY')],
    'serpapi' => ['key' => env('SERPAPI_API_KEY')],
    'serpbase' => ['key' => env('SERPBASE_API_KEY')],
    'tavily' => ['key' => env('TAVILY_API_KEY')],
    'valyu' => ['key' => env('VALYU_API_KEY')],
];
```

You.com uses `YOU_COM_API_KEY`, with `YDC_API_KEY` as a fallback when the
canonical variable is blank. DataForSEO is the exception to the service-path
pattern: its login and password are read from `librarium.providers.dataforseo`.
The OpenAI webhook secret is read from `services.openai.webhook_secret`.

Credentials are resolved into in-memory Profile objects. They are excluded
from previews, serialized Profiles, terminal responses, provider metadata, and
safe Driver errors. Do not put credentials in Profile `options`.

## Profiles and groups

Each entry under `librarium.profiles` defines a flat Profile ID, Driver,
provider/model identity, result semantics, prompt template, enabled state,
options, credential, and pricing usage assumptions. Unknown options fail
preflight according to the selected Driver's rules.

Add application groups under `librarium.groups`. Built-in `quick`, `visibility`,
`deep`, and `all` remain available. See [Groups and modes](/docs/php/groups-and-modes).

## Opt in DataForSEO

All six DataForSEO Profiles ship in `config/librarium.php` with `enabled: false`.
First set the provider credentials:

```dotenv
DATAFORSEO_LOGIN=your-api-login
DATAFORSEO_PASSWORD=your-api-password
```

Publish the package config, then edit the complete shipped entry for each
Profile the application intends to use. Retain its Driver, provider, result,
provenance, prompt, credential, and pricing fields; the excerpt below shows only
the values an application normally changes:

```php
// Inside the shipped librarium.profiles.dataforseo-chatgpt entry:
'enabled' => true,
'options' => [
    'location_code' => 2840,
    'language_code' => 'en',
    'force_web_search' => true,
],
```

Every DataForSEO Profile requires a positive `location_code` and a non-empty
`language_code`. ChatGPT also requires boolean `force_web_search`. Gemini
accepts no additional surface control. Google AI Mode may omit both device
fields, or use `device: desktop` with `os: windows|macos`, or `device: mobile`
with `os: android|ios`. Unknown and incompatible options fail preflight.

The exact Standard/Live pairs are `dataforseo-chatgpt` /
`dataforseo-chatgpt-live`, `dataforseo-gemini` /
`dataforseo-gemini-live`, and `dataforseo-google-ai-mode` /
`dataforseo-google-ai-mode-live`. They remain outside `quick` and `visibility`.
An enabled and otherwise eligible entry joins derived `all`.

Preview the exact flat Profile ID before authorizing a run. The source and
offline tests do not authorize a new paid canary or establish current account
availability. See the package's live-canary inventory for dated evidence.

## Queue

Set `librarium.queue.connection` to a Laravel queue connection or leave it
`null` to use the application's default. `librarium.queue.name` defaults to
`research`. The application owns queue infrastructure, worker supervision, and
failed-job handling.

## Pricing

Pricing previews come from `jkudish/laravel-ai-pricing`; Librarium does not keep
a second rate table. Offline preview can use configured rates, the reviewed
snapshot, and previously synchronized last-known-good catalog data. Remote
catalog refresh is explicit:

```bash
php artisan ai:pricing:sync
```

Non-configured catalog prices must be no older than
`librarium.pricing.max_age_days` (30 by default). `maxCost()` and `--max-cost`
fail closed unless all reachable primary and fallback quotes are complete,
current, conservative, and in one currency. SearchAPI pricing is
configured-only: define `successful_search_request` in `config/ai-pricing.php`
or its cost remains unavailable.
