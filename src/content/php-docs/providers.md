---
title: Providers and Profiles
description: Reference 23 baseline Profiles and six disabled-by-default DataForSEO Profiles.
order: 4
---

The current PHP source configures 29 flat Profile IDs: 23 baseline Profiles
whose shipped configuration has `enabled: true`, plus six DataForSEO Profiles
with `enabled: false`. A Profile is the public Laravel selector; it binds a
provider target to result and provenance semantics. Enabled state is only one
eligibility condition: availability also depends on credentials and valid
configuration.

## Baseline Profiles

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

The source and offline provider-boundary tests cover these six integrations.
Paid live acceptance remains pending for every DataForSEO Profile; credentials,
offline coverage, and an admitted preview are not evidence of live account or
provider readiness.

The optional-search chat Profiles use Laravel AI's native `WebSearch`, enabled
by default. Setting their `options.web_search` to `false` truthfully changes the
terminal result to an ungrounded `model_answer`; Librarium does not claim
retrieval that did not happen.

SearchAPI surface Profiles are observations of consumer AI surfaces collected
through SearchAPI, not direct answers from those surface operators. The raw
`searchapi` Profile is ordinary Google search results. SearchAPI also requires
an application-configured pricing rate before a hard cost ceiling is available.

## Optional integrations

Firecrawl is designed as a separate optional adapter package and is not
registered by the core package. Install and document that adapter independently
when it is released.

The following current JavaScript v2 profiles are known coverage differences and
are not registered by the core PHP package:

- `brave-search/search`
- `exa/research`
- `firecrawl-search/search`
- `gemini-deep/research`
- `grok-x-only/x`
- `grok-combined/combined`
- `jina-search/search`
- `parallel/search`
- `parallel/turbo`
- `parallel/research`
- `perplexity-search/search`
- `perplexity-deep-research/research`
- `serpapi/search`
- `tavily/search`
- `valyu/search`
- `valyu/research`

This is an inventory boundary, not a readiness claim or implementation
commitment. The six PHP-only DataForSEO Profiles above do not erase these
differences.

This roster describes the current PHP implementation only. It does not claim
the provider count, execution behavior, or feature parity of the
[JavaScript documentation](/docs).
