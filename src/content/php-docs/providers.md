---
title: Providers and Profiles
description: Reference the 23 Profiles currently implemented by Laravel Librarium.
order: 4
---

The current PHP source configures 23 selectable Profiles. A Profile is the
public Laravel selector; it binds a provider target to result and provenance
semantics. Availability also depends on its enabled state, credential, and
valid configuration.

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
when it is released. DataForSEO is not present in the current source and must
not be selected or configured as though it were available.

This roster describes the current PHP implementation only. It does not claim
the provider count, execution behavior, or feature parity of the
[JavaScript documentation](/docs).
