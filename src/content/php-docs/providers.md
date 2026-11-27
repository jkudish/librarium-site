---
title: Sources and AI answer engines
description: Research source names, options, and Laravel-specific retrieval services.
order: 4
---

The shared catalog has 16 research sources: `brave`, `claude`, `exa`, `firecrawl`, `gemini`, `google`, `grok`, `jina`, `kagi`, `openai`, `openrouter`, `parallel`, `perplexity`, `tavily`, `valyu`, and `you`.

`Librarium::sources()` reports local configured state, variants, options, and offline price hints. A catalog entry is not proof of credentials or current provider access. PHP and JS options and retrieval-service availability differ.

## Source options

Options select behavior under a source name: Brave answers/search, Gemini grounded/chat, Grok web/X/both, OpenRouter grounded/chat, Parallel turbo/search and processor, Perplexity quick variant/deep effort, Valyu mode/output, You.com answer/research, Google retrieval service/vertical, and OpenAI model/effort. Validate against the shared catalog and local discovery.

Deep Exa, Gemini, OpenAI, Parallel, Perplexity, Valyu, and You.com support recovery. Sources without a deep variant are skipped. See [costs and limits](/docs/php/costs-and-limits) before paid research.

## AI answer engines chosen by name

ChatGPT (`chatgpt`), Gemini (`gemini-app`), Google AI Mode (`google-ai-mode`), Google AI Overview (`google-ai-overview`), Copilot (`copilot`), and Bing AI Mode (`bing-ai-mode`) return observations of consumer AI answers. Select them by name with `only()` or a saved group at quick depth.

SearchAPI is the default retrieval service and retrieves every engine except `bing-ai-mode`. DataForSEO retrieves `chatgpt`, `gemini-app`, and `google-ai-mode` with required location/language controls. Cloro retrieves `chatgpt`, `gemini-app`, `google-ai-mode`, `google-ai-overview`, and `bing-ai-mode` (Bing's AI answer page, a different product from Copilot); it does not retrieve `copilot`. An engine the configured service cannot retrieve is skipped with `no_collector`.

DataForSEO and Cloro take a `priority` option: `standard` (default) submits a provider task that supports recovery even at quick depth; `live` makes one synchronous call. Cloro reads `services.cloro.key`, needs an uppercase ISO `country`, observes answers in a logged-out browser session, and deletes finished tasks 24 hours after submission, so a `standard` result not retrieved by then fails. Cloro bills in credits, so results carry `cost.reported: null`; credits charged and extras such as ChatGPT brand entities stay in `$run->evidence()`. Set your plan's credit rate in laravel-ai-pricing for estimates.

Configure the retrieval service separately from the source name. Inspect the package reference for exact controls; account availability and paid acceptance are separate from offline support.

```php
'engines' => ['collector' => 'cloro', 'options' => ['country' => 'US']],
'sources' => ['google' => ['collector' => 'cloro', 'options' => ['country' => 'US']]],
```

Choose `live` per request with `->options(['chatgpt' => ['priority' => 'live']])`. The `google` source's Cloro collector makes one synchronous call for web results and for `vertical: news`, which needs Serpbase or Cloro.

## Firecrawl

Firecrawl search is built into core using Laravel HTTP. The optional `jkudish/laravel-ai-librarium-firecrawl` package retrieves AI answer-engine observations through a browser using SDK Interact or Agent and lets apps declare custom engines by URL. Recovery details live in private Run state; webhooks prompt a check, while polling retrieves the completed report.

Engine output is `observation: surface`, distinct from a research API answer and potentially different from a particular account. Preserve retrieval-service provenance and treat a shared service as correlated evidence.
