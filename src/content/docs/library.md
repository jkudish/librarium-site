---
title: JavaScript library
description: Research and resume stored Runs in Node, Workers, and browsers.
order: 9
---

```ts
import { createLibrarium } from 'librarium';

const librarium = createLibrarium();
const plan = await librarium.research('Compare database providers', {
  only: ['exa'], dryRun: true,
});
// Can incur provider charges:
const started = await librarium.research('Compare database providers', {
  depth: 'deep', only: ['exa'], maxCost: '1.00', wait: false,
});
const later = await librarium.get(started.id, { wait: true });
librarium.sources();
if (later !== null) {
  const summary = await librarium.summarize(later);
}
```

`research` waits by default. With `wait: false`, durable work can be finished through `get`; quick inline work still depends on its process. `summarize` is a separate budgeted Run with `summary_of`, not a mutation of the source Run.

## Import boundaries

| Import | Responsibility |
| --- | --- |
| `librarium` | Node client with v3 config and filesystem storage |
| `librarium/node` | Same client plus filesystem store and config loading/saving |
| `librarium/core` | Runtime-neutral client; inject config/environment/store, memory by default |
| `librarium/testing` | Disposable-store `runStoreContract` |

The root is Node-oriented. Use `librarium/core` for Workers or browsers; it does not inspect process state or files on import. Preserve a persistent custom client's `handleKey` (32 random bytes) outside its store across restarts.

## Public Run

JSON uses snake_case, JS options camelCase. The Run records `spec`, `id`, `question`, `depth`, `status`, timestamps, `cost`, `results`, `skipped`, and `notices`. Run status is `planned`, `running`, `done`, `partial`, or `failed`; results have `queued`, `running`, `done`, or `failed`.

Each result keeps a flat `source`, `observation`, Markdown `answer`, citations, cost, and provider/variant/model/collector provenance. Errors are safe `{ code, message, retryable }` values. Reported money is an exact decimal USD string or `null`; estimates never replace missing reported charges.

The shared `librarium-spec` package owns schemas, source catalog, and semantic fixtures. It does not make private runtimes or task handles interchangeable. See [output and evidence](/docs/output-formats).
