---
title: Providers
description: The three provider tiers, all 20 built-in providers, API key setup, and behavioral notes.
order: 4
---

## Provider tiers

Librarium organizes its 20 built-in providers into three tiers based on capabilities, latency, and depth.

**deep-research.** Async deep research providers that take minutes to complete but produce comprehensive, multi-source reports. These providers may use a submit/poll/retrieve pattern. Best for thorough research on important topics.

**ai-grounded.** AI-powered search with inline citations. Returns results in seconds with good quality and source attribution. A solid middle ground between speed and depth.

**raw-search.** Traditional search engine results. Fast responses with many links and snippets, but no AI synthesis. Useful for broad link discovery and verifying specific facts.

A fourth `llm` tier (plain LLM providers such as `claude`, `openai-chat`, `gemini-chat`, `openrouter-chat`) is being added by a parallel workstream. This page is structured so adding that tier requires only a new section below and a new table block -- nothing existing needs to change. That tier was not yet present in the source when this page was written; check the README for the latest.

## Provider list

| Provider | ID | Tier | API key env var |
|---|---|---|---|
| [Perplexity Sonar Deep Research](https://docs.perplexity.ai/home) | `perplexity-sonar-deep` | deep-research | `PERPLEXITY_API_KEY` |
| [Perplexity Deep Research](https://docs.perplexity.ai/home) | `perplexity-deep-research` | deep-research | `PERPLEXITY_API_KEY` |
| [Perplexity Advanced Deep Research](https://docs.perplexity.ai/home) | `perplexity-advanced-deep` | deep-research | `PERPLEXITY_API_KEY` |
| [OpenAI Deep Research (o4-mini)](https://developers.openai.com/api/reference/overview) | `openai-deep` | deep-research | `OPENAI_API_KEY` |
| [OpenAI Deep Research (o3)](https://developers.openai.com/api/reference/overview) | `openai-deep-o3` | deep-research | `OPENAI_API_KEY` |
| [Gemini Deep Research](https://ai.google.dev/gemini-api/docs) | `gemini-deep` | deep-research | `GEMINI_API_KEY` |
| [Perplexity Sonar Pro](https://docs.perplexity.ai/home) | `perplexity-sonar-pro` | ai-grounded | `PERPLEXITY_API_KEY` |
| [Gemini Grounded Search](https://ai.google.dev/gemini-api/docs) | `gemini-grounded` | ai-grounded | `GEMINI_API_KEY` |
| [ChatGPT Search (OpenRouter)](https://openrouter.ai/models) | `openrouter-online` | ai-grounded | `OPENROUTER_API_KEY` |
| [Brave AI Answers](https://brave.com/search/api/) | `brave-answers` | ai-grounded | `BRAVE_API_KEY` |
| [Exa Search](https://exa.ai/docs/reference/search-api-guide) | `exa` | ai-grounded | `EXA_API_KEY` |
| [You.com Research](https://you.com/docs/welcome) | `you-research` | ai-grounded | `YOU_COM_API_KEY` |
| [Kagi FastGPT](https://help.kagi.com/kagi/api/fastgpt.html) | `kagi-fastgpt` | ai-grounded | `KAGI_API_KEY` |
| [Perplexity Search](https://docs.perplexity.ai/home) | `perplexity-search` | raw-search | `PERPLEXITY_API_KEY` |
| [Brave Web Search](https://brave.com/search/api/) | `brave-search` | raw-search | `BRAVE_API_KEY` |
| [Jina AI Search](https://jina.ai/) | `jina-search` | raw-search | `JINA_AI_API_KEY` |
| [SearchAPI](https://www.searchapi.io/docs/google) | `searchapi` | raw-search | `SEARCHAPI_API_KEY` |
| [SerpAPI](https://serpapi.com/search-api) | `serpapi` | raw-search | `SERPAPI_API_KEY` |
| [Tavily Search](https://docs.tavily.com/documentation/api-reference) | `tavily` | raw-search | `TAVILY_API_KEY` |
| [Firecrawl Search](https://docs.firecrawl.dev/introduction) | `firecrawl-search` | raw-search | `FIRECRAWL_API_KEY` |

## Provider notes

### Async submit/poll vs inline execution

Four providers use a true background submit/poll/retrieve pattern and return immediately in `mixed` or `async` mode:

- `perplexity-sonar-deep` -- uses Perplexity's Async Sonar API (`POST /v1/async/sonar`, polled via `GET /v1/async/sonar/{id}`). Submits and returns a pending handle; poll with `librarium status --wait --retrieve`.
- `openai-deep` and `openai-deep-o3` -- use OpenAI's background deep research API. Same submit-and-poll flow.
- (Note: `gemini-deep` implements the async interface but completes inline -- see below.)

Two Perplexity providers use the Agent API, which has no background mode. They complete inline even in `mixed` or `async` mode:

- `perplexity-deep-research`
- `perplexity-advanced-deep`

`gemini-deep` is listed as deep-research but also runs inline (the submit/retrieve methods are wrappers around execute). It does not produce a pending async task that `librarium status` can poll.

### Usage and cost reporting

Librarium never estimates costs from pricing tables. Usage data comes only from what each provider's API actually returns.

| Provider | What the API reports |
|---|---|
| `perplexity-sonar-pro`, `perplexity-search`, `perplexity-sonar-deep` | Token counts (`prompt_tokens`, `completion_tokens`) and `cost.total_cost` (USD) when present |
| `openrouter-online` | Token counts and a flat `cost` field (USD) |
| `exa` | `costDollars.total` (USD); no token counts |
| `gemini-grounded`, `gemini-deep` | `usageMetadata` token counts (`promptTokenCount`, `candidatesTokenCount`) only; no cost field |

All other providers either return no usage data or return only token counts with no cost. The reported totals in `summary.md` and the live table cover only the providers that reported something -- the displayed cost is always sourced from the API, never calculated.

### Model overrides

`gemini-deep` accepts a `model` config key to select the Gemini model variant (default: `gemini-2.5-flash`):

```json
{
  "providers": {
    "gemini-deep": {
      "apiKey": "$GEMINI_API_KEY",
      "enabled": true,
      "model": "gemini-2.5-pro"
    }
  }
}
```

No other built-in provider currently exposes a model override via config. The OpenRouter and Perplexity Agent-based providers use fixed model identifiers in their adapter code.

### API key setup and signup links

| Provider | Env var | Get a key |
|---|---|---|
| Perplexity | `PERPLEXITY_API_KEY` | [docs.perplexity.ai/home](https://docs.perplexity.ai/home) |
| OpenAI | `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) |
| Google Gemini | `GEMINI_API_KEY` | [ai.google.dev](https://ai.google.dev/gemini-api/docs) |
| Brave | `BRAVE_API_KEY` | [brave.com/search/api](https://brave.com/search/api/) |
| Exa | `EXA_API_KEY` | [exa.ai](https://exa.ai/docs/reference/search-api-guide) |
| You.com | `YOU_COM_API_KEY` | [you.com/docs/welcome](https://you.com/docs/welcome) |
| Kagi | `KAGI_API_KEY` | [help.kagi.com](https://help.kagi.com/kagi/api/fastgpt.html) |
| Jina AI | `JINA_AI_API_KEY` | [jina.ai](https://jina.ai/) |
| SearchAPI | `SEARCHAPI_API_KEY` | [searchapi.io](https://www.searchapi.io/docs/google) |
| SerpAPI | `SERPAPI_API_KEY` | [serpapi.com](https://serpapi.com/search-api) |
| Tavily | `TAVILY_API_KEY` | [docs.tavily.com](https://docs.tavily.com/documentation/api-reference) |
| Firecrawl | `FIRECRAWL_API_KEY` | [docs.firecrawl.dev](https://docs.firecrawl.dev/introduction) |
| OpenRouter | `OPENROUTER_API_KEY` | [openrouter.ai](https://openrouter.ai/models) |

Run `librarium init --auto` to discover which keys are already present in your environment and enable their matching providers automatically.

## Async behavior notes

`perplexity-sonar-deep` uses Perplexity's Async Sonar API (`POST /v1/async/sonar`, polled via `GET /v1/async/sonar/{id}`). In `mixed` and `async` modes it submits and returns immediately; `librarium status --wait --retrieve` polls and retrieves results like `openai-deep` tasks.

`perplexity-deep-research` and `perplexity-advanced-deep` use Perplexity's Agent API, which has no background mode. They complete inline even in `mixed` mode.

## Legacy provider ID aliases

Perplexity provider IDs were renamed to match current product names:

- `perplexity-sonar` renamed to `perplexity-sonar-pro`
- `perplexity-deep` renamed to `perplexity-sonar-deep`

For backward compatibility, librarium still accepts legacy IDs in:

- `run --providers`
- provider config keys in `~/.config/librarium/config.json`
- custom group members
- `fallback` targets

Legacy IDs are normalized to canonical IDs and emit a warning. Output files and `run.json` always use canonical IDs.

## Custom providers

You can also add custom providers (npm modules or local scripts) via config. See [Custom providers](/docs/custom-providers) for the full implementation guide.
