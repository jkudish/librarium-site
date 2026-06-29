---
title: Providers
description: The four provider tiers, all 24 built-in providers, API key setup, and behavioral notes.
order: 4
---

## Provider tiers

Librarium organizes its 24 built-in providers into four tiers based on capabilities, latency, and depth.

**deep-research.** Async deep research providers that take minutes to complete but produce comprehensive, multi-source reports. These providers may use a submit/poll/retrieve pattern. Best for thorough research on important topics.

**ai-grounded.** AI-powered search with inline citations. Returns results in seconds with good quality and source attribution. A solid middle ground between speed and depth.

**raw-search.** Traditional search engine results. Fast responses with many links and snippets, but no AI synthesis. Useful for broad link discovery and verifying specific facts.

**llm.** Ungrounded generic LLMs (Claude, OpenAI, Gemini, or anything via OpenRouter). These return the model's direct answer to the research prompt with no web grounding and no citations, so they contribute zero sources to the deduplicated source set, `sources.json`, and the report tallies. They exist as an opt-in baseline/contrast layer: run them alongside grounded research to see what the model says on its own versus what grounded providers surface. Because they are ungrounded, they are excluded from every grounded default group (`quick`, `fast`, `raw`, `deep`, `comprehensive`, and `all`). Opt in explicitly via `-p claude,openai-chat,...`, a custom group, or `--group llm`. Each provider takes a cheap default model with a per-provider `model` config override.

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
| [Claude](https://platform.claude.com/docs/en/api/overview) | `claude` | llm | `ANTHROPIC_API_KEY` |
| [OpenAI Chat](https://developers.openai.com/api/reference/overview) | `openai-chat` | llm | `OPENAI_API_KEY` |
| [Gemini Chat](https://ai.google.dev/gemini-api/docs) | `gemini-chat` | llm | `GEMINI_API_KEY` |
| [OpenRouter Chat](https://openrouter.ai/models) | `openrouter-chat` | llm | `OPENROUTER_API_KEY` |

## The llm tier (ungrounded baseline / contrast)

The `llm` tier is deliberately kept apart from the grounded tiers. Grounded providers earn their place in the source tallies by citing the web; ungrounded LLMs do not, so librarium never silently folds them into a grounded run. `llm`-tier rows in the live table and result output render a dim `ungrounded` in place of the source count, and the dedupe pipeline, `sources.json`, and report source totals are completely unaffected by their presence. Use the built-in `llm` group (`--group llm`) to run all four at once.

**Opt-in, never auto-enabled.** Several llm-tier providers share an API key with their grounded counterparts (`OPENAI_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`; Claude uses `ANTHROPIC_API_KEY`). To keep a plain `librarium run` -- which dispatches every *enabled* provider -- from silently calling an ungrounded model, `init` treats the llm tier specially:

- `librarium init --auto` **does not** enable llm-tier providers, even when their key is present. It prints them as found-but-ungrounded with a hint to opt in.
- Interactive `librarium init` **lists** the llm-tier providers but leaves them **unchecked** (with an `[ungrounded]` marker), so you must tick them deliberately.

As a result they stay out of the default run unless you explicitly enable them in config. Reach for them on demand via `-p claude,openai-chat,...`, a custom group, or `--group llm` regardless of your init choices.

Default models per provider (each overridable with a per-provider `model` config key): `claude` uses `claude-haiku-4-5`, `openai-chat` uses `gpt-5-mini`, `gemini-chat` uses `gemini-2.5-flash`, and `openrouter-chat` uses `openai/gpt-4o-mini`.

## Provider notes

### Async submit/poll vs inline execution

Four providers use a true background submit/poll/retrieve pattern and return immediately in `mixed` or `async` mode:

- `perplexity-sonar-deep` -- uses Perplexity's Async Sonar API (`POST /v1/async/sonar`, polled via `GET /v1/async/sonar/{id}`). Submits and returns a pending handle; poll with `librarium status --wait --retrieve`.
- `openai-deep` and `openai-deep-o3` -- use OpenAI's background deep research API. Same submit-and-poll flow.
- `gemini-deep` -- uses Google's Interactions API (`POST /v1beta/interactions` with `background: true`). Submits and returns a pending handle; poll with `librarium status --wait --retrieve`.

Two Perplexity providers use the Agent API, which has no background mode. They complete inline even in `mixed` or `async` mode:

- `perplexity-deep-research`
- `perplexity-advanced-deep`

### Usage and cost reporting

*Reported* cost is never estimated from pricing tables: `usage.costUsd` comes only from what each provider's API actually returns. (A separate, clearly-labelled pre-dispatch *estimate* lane exists -- see [Metering kinds](#metering-kinds) below -- but it never touches reported cost.)

| Provider | What the API reports |
|---|---|
| `perplexity-sonar-pro`, `perplexity-search`, `perplexity-sonar-deep` | Token counts (`prompt_tokens`, `completion_tokens`) and `cost.total_cost` (USD) when present |
| `openrouter-online`, `openrouter-chat` | Token counts and a flat `cost` field (USD) |
| `exa` | `costDollars.total` (USD); no token counts |
| `gemini-grounded` | `usageMetadata` token counts (`promptTokenCount`, `candidatesTokenCount`) only; no cost field |
| `gemini-deep` | Interactions API token counts (`total_input_tokens`, `total_output_tokens`) only; no cost field |

All other providers either return no usage data or return only token counts with no cost. The reported totals in `summary.md` and the live table cover only the providers that reported something -- the displayed cost is always sourced from the API, never calculated.

### Metering kinds

So that the providers above (which report no native cost) can still be budgeted *before* a call runs, every built-in provider declares a **metering kind** in a built-in registry, shown in `librarium ls`:

| Kind | Providers |
|---|---|
| `native_cost` (API returns real cost) | `perplexity-sonar-pro`, `perplexity-sonar-deep`, `perplexity-deep-research`, `perplexity-advanced-deep`, `openrouter-online`, `openrouter-chat`, `exa` |
| `native_tokens` (tokens only, no cost) | `claude`, `openai-chat`, `gemini-chat`, `openai-deep`, `openai-deep-o3`, `gemini-deep`, `gemini-grounded` |
| `request_priced` (flat/plan price per request) | `serpapi`, `searchapi`, `brave-search`, `brave-answers`, `kagi-fastgpt`, `perplexity-search` |
| `credit_priced` (account credits per request) | `tavily`, `firecrawl-search`, `you-research` |
| `api_unit_priced` (per token/unit, size known only after the call) | `jina-search` |
| `manual_unmetered` (no reliable per-call metering) | custom providers |

`request_priced` and `credit_priced` providers can produce a **network-free pre-dispatch estimate** used by the [estimated budget](/docs/commands#metering-registry-and-the-estimated-budget) (`--max-estimated-cost`). Estimates are guesses, kept entirely separate from reported cost: flat request-priced providers carry a default USD figure (`costConfidence: estimated`), while plan-dependent credit/unit providers emit only unit metadata until you configure a price in their [`options`](/docs/configuration). This is metadata about the provider, not a pricing table applied to reported cost.

### Model overrides

`gemini-deep` accepts a `model` config key to select the Deep Research agent. It defaults to the `deep-research-preview-04-2026` agent; set `model` to `deep-research-max-preview-04-2026` for the heavier (and more expensive) variant:

```json
{
  "providers": {
    "gemini-deep": {
      "apiKey": "$GEMINI_API_KEY",
      "enabled": true,
      "model": "deep-research-max-preview-04-2026"
    }
  }
}
```

The four llm-tier providers (`claude`, `openai-chat`, `gemini-chat`, `openrouter-chat`) also accept a per-provider `model` config override; see [the llm tier](#the-llm-tier-ungrounded-baseline--contrast) for their defaults. No other built-in provider currently exposes a model override via config. The OpenRouter and Perplexity Agent-based grounded providers use fixed model identifiers in their adapter code.

### API key setup and signup links

| Provider | Env var | Get a key |
|---|---|---|
| Anthropic (Claude) | `ANTHROPIC_API_KEY` | [platform.claude.com/docs/en/api/overview](https://platform.claude.com/docs/en/api/overview) |
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

Run `librarium init --auto` to discover which keys are already present in your environment and enable their matching providers automatically. Note that `init` never auto-enables llm-tier providers, even when their key is present -- see [the llm tier](#the-llm-tier-ungrounded-baseline--contrast).

## Async behavior notes

`perplexity-sonar-deep` uses Perplexity's Async Sonar API (`POST /v1/async/sonar`, polled via `GET /v1/async/sonar/{id}`). In `mixed` and `async` modes it submits and returns immediately; `librarium status --wait --retrieve` polls and retrieves results like `openai-deep` tasks.

`gemini-deep` uses Google's Interactions API (`POST /v1beta/interactions` with `background: true`). In `mixed` and `async` modes it submits and returns immediately; poll with `librarium status --wait --retrieve`.

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
