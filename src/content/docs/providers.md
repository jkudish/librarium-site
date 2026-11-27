---
title: Sources and engines
description: Research sources, quick/deep variants, AI answer engines, and availability.
order: 5
---

The shared catalog has 16 research sources and six AI answer engines chosen by name. The website grid and counts read pinned `librarium-spec/sources.json`; `librarium sources --json` reports what your installation can actually use.

## Research sources

| Source | Quick | Deep | Options |
| --- | --- | --- | --- |
| `brave` | Answers or search | — | `results` |
| `claude` | Chat with web search | — | `model` |
| `exa` | Search | Research | — |
| `firecrawl` | Search | — | `sources`, `limit` |
| `gemini` | Grounded or chat | Deep Research | `quick` |
| `google` | Search results | — | `collector`, `vertical` |
| `grok` | Web, X, or both | — | `search` |
| `jina` | Search | — | — |
| `kagi` | FastGPT | — | — |
| `openai` | Chat with web search | Research | `model`, `effort` |
| `openrouter` | Grounded or chat | — | `quick`, `model` |
| `parallel` | Turbo or search | Research | `quick`, `processor` |
| `perplexity` | Sonar Pro, search, or agent | Deep Research | `quick`, `deep_effort` |
| `tavily` | Search | — | — |
| `valyu` | Search | Research | `mode`, `output` |
| `you` | Answer or research | Research | `quick` |

Every source has at most one selected quick and deep variant. Variant and option availability differs by language. Inspect local discovery before selection. Deep variants support recovery; quick variants usually run in the calling process.

## AI answer engines

ChatGPT (`chatgpt`), Gemini (`gemini-app`), Google AI Mode (`google-ai-mode`), Google AI Overview (`google-ai-overview`), Copilot (`copilot`), and Bing AI Mode (`bing-ai-mode`) return observations of consumer AI answers. Choose them by name in `only`, directly or through a saved group. They support quick research.

Configure the retrieval service separately from the engine name. SearchAPI is the default and is unchanged.

| Engine | SearchAPI | DataForSEO | Cloro |
| --- | --- | --- | --- |
| `chatgpt` | ✓ | ✓ | ✓ |
| `gemini-app` | ✓ | ✓ | ✓ |
| `google-ai-mode` | ✓ | ✓ | ✓ |
| `google-ai-overview` | ✓ | — | ✓ |
| `copilot` | ✓ | — | — |
| `bing-ai-mode` | — | — | ✓ |

An engine the configured service cannot retrieve is skipped with `no_collector`. `bing-ai-mode` is Bing's AI answer page (bing.com/copilotsearch), a different product from Copilot, and only Cloro retrieves it. The PHP package can also use the Firecrawl browser adapter.

DataForSEO and Cloro take a `priority` engine option: `standard` (default) submits a queued provider task that the Run finishes later, even at quick depth; `live` makes one synchronous call. Cloro observes each answer in a logged-out browser session, so it reports no model choice, and it deletes finished tasks 24 hours after submission: a `standard` result not retrieved by then fails. Cloro bills in credits, not USD, so its results carry `cost.reported: null`; the credits charged stay in the stored evidence, together with extras such as ChatGPT brand entities and search queries.

Multiple engines can use the same service. Their results use `observation: surface`, distinct from research API output. Retrieved observations may differ from a user's account, location, or subscription.

## Costs and credentials

`setup --check` checks credentials offline, not authentication. Queries and selected options are sent to your sources. See [costs and limits](/docs/costs-and-limits) before paid research.
