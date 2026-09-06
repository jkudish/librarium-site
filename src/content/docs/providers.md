---
title: Providers
description: All 33 built-in providers, 40 public profiles, custody, credentials, and evidence boundaries.
order: 5
---

## Public catalog

Librarium v2 has 33 built-in providers and exactly 40 public profiles. Selection, config, artifacts, and provenance use `provider_id/profile_id`.

| Provider family | Public profiles |
| --- | --- |
| Brave | `brave-search/search`, `brave-answers/grounded` |
| Claude | `claude/chat` |
| Exa | `exa/search`, `exa/research` |
| Firecrawl | `firecrawl-search/search` |
| Gemini | `gemini-grounded/grounded`, `gemini-deep/research`, `gemini-chat/chat` |
| Grok | `grok/web`, `grok-x-only/x`, `grok-combined/combined` |
| Jina | `jina-search/search` |
| Kagi | `kagi-fastgpt/grounded` |
| OpenAI | `openai-research/research`, `openai-chat/chat` |
| OpenRouter | `openrouter/grounded`, `openrouter/chat` |
| Parallel | `parallel/search`, `parallel/turbo`, `parallel/chat`, `parallel/research` |
| Perplexity | `perplexity-search/search`, `perplexity-sonar-pro/grounded`, `perplexity-deep-research/research`, `perplexity-sonar-deep/research` |
| SearchAPI | `searchapi/search`, `searchapi-chatgpt/surface`, `searchapi-gemini/surface`, `searchapi-perplexity/surface`, `searchapi-google-ai-mode/surface`, `searchapi-bing-copilot/surface`, `searchapi-google-ai-overview/surface` |
| SerpAPI | `serpapi/search` |
| Tavily | `tavily/search` |
| Valyu | `valyu/search`, `valyu/research` |
| You.com | `you-research/grounded`, `you-research/research`, `you-answer/grounded` |

The durable profiles are `exa/research`, `gemini-deep/research`, `openai-research/research`, `parallel/research`, `perplexity-deep-research/research`, `perplexity-sonar-deep/research`, `valyu/research`, and `you-research/research`. Other custody follows the catalog declaration. `perplexity-search/search` remains raw Search unchanged. `perplexity-sonar-pro/grounded` is Agent low and inline. The two Perplexity research profiles are Agent medium and Agent high.

`grok-x-only/x` is X-only. `grok-combined/combined` has a separate identity from `grok/web`.

## Credentials and cost

Run `librarium init` or `librarium init --auto`, then `librarium doctor`. Provider calls send the query and selected options upstream. Retention, account behavior, and billing are provider concerns. SearchAPI `zeroRetention` is sent only when explicitly configured and fails closed if rejected. It is not a broader privacy guarantee.

Reported usage comes from provider output. A missing estimate, cost, API unit price, or token price means unknown, not free. `--max-cost` stops launching new work after reported spend crosses the bound, but in-flight calls can finish. `--max-estimated-cost` reserves only exact known pre-dispatch estimates.
