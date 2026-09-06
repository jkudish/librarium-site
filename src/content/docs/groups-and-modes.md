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

Without explicit providers or a group, new requests select `quick`, not all enabled providers. Unavailable quick members are omitted with diagnostics. `quick` includes raw search from Exa; it is not restricted to AI answers. Explicit providers override `--group` with a notice. Saved mode and limits are honored, but there is no saved default workflow replacing implicit quick selection.

## Execution modes

The canonical v2 request has two modes. `sync` is the factory default: it keeps the request active while selected providers execute concurrently and are awaited. `async` accepts only durable profiles whose provider-scoped handles can survive the current process. Legacy `mixed` input is migrated to `async` with a notice; it does not preserve a combined inline-and-background request, so any selected non-durable profile is rejected during preparation.

A profile, not its marketing category, defines custody:

* `inline/none` returns in the active call.
* `background/process-local` can continue only while its owning process state survives.
* `background/durable` has a provider-scoped handle that can be polled and retrieved across processes.

A durable lifecycle is `submit`, `poll`, then `retrieve`. Polling observes state. Retrieval converts an observed successful handle into a terminal result. Never persist or describe process-local work as durable.

Fallbacks consume declared reserve candidates in order. `--no-fallback` requires the exact primary matrix. Cancellation is not universal. Only `valyu/research` advertises exact-profile remote cancellation in this catalog. Other background cancellation is reconciliation only.

See [Requests, retries, and fallbacks](/docs/request-and-retry) for request deadlines, HTTP retry safety, acceptance-unknown submissions, fallback admission, and recovery steps.
