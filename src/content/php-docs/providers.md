---
title: Providers and Profiles
description: Reference 41 enabled Profiles and six disabled-by-default DataForSEO Profiles.
order: 4
---

The current PHP source configures 47 flat Profile IDs. Forty-one have
`enabled: true`; six DataForSEO Profiles have `enabled: false`. A Profile is the
public Laravel selector. Enabled state alone does not make it available:
credentials and configuration must also pass preflight.

## Enabled Profiles

| Profile | Provider target | Result | Execution |
| --- | --- | --- | --- |
| `gemini-grounded` | Gemini | grounded answer | inline |
| `openrouter-grounded` | OpenRouter | grounded answer | inline |
| `openrouter-chat` | OpenRouter | grounded answer; optional search | inline |
| `claude-chat` | Anthropic | grounded answer; optional search | inline |
| `openai-chat` | OpenAI | grounded answer; optional search | inline |
| `gemini-chat` | Gemini | grounded answer; optional search | inline |
| `brave-answers` | Brave Answers | grounded answer | inline |
| `exa` | Exa Search | search results | inline |
| `kagi-fastgpt` | Kagi FastGPT | grounded answer | inline |
| `you-answer` | You.com Answer | grounded answer | inline |
| `you-research-grounded` | You.com Research | grounded answer | inline |
| `you-research-research` | You.com Research | research report | background provider task |
| `perplexity-sonar-pro` | Perplexity Agent, low preset | grounded answer | inline |
| `grok` | xAI Grok with web search | grounded answer | inline |
| `openai-research` | OpenAI web research | research report | background provider task |
| `perplexity-sonar-deep` | Perplexity Agent, high preset | research report | background provider task |
| `searchapi` | SearchAPI Google | search results | inline |
| `searchapi-chatgpt` | SearchAPI ChatGPT | surface observation | inline |
| `searchapi-gemini` | SearchAPI Gemini | surface observation | inline |
| `searchapi-perplexity` | SearchAPI Perplexity | surface observation | inline |
| `searchapi-google-ai-mode` | SearchAPI Google AI Mode | surface observation | inline |
| `searchapi-bing-copilot` | SearchAPI Bing Copilot | surface observation | inline |
| `searchapi-google-ai-overview` | SearchAPI Google AI Overview | surface observation | two-stage inline |
| `perplexity-low-frozen` | Perplexity Agent, frozen low configuration | grounded answer | inline |
| `brave-search` | Brave Web Search | search results | inline |
| `tavily-search` | Tavily Search | search results | inline |
| `perplexity-search` | Perplexity Search | search results | inline |
| `jina-search` | Jina Search | search results | inline |
| `serpapi` | SerpAPI Google Search | search results | inline |
| `serpbase-search` | SerpBase Google Search | search results | inline |
| `serpbase-news` | SerpBase Google News | search results | inline |
| `exa-research` | Exa Research | research report | background provider task |
| `gemini-deep-research` | Gemini Deep Research | research report | background provider task |
| `perplexity-deep-research` | Perplexity Agent, medium preset | research report | background provider task |
| `grok-x-only` | xAI Grok with X Search | grounded answer | inline |
| `grok-combined` | xAI Grok with web and X Search | grounded answer | inline |
| `parallel-search` | Parallel Search | search results | inline |
| `parallel-turbo` | Parallel Search, turbo mode | search results | inline |
| `parallel-research` | Parallel Research | research report | background provider task |
| `valyu-search` | Valyu Search | search results | inline |
| `valyu-research` | Valyu Research | research report | background provider task |

Run `php artisan librarium:profiles` for the application-specific eligibility
view. Missing credentials make a Profile unavailable; they do not remove its
configuration.

## Opt-in DataForSEO Profiles

These six provider-local surface collectors are configured but disabled by
default:

| Profile | Provider target | Result | Execution |
| --- | --- | --- | --- |
| `dataforseo-chatgpt` | DataForSEO ChatGPT Standard | surface observation | background poll |
| `dataforseo-chatgpt-live` | DataForSEO ChatGPT Live | surface observation | inline |
| `dataforseo-gemini` | DataForSEO Gemini Standard | surface observation | background poll |
| `dataforseo-gemini-live` | DataForSEO Gemini Live | surface observation | inline |
| `dataforseo-google-ai-mode` | DataForSEO Google AI Mode Standard | surface observation | background poll |
| `dataforseo-google-ai-mode-live` | DataForSEO Google AI Mode Live | surface observation | inline |

Opt in one Profile at a time by publishing `config/librarium.php`, setting
`DATAFORSEO_LOGIN` and `DATAFORSEO_PASSWORD`, adding the required location and
language controls, and changing only the intended Profile's `enabled` value to
`true`. They do not join `quick` or `visibility`; enabled entries participate
in the derived `all` group. See [Configuration](/docs/php/configuration#opt-in-dataforseo)
for the exact configuration boundary.

The source and offline provider-boundary tests cover these integrations. They
do not authorize a paid canary or prove current account availability. See the
package's live-canary inventory for dated evidence.

The optional-search chat Profiles use Laravel AI's native `WebSearch`, enabled
by default. Setting their `options.web_search` to `false` truthfully changes the
terminal result to an ungrounded `model_answer`; Librarium does not claim
retrieval that did not happen.

SearchAPI surface Profiles are observations of consumer AI surfaces collected
through SearchAPI, not direct answers from those surface operators. The raw
`searchapi` Profile is ordinary Google search results. SearchAPI also requires
an application-configured pricing rate before a hard cost ceiling is available.

## Optional integrations

Firecrawl remains a separate optional adapter package and is not registered by
core. The PHP-only `perplexity-low-frozen` and DataForSEO Profiles also have no
JavaScript catalog equivalent. The accepted 39-row cross-language release
snapshot is historical compatibility evidence, not the current catalog count.

This roster describes the current PHP implementation only. It does not claim
the provider count, execution behavior, or feature parity of the
[JavaScript documentation](/docs).
