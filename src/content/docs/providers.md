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

**llm.** Generic model answers from Claude, OpenAI, Gemini, or OpenRouter. These are provider-style model calls rather than dedicated research APIs. Web search and citations are on by default and can be disabled globally with `defaults.llmWebSearch: false` or per provider with `options.webSearch: false`. They remain excluded from every grounded default group (`quick`, `fast`, `raw`, `deep`, `comprehensive`, and `all`) so normal runs do not silently add extra model calls. Opt in explicitly via `-p claude,openai-chat,...`, a custom group, or `--group llm`. Each provider accepts a default model with a per-provider `model` override.

## Provider list

| Provider | ID | Tier | API key env var |
|---|---|---|---|
| [Perplexity Sonar Deep Research](https://docs.perplexity.ai/home) | `perplexity-sonar-deep` | deep-research | `PERPLEXITY_API_KEY` |
| [Perplexity Deep Research](https://docs.perplexity.ai/home) | `perplexity-deep-research` | deep-research | `PERPLEXITY_API_KEY` |
| [Perplexity Advanced Deep Research](https://docs.perplexity.ai/home) | `perplexity-advanced-deep` | deep-research | `PERPLEXITY_API_KEY` |
| [OpenAI Research (GPT-5.6 Sol)](https://developers.openai.com/api/docs/guides/deep-research) | `openai-research` | deep-research | `OPENAI_API_KEY` |
| [Gemini Deep Research](https://ai.google.dev/gemini-api/docs) | `gemini-deep` | deep-research | `GEMINI_API_KEY` |
| [Perplexity Sonar Pro](https://docs.perplexity.ai/home) | `perplexity-sonar-pro` | ai-grounded | `PERPLEXITY_API_KEY` |
| [Gemini Grounded Search](https://ai.google.dev/gemini-api/docs) | `gemini-grounded` | ai-grounded | `GEMINI_API_KEY` |
| [Grok (xAI)](https://console.x.ai) | `grok` | ai-grounded | `XAI_API_KEY` |
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

## Typed descriptor inventory

Every built-in provider has one typed descriptor containing its factory, tier,
display/catalog metadata, credential name, metering, validated option schema,
aliases, default model, registration order, and inline/background capability
contract. Runtime registration and catalog output derive from this inventory.
Group membership remains explicit policy, but Librarium validates it so unknown
IDs, duplicates, tier mistakes, and stale `all`/`llm` rosters fail immediately.

Invalid provider options never silently trigger paid work. Initialization emits
a warning and keeps the adapter registered; `execute`, `submit`, and `test` fail
before HTTP, while `poll` and `retrieve` remain available for outstanding
background tasks.

## The llm tier

The `llm` tier is deliberately kept apart from the default grounded groups. Its adapters use their provider's web-search feature where available: Anthropic web search for `claude`, OpenAI `web_search` for `openai-chat`, Google Search grounding for `gemini-chat`, and OpenRouter's `openrouter:web_search` server tool for `openrouter-chat`. Disable web search globally with `defaults.llmWebSearch: false` or per provider with `options.webSearch: false`; a provider with search disabled contributes no citations or source URLs. Use the built-in `llm` group (`--group llm`) to run all four at once.

**Opt-in, never auto-enabled.** Several llm-tier providers share an API key with their grounded counterparts (`OPENAI_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`; Claude uses `ANTHROPIC_API_KEY`). To keep a plain `librarium run` -- which dispatches every *enabled* provider -- from silently calling extra model APIs, `init` treats the llm tier specially:

- `librarium init --auto` **does not** enable llm-tier providers, even when their key is present. It prints them as found-but-opt-in with a hint to opt in.
- Interactive `librarium init` **lists** the llm-tier providers but leaves them **unchecked**, so you must select them deliberately.

As a result they stay out of the default run unless you explicitly enable them in config. Reach for them on demand via `-p claude,openai-chat,...`, a custom group, or `--group llm` regardless of your init choices.

Default models per provider (each overridable with a per-provider `model` config key): `claude` uses `claude-sonnet-5`, `openai-chat` uses `gpt-5-mini`, `gemini-chat` uses `gemini-3.6-flash`, and `openrouter-chat` uses `openai/gpt-5.6-terra`. Claude additionally exposes configurable output, thinking, and effort controls documented under [Model overrides](/docs/configuration#model-overrides).

## Provider notes

### Async submit/poll vs inline execution

Three providers use remotely resumable background submit/poll/retrieve APIs and return immediately in `mixed` or `async` mode:

- `perplexity-sonar-deep` -- uses Perplexity's Async Sonar API (`POST /v1/async/sonar`, polled via `GET /v1/async/sonar/{id}`). Submits and returns a pending handle; poll with `librarium status --wait --retrieve`.
- `openai-research` -- uses the OpenAI Responses API with GPT-5.6 Sol, `web_search`, and background execution. Same submit-and-poll flow.
- `gemini-deep` -- uses Google's Interactions API (`POST /v1beta/interactions` with `background: true`). Submits and returns a pending handle; poll with `librarium status --wait --retrieve`.

Two Perplexity providers expose the full lifecycle contract but use a
process-local completed-result wrapper because the Agent API has no remote
background mode. Their descriptors report `taskPersistence: "process-local"`,
and they complete inline even in `mixed` or `async` mode:

- `perplexity-deep-research`
- `perplexity-advanced-deep`

### AI-grounded answer behavior

**`openrouter-online` (ChatGPT Search).** Keeps its GPT-4o Mini/Exa-backed
search profile but uses OpenRouter's current `openrouter:web_search` server
tool rather than the deprecated `:online` model suffix. URL annotations are
normalized into Librarium citations and source records.

**`grok` (xAI).** Queries xAI's official Responses API with the `web_search` tool for live web grounding. Citations come from `url_citation` annotations, normalized into the source set, and the answer markdown keeps the inline `[[n]](url)` markers. Defaults to the `grok-4.5` model with a per-provider `model` override -- select `grok-4.3` for cost-sensitive runs (see [Model overrides](#model-overrides)). X / social search is intentionally excluded from requests. Reported cost is the honest API figure, converted from xAI's `cost_in_usd_ticks`.

**`brave-answers` (Brave AI Answers).** Uses Brave's Answers API -- the OpenAI-compatible `chat/completions` endpoint -- and streams the response. Answer content is the native Answers markdown (the adapter no longer fabricates `## AI Summary` / `## Web Results` headings). Citations arrive as inline stream metadata and are normalized and deduplicated; usage arrives as a trailing inline `<usage>` stream tag carrying token counts and Brave's own dollar cost breakdown, and `usage.costUsd` is set from the API-reported `X-Request-Total-Cost` figure (with the final stream chunk's token counts and legacy `x-request-*` response headers as fallbacks). The provider requires the Answers subscription on your Brave plan: a search-only key (no subscription) fails with a clear "not subscribed" error (`400 OPTION_NOT_IN_PLAN`, pointing at the plan upgrade), while an invalid key fails with `422 SUBSCRIPTION_TOKEN_INVALID` (pointing at `BRAVE_API_KEY`).

### Usage and cost reporting

*Reported* cost is never estimated from pricing tables: `usage.costUsd` comes only from what each provider's API actually returns. (A separate, clearly-labelled pre-dispatch *estimate* lane exists -- see [Metering kinds](#metering-kinds) below -- but it never touches reported cost.)

| Provider | What the API reports |
|---|---|
| `perplexity-sonar-pro`, `perplexity-search`, `perplexity-sonar-deep` | Token counts (`prompt_tokens`, `completion_tokens`) and `cost.total_cost` (USD) when present |
| `openrouter-online`, `openrouter-chat` | Token counts and a flat `cost` field (USD) |
| `exa` | `costDollars.total` (USD); no token counts |
| `grok` | Converted USD cost from xAI's `cost_in_usd_ticks`, surfaced as reported `costUsd` |
| `brave-answers` | Token counts and total USD cost from the inline `<usage>` stream tag (`X-Request-Total-Cost`) |
| `gemini-grounded` | `usageMetadata` token counts (`promptTokenCount`, `candidatesTokenCount`) only; no cost field |
| `gemini-deep` | Interactions API token counts (`total_input_tokens`, `total_output_tokens`) only; no cost field |

All other providers either return no usage data or return only token counts with no cost. The reported totals in `summary.md` and the live table cover only the providers that reported something -- the displayed cost is always sourced from the API, never calculated.

### Metering kinds

So that the providers above (which report no native cost) can still be budgeted *before* a call runs, every built-in provider declares a **metering kind** in its descriptor, shown in `librarium ls`:

| Kind | Providers |
|---|---|
| `native_cost` (API returns real cost) | `perplexity-sonar-pro`, `perplexity-sonar-deep`, `perplexity-deep-research`, `perplexity-advanced-deep`, `openrouter-online`, `openrouter-chat`, `exa` |
| `native_tokens` (tokens reported; no cost field required) | `claude`, `openai-chat`, `gemini-chat`, `openai-research`, `gemini-deep`, `gemini-grounded`, `grok`* |
| `request_priced` (flat/plan price per request) | `serpapi`, `searchapi`, `brave-search`, `kagi-fastgpt`, `perplexity-search` |
| `credit_priced` (account credits per request) | `tavily`, `firecrawl-search`, `you-research` |
| `api_unit_priced` (per token/unit, size known only after the call) | `jina-search`, `brave-answers`** |
| `manual_unmetered` (no reliable per-call metering) | custom providers |

\* `grok` is registered as `native_tokens` so it keeps a pre-dispatch estimate for `--max-estimated-cost` reservations, but it additionally reports an actual dollar cost (converted from xAI's `cost_in_usd_ticks`) as `usage.costUsd` — the registry kind describes the estimate lane, not a limit on reported cost.

\*\* `brave-answers` is `api_unit_priced` for the estimate lane (cost depends on tokens consumed per call), but it likewise reports an actual dollar cost as `usage.costUsd`, taken from the `X-Request-Total-Cost` figure in Brave's inline `<usage>` stream tag.

`request_priced` and `credit_priced` providers can produce a **network-free pre-dispatch estimate** used by the [estimated budget](/docs/commands#metering-registry-and-the-estimated-budget) (`--max-estimated-cost`). Estimates are guesses, kept entirely separate from reported cost: flat request-priced providers carry a default USD figure (`costConfidence: estimated`), while plan-dependent credit/unit providers emit only unit metadata until you configure a price in their [`options`](/docs/configuration). This is metadata about the provider, not a pricing table applied to reported cost.

### Model overrides

`openai-research` defaults to `gpt-5.6-sol` and accepts a `model` override plus
the `reasoningEffort`, `maxToolCalls`, and `returnTokenBudget` options described
in [Configuration](/docs/configuration#model-overrides). The return-token budget
defaults to `default`; set it to `unlimited` only for high-effort research that
needs unusually large amounts of returned web content.

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

`grok` also accepts a per-provider `model` config key. It defaults to `grok-4.5`; set `model` to `grok-4.3` for cost-sensitive runs:

```json
{
  "providers": {
    "grok": {
      "apiKey": "$XAI_API_KEY",
      "enabled": true,
      "model": "grok-4.3"
    }
  }
}
```

The four llm-tier providers (`claude`, `openai-chat`, `gemini-chat`, `openrouter-chat`) also accept a per-provider `model` config override; see [the llm tier](#the-llm-tier) for their defaults. Aside from `openai-research` and `grok` (above), no other built-in provider currently exposes a model override via config. The OpenRouter and Perplexity Agent-based grounded providers use fixed model identifiers in their adapter code.

### API key setup and signup links

| Provider | Env var | Get a key |
|---|---|---|
| Anthropic (Claude) | `ANTHROPIC_API_KEY` | [platform.claude.com/docs/en/api/overview](https://platform.claude.com/docs/en/api/overview) |
| Perplexity | `PERPLEXITY_API_KEY` | [docs.perplexity.ai/home](https://docs.perplexity.ai/home) |
| OpenAI | `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) |
| Google Gemini | `GEMINI_API_KEY` | [ai.google.dev](https://ai.google.dev/gemini-api/docs) |
| xAI (Grok) | `XAI_API_KEY` | [console.x.ai](https://console.x.ai) |
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

Run `librarium init --auto` to discover which keys are already present in your environment and enable their matching providers automatically. Note that `init` never auto-enables llm-tier providers, even when their key is present -- see [the llm tier](#the-llm-tier).

## Async behavior notes

`perplexity-sonar-deep` uses Perplexity's Async Sonar API (`POST /v1/async/sonar`, polled via `GET /v1/async/sonar/{id}`). In `mixed` and `async` modes it submits and returns immediately; `librarium status --wait --retrieve` polls and retrieves results like `openai-research` tasks.

`gemini-deep` uses Google's Interactions API (`POST /v1beta/interactions` with `background: true`). In `mixed` and `async` modes it submits and returns immediately; poll with `librarium status --wait --retrieve`.

`perplexity-deep-research` and `perplexity-advanced-deep` use Perplexity's Agent API, which has no background mode. They complete inline even in `mixed` mode.

## Legacy provider ID aliases

These provider IDs were renamed to match current product names:

- `perplexity-sonar` renamed to `perplexity-sonar-pro`
- `perplexity-deep` renamed to `perplexity-sonar-deep`
- `openai-deep` renamed to `openai-research`
- `openai-deep-o3` renamed to `openai-research`

For backward compatibility, librarium still accepts legacy IDs in:

- `run --providers`
- provider config keys in `~/.config/librarium/config.json`
- custom group members
- `fallback` targets

Legacy IDs are normalized to canonical IDs and emit a warning. Output files and `run.json` always use canonical IDs.

## Custom providers

You can also add custom providers (npm modules or local scripts) via config. See [Custom providers](/docs/custom-providers) for the full implementation guide.
