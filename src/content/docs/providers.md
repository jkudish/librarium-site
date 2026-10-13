---
title: Sources and engines
description: Flat research source names, quick/deep variants, engine collectors, and availability.
order: 5
---

The shared catalog has 16 research sources and five named-only engines. The website grid and counts read pinned `librarium-spec/sources.json`; `librarium sources --json` reports what your installation can actually use.

## Research sources

| Source | Quick | Deep | Options |
| --- | --- | --- | --- |
| `brave` | Answers or search | — | `results` |
| `claude` | Chat with web search | — | `model` |
| `exa` | Search | Research | — |
| `firecrawl` | Search | — | `sources`, `limit` |
| `gemini` | Grounded or chat | Deep Research | `quick` |
| `google` | SERP collector | — | `collector`, `vertical` |
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

Options replace public profile selectors. Every source has at most one selected quick and deep variant. Variant and option availability differs by language; the catalog's legacy mapping is not proof that every option is executable in every package. Inspect local discovery before selection. Deep variants are durable tasks; quick variants usually run inline.

## Engines

`chatgpt`, `gemini-app`, `google-ai-mode`, `google-ai-overview`, and `copilot` observe consumer answer surfaces. They only run when named in `only`, directly or through a saved group, and have no deep variant.

Collectors are configuration: SearchAPI, PHP DataForSEO where supported, or the PHP Firecrawl browser adapter. Multiple engines can share one collector. Their results use `observation: surface`, not official research API output. A collector does not promise parity with a user's account, location, or subscription.

## Costs and credentials

`setup --check` is offline; credential presence does not authenticate. Provider queries and selected options are sent upstream. Estimates come from package pricing, not the spec. Unknown reported cost stays `null`. With a cap, unpriced sources are skipped; in-flight work can exceed it. No failed source automatically substitutes another.
