---
title: Research inside your JavaScript app.
description: One typed client for research, stored Runs, recovery, answers, and citations. Use it in Node or Workers.
kind: product
runtime: javascript
ctaHref: /docs/library
ctaLabel: Explore the JavaScript API
---

*A meta harness for research queries*

Query search engines, AI answer engines, and deep-research APIs from one interface, and keep every answer with its citations.

## One client, three boundaries

Install with `npm install librarium`.

The npm package is v2, its configuration is version 3, and its public Run format is `librarium.run/1`. These version numbers describe different contracts. The Node client requires Node.js 22.12+.

`librarium` and `librarium/node` construct a ready-to-use client with v3 config and filesystem storage. `librarium/core` is runtime-neutral: callers inject configuration, credentials, and a store; its default is process-local memory. Importing core never inspects process state or files.

For Node source configuration, install the [CLI](/cli) too and run `librarium setup`. The shared first workflow is:

```ts
import { createLibrarium } from 'librarium';
const librarium = createLibrarium();
await librarium.research('Lisbon or Porto without a car?', { only: ['exa'], dryRun: true });
await librarium.research('Lisbon or Porto without a car?', { only: ['exa'] });
```

## Preview, then research

```ts
import { createLibrarium } from 'librarium';

const librarium = createLibrarium();
const plan = await librarium.research('Lisbon or Porto without a car?', {
  only: ['exa', 'kagi'], maxCost: '0.10', dryRun: true,
});
console.log(plan.status, plan.results.map((result) => result.source));
const run = await librarium.research('Lisbon or Porto without a car?', {
  only: ['exa', 'kagi'], maxCost: '0.10',
});
```

Dry runs are offline and not stored. Real Runs are stored before starting. Quick is the default; choose `depth: 'deep'` for reports and `wait: false` to return before completion. `get(id, { wait: true })` picks up saved research instead of submitting again. See [costs and limits](/docs/costs-and-limits) for estimates and billing caveats.

## Read the shared Run

```ts
import { RunSchema } from 'librarium';

// payload comes from your application-owned transport.
const run = RunSchema.parse(payload);
const evidence = run.results.map((result) => ({
  source: result.source,
  observation: result.observation,
  answer: result.answer,
  citations: result.citations,
  provenance: result.provenance,
  error: result.error,
}));
// Render as text or sanitized Markdown; validate citation URLs.
```

This illustrative empty plan passes `RunSchema`; it is not a captured provider response:

```json
{
  "spec": "librarium.run/1",
  "id": "run_01JAB2C3D4E5F6G7H8J9K0M1N2",
  "question": "Lisbon or Porto without a car?",
  "depth": "quick",
  "status": "planned",
  "created_at": "2026-10-13T00:00:00Z",
  "finished_at": null,
  "cost": { "estimated": "0", "reported": null, "complete": false, "max": "0.10" },
  "results": [],
  "skipped": [],
  "notices": []
}
```

Statuses are `planned`, `running`, `done`, `partial`, or `failed`. Costs are exact USD decimal strings or `null`. Keep failures and skips visible. Source answers are `observation: api`; collected engines are `surface`. Provenance describes collection, not truth or independent corroboration.

## Workers and custom stores

```ts
import { createLibrarium, MemoryRunStore } from 'librarium/core';

const client = createLibrarium({
  config: { version: 3, sources: {}, engines: {}, groups: {}, max_cost: null,
    runs: { store: 'memory', path: './runs', keep_days: null } },
  env: {}, store: new MemoryRunStore(),
});
client.sources();
```

A production Worker needs a persistent custom `RunStore` that rejects stale writes, rather than process-local memory. `librarium/testing` exports `runStoreContract` for disposable store checks. Your application owns tenant access, persistent keys for recovery, retention, and the UI. JS and Laravel share the public Run format while executing in their own runtimes.

## Preserve the distinctions that matter

Research a technical decision, compare AI answer engines, or collect evidence for a feature. Keep search results, grounded answers, and research reports distinct inside the shared Run format.

Keep content and citations from each successful source. Record the source, variant, model, and retrieval service; answers retrieved through the same service are not independent confirmation. Your application owns tenant access, persistent keys for recovery, retention, and the interface.

See [the library reference](/docs/library), [custom sources and stores](/docs/custom-providers), and [application-owned visibility evidence](/stories/agentsy-report).
