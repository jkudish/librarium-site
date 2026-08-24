---
title: Groups and modes
description: Provider groups, execution modes, and fallback behavior.
order: 6
---

## Built-in workflows

V2 reserves exactly four names.

| Workflow | Selection |
| --- | --- |
| `quick` | `gemini-grounded/grounded`, `openrouter/grounded`, `brave-answers/grounded`, `exa/search`, `kagi-fastgpt/grounded`, `parallel/turbo` |
| `deep` | Derived from implemented research-report profiles |
| `visibility` | Six SearchAPI surface profiles, then `perplexity-sonar-pro/grounded`, `gemini-grounded/grounded`, and `grok/web` |
| `all` | Derived from selectable profiles allowed by catalog policy |

```bash
librarium run "current database pooling guidance" --group quick
librarium run "how answer engines describe Acme" --group visibility
```

The old built-ins `raw`, `fast`, `llm`, `models`, `comprehensive`, `social`, and `xai` do not exist in v2. A custom group must be defined and selected with its prefix:

```json
{ "groups": { "custom:team": ["exa/search", "tavily/search"] } }
```

```bash
librarium run "query" --group custom:team
```

`tavily/search` remains in the catalog. There is no `tavily/research` profile.

## Execution modes

`sync` runs work synchronously. `async` submits eligible background work. `mixed` submits background work and runs inline profiles in the same request. A profile, not its marketing category, defines custody:

* `inline/none` returns in the active call.
* `background/process-local` can continue only while its owning process state survives.
* `background/durable` has a provider-scoped handle that can be polled and retrieved across processes.

A durable lifecycle is `submit`, `poll`, then `retrieve`. Polling observes state. Retrieval converts an observed successful handle into a terminal result. Never persist or describe process-local work as durable.

Fallbacks consume declared reserve candidates in order. `--no-fallback` requires the exact primary matrix. Cancellation is not universal. Only `valyu/research` advertises exact-profile remote cancellation in this catalog. Other background cancellation is reconciliation only.
