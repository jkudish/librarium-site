---
title: Groups and modes
description: Provider groups, execution modes, and fallback behavior.
order: 6
---

## Built-in workflows

V2 reserves exactly four names. A workflow is a named selection of profiles; you choose one with `--group <name>`.

| Workflow | Use it for | Selection | Execution |
| --- | --- | --- | --- |
| `quick` | Fast discovery and cited answers | `gemini-grounded/grounded`, `openrouter/grounded`, `brave-answers/grounded`, `exa/search`, `kagi-fastgpt/grounded`, `parallel/turbo` | Inline |
| `deep` | Long-form research reports | Derived from implemented research-report profiles | Background, durable |
| `visibility` | How answer engines describe a topic, brand, or product | Five SearchAPI surface profiles, then `perplexity-sonar-pro/grounded`, `gemini-grounded/grounded`, and `grok/web` | Inline |
| `all` | Maximum coverage across every source type | Derived from selectable profiles allowed by catalog policy | Mixed inline and background |

Preview any workflow before spending money. `plan` resolves the selection, shows each profile's estimate and deadline, and makes no provider requests. `run` executes the same selection and may make paid provider requests.

```bash
librarium plan "current database pooling guidance" --group quick
librarium run "current database pooling guidance" --group quick
```

A plan estimate is not a price quote. A missing estimate is shown as unknown, never as zero. Use `--max-estimated-cost` or `--max-cost` when a run must stay inside a budget; hard budget flags require a bounded estimate for every selected profile and fallback reserve.

Each workflow runs only the members that are enabled and have credentials. A run names each member it skips and how to enable it, so a workflow can be useful with a partial set of keys.

### quick

**For:** a fast first pass. Search results and short grounded answers with citations, when you want to see what sources say about a question before deciding whether to go further.

**Runs:** a curated, ordered roster of six profiles: `gemini-grounded/grounded`, `openrouter/grounded`, `brave-answers/grounded`, `exa/search`, `kagi-fastgpt/grounded`, and `parallel/turbo`. It mixes raw search (`exa/search`) with grounded AI answers; it is not restricted to AI answers.

**Speed and cost:** every member is an inline profile, so results return in the active call. The roster is curated for low latency. Run `librarium plan "<question>" --group quick` for the estimate.

**Use when:** you need a current answer with sources, are scoping a question, or are not sure yet whether deeper research is worth it.

```bash
librarium run "current guidance for HTTP caching" --group quick
```

**Notes:** `quick` is the default. Without explicit providers or a group, new requests select `quick`. Parallel is an opt-in provider; enable it with `librarium init --enable <id>` if you want `parallel/turbo` included.

### deep

**For:** thorough research reports, when a question deserves several long-form, multi-step investigations rather than a quick answer.

**Runs:** every implemented research-report profile, derived from the catalog when the request is prepared. In the current catalog that is `exa/research`, `gemini-deep/research`, `openai-research/research`, `parallel/research`, `perplexity-deep-research/research`, `perplexity-sonar-deep/research`, `valyu/research`, and `you-research/research`.

**Speed and cost:** every member is a `background/durable` profile. Reports commonly take minutes, and each provider prices its reports separately. `librarium plan "<question>" --group deep` shows each profile's estimate and its attempt deadline.

**Use when:** you are making a technical or business decision, writing a brief, or comparing approaches and want several independent reports with their citations.

```bash
librarium plan "SQLite or Postgres for a small team app?" --group deep
librarium run "SQLite or Postgres for a small team app?" --group deep --mode async
librarium status --wait --retrieve
```

**Notes:** because every `deep` member is durable, it can run in `async` mode. Async submits the work, saves provider-scoped handles, and returns. `librarium status --wait --retrieve` polls and retrieves the reports later, including from another process. In the default `sync` mode the command waits for every report.

### visibility

**For:** seeing how AI answer engines describe a topic, brand, or product: which names they mention, how they describe them, and which sources they cite.

**Runs:** five SearchAPI surface profiles first (`searchapi-chatgpt/surface`, `searchapi-gemini/surface`, `searchapi-google-ai-mode/surface`, `searchapi-bing-copilot/surface`, `searchapi-google-ai-overview/surface`), then three first-party API baselines: `perplexity-sonar-pro/grounded`, `gemini-grounded/grounded`, and `grok/web`.

**Speed and cost:** every member is inline. Surface collection is billed by SearchAPI and the baselines by their own providers. Run `librarium plan "<question>" --group visibility` for the estimate.

**Use when:** you are tracking how answer engines present your product or a competitor's. Use it as a complement to a `quick` or `deep` pass on the same question, not a substitute for research.

```bash
librarium plan "Which villa rental services do AI answers recommend on the Amalfi Coast?" --group visibility
librarium run "Which villa rental services do AI answers recommend on the Amalfi Coast?" --group visibility
```

**Notes:**

* Surface profiles are opt-in by selection. They run only when you select `visibility`, `all`, a custom group that names them, or a surface profile directly. `quick` never includes them.
* They need a SearchAPI key. With `SEARCHAPI_API_KEY` exported, `librarium init --auto` enables the SearchAPI surfaces; `librarium init --enable <ids>` enables specific providers.
* Surface results are `surface_snapshot` records collected by SearchAPI. They are not official OpenAI, Google, or Microsoft APIs. The three baselines are `api_output` from the vendors' APIs, not snapshots of their consumer surfaces.
* The five surfaces share one collector. Agreement among them is correlated visibility evidence, not five independent confirmations.

### all

**For:** maximum coverage, when you want every enabled source type in one run.

**Runs:** every selectable profile allowed by catalog policy, derived from the catalog when the request is prepared: search, grounded answers, chat, research reports, and answer surfaces. Profiles that are not enabled or lack credentials are omitted with diagnostics.

**Speed and cost:** with the same providers enabled, `all` selects a superset of the other three workflows, so it is at least as slow and costly as any of them. It includes every enabled `deep` member, so a sync run lasts as long as its slowest research report. Always run `librarium plan "<question>" --group all` first.

**Use when:** you are auditing coverage, comparing providers against each other, or need the broadest possible evidence for a single question.

```bash
librarium plan "state of WebGPU support" --group all
librarium run "state of WebGPU support" --group all
```

**Notes:** `all` mixes inline and background profiles, so it runs in `sync` mode. `async` accepts only durable profiles and rejects the inline members during preparation. For a narrower set, define a custom group.

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

Fallbacks consume declared reserve candidates in order. `--no-fallback` requires the exact primary matrix. Cancellation is not universal. Only `valyu/research` advertises exact-profile remote cancellation in this catalog. New runs freeze each exact profile's policy as `supported_exact_profile` or `reconcile_only`; the runtime requires the saved permission before invoking a cancellation method. No historical backfill is performed. Unsupported or failed cancellation preserves handles for reconciliation.

See [Requests, retries, and fallbacks](/docs/request-and-retry) for request deadlines, HTTP retry safety, acceptance-unknown submissions, fallback admission, and recovery steps.
