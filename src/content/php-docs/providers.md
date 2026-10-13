---
title: Sources and engine collectors
description: Research source names, options, and Laravel-specific collectors.
order: 4
---

The shared catalog has 16 research sources: `brave`, `claude`, `exa`, `firecrawl`, `gemini`, `google`, `grok`, `jina`, `kagi`, `openai`, `openrouter`, `parallel`, `perplexity`, `tavily`, `valyu`, and `you`.

`Librarium::sources()` reports local configured state, variants, options, and offline price hints. A catalog entry is not proof of credentials or current provider access. PHP and JS option/collector availability differs.

## Source options

Options select behavior under a flat source name: Brave answers/search, Gemini grounded/chat, Grok web/X/both, OpenRouter grounded/chat, Parallel turbo/search and processor, Perplexity quick variant/deep effort, Valyu mode/output, You.com answer/research, Google collector/vertical, and OpenAI model/effort. Validate against the shared catalog and local discovery.

Deep Exa, Gemini, OpenAI, Parallel, Perplexity, Valyu, and You.com use durable tasks. Sources without a deep variant are skipped. Unknown costs stay unknown; do not infer free execution from missing pricing.

## Named-only engines

`chatgpt`, `gemini-app`, `google-ai-mode`, `google-ai-overview`, and `copilot` return consumer surface observations. They never join the default research set and have no deep variant. Select them with `only()` or a saved group.

SearchAPI is a collector; DataForSEO supports selected PHP engines with standard/live priority and required location/language controls. Standard tasks can be durable even at quick depth. Collector configuration is not a new source name. Inspect the package collector docs for exact controls; account availability and paid acceptance are separate from offline support.

## Firecrawl

Firecrawl search is built into core using Laravel HTTP. The optional `jkudish/laravel-ai-librarium-firecrawl` package registers a browser engine collector using SDK Interact or Agent and lets apps declare custom engines by URL. It no longer owns core search. Agent handles live in private Run state; webhooks are wake hints, not terminal evidence authority.

Engine output is `observation: surface`, not an official research API answer or a guarantee about a particular account. Preserve collector provenance and treat shared collectors as correlated evidence.
