---
title: Research inside your JavaScript app.
description: One typed shape for results from many providers, with the sources attached. Runs in Node services and Workers.
kind: product
runtime: javascript
ctaHref: /docs/library
ctaLabel: Explore the JavaScript API
---

## Start with the job, not the integration

Research a technical decision, compare answer surfaces, or collect evidence for a feature. librarium gives those results a shared shape without pretending a search result, a grounded answer, and a research report are the same thing.

For a ready-made provider runtime, use the [CLI](/cli) or the [MCP server](/agents). To build your own execution flow, build on the package's explicit import boundaries. There is no one-call `research()` client hidden behind the examples below.

## Typed boundaries, without a Node dependency everywhere

```ts
// Schemas and terminal interchange. No provider calls on import.
import { ResearchResponseSchema } from 'librarium';

// Planning and execution primitives for injected dependencies.
import {
  buildProviderCatalog,
  prepareResearchExecution,
  runPreparedExecution,
} from 'librarium/core';

// Filesystem configuration and trusted custom-provider loading.
import { loadConfigV2, loadCustomProviders } from 'librarium/node';
```

The root and core boundaries are Worker-safe. Core callers supply adapter bindings, transport, persistence, and execution dependencies; core does not construct a global registry or initialize concrete providers. The Node boundary handles host-specific concerns, not a general high-level runner.

Install the v2 library in your project with `npm install librarium`. For the command-line tool, see [CLI installation](/docs#install).

## Plan a run before anything executes

Planning is local and network-free. Build a catalog from your provider configuration, then prepare an exact request. The prepared plan carries each selected profile's adapter binding and network-free estimate:

```ts
import { buildProviderCatalog, prepareResearchExecution } from 'librarium/core';

// Enable two built-in providers. Credentials come from a context you supply.
const catalog = buildProviderCatalog({
  providerConfigs: { exa: { enabled: true }, 'kagi-fastgpt': { enabled: true } },
  credentials: { env: process.env },
});

let next = 0;
const plan = prepareResearchExecution(
  {
    query: 'Lisbon or Porto for a long weekend without a car?',
    mode: 'sync',
    selector: {
      kind: 'targets',
      targets: [
        { provider_id: 'exa', profile_id: 'search' },
        { provider_id: 'kagi-fastgpt', profile_id: 'grounded' },
      ],
    },
    fallback: { kind: 'disabled' },
    limits: {
      max_concurrency: 2,
      request_deadline_ms: 120_000,
      inline_attempt_deadline_ms: 60_000,
      background_attempt_deadline_ms: 120_000,
      poll_interval_ms: 5_000,
    },
  },
  catalog,
  { clock: { now: () => Date.now() }, ids: { next: (scope) => `${scope}-${++next}` } },
);

if (!plan.ok) throw new Error(plan.issues.map((issue) => issue.message).join('\n'));

for (const profile of Object.values(plan.prepared.profile_plans_by_identity)) {
  console.log(profile.binding.adapter_id, profile.estimate);
}
// exa { estimated_cost_microusd: '17000', … }
// kagi-fastgpt { estimated_cost_microusd: '15000', billable_units: [ { unit: 'requests', quantity: '1' } ] }
```

Executing the plan is a separate step: `runPreparedExecution(plan.prepared, dependencies)` runs it with dependencies you inject, namely a coordination state store (`InMemoryCoordinationStateStore` is exported), coordinator dependencies, and an attempt-execution port that calls your adapters.

## Turn a terminal response into an application feature

Validate a response at your application boundary, then render each result with its own citations. Keep raw content out of HTML sinks.

```ts
import { ResearchResponseSchema } from 'librarium';

// `payload` is a terminal response from your application-owned transport.
const response = ResearchResponseSchema.parse(payload);

const evidence = response.results.map((result) => ({
  id: result.id,
  profile: result.profile,
  content: result.content,
  citations: result.citations,
  provenance: result.provenance,
}));

// Render content as text or sanitized Markdown; validate citation URLs.
// Handle response.errors and partial/failed status alongside successes.
```

A terminal response looks like this. The values are illustrative, not a captured run; the object passes `ResearchResponseSchema`:

```json
{
  "generator": "jkudish/librarium",
  "generator_version": "2.0.0",
  "request_id": "req_01J9Z6K3XW",
  "status": "succeeded",
  "completed_at": "2026-10-12T09:14:07Z",
  "results": [
    {
      "id": "res_kagi_1",
      "content_format": "markdown",
      "content": "Porto is walkable; Lisbon needs more transit…",
      "requested_profile": "grounded",
      "provider": "kagi-fastgpt",
      "profile": "grounded",
      "provenance": {
        "result_kind": "grounded_answer",
        "retrieval_methods": ["search_endpoint"],
        "corpora": ["web"],
        "observed_at": "2026-10-12T09:14:05Z"
      },
      "citations": [
        {
          "id": "cit_1",
          "derivation": "provider_reported",
          "source": {
            "kind": "web_page",
            "url": "https://www.visitportugal.com/en/content/porto",
            "title": "Porto | Visit Portugal"
          }
        }
      ],
      "completed_at": "2026-10-12T09:14:05Z",
      "usage": { "estimated_cost": "0.015", "currency": "USD" }
    }
  ],
  "errors": []
}
```

`status` is `succeeded`, `partial`, or `failed`, and must agree with `results` and `errors`. Costs are decimal strings with a currency; a missing cost is unknown, not zero. Citation URLs are untrusted identifiers.

Your app still owns authentication, tenant boundaries, persistence, retention, and the interface around the evidence. Shared terminal contracts make that boundary explicit; they do not make the JavaScript and PHP runtimes interchangeable.

## Preserve the distinctions that matter

- **Results, not just summaries.** Keep the content and citations from each successful provider.
- **Provenance, not a confidence vote.** Record the effective Profile, retrieval method, and surface or collector where available.
- **Explicit execution policy.** The core exposes planning and coordinator primitives; your integration supplies the operational dependencies. The complete CLI runtime supplies its own wallet and durable run storage.

For a concrete application-owned evidence model, read [Building answer visibility in Agentsy Report](/stories/agentsy-report). For your first executable workflow, follow [the multi-provider query guide](/guides/first-query).
