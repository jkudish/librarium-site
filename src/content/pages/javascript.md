---
title: Research inside your JavaScript app.
description: Collect research from multiple sources with one typed client.
kind: product
runtime: javascript
ctaHref: /docs/library
ctaLabel: Explore the JavaScript API
---

*A meta harness for research queries*

Collect research from multiple sources with one typed client.

Requires Node.js 22.12+ for the Node client.

```bash
npm install librarium
librarium setup
```

```ts
await librarium.research(
  'Lisbon or Porto without a car?',
  { only: ['exa'], dryRun: true },
);
```

```ts
await librarium.research(
  'Lisbon or Porto without a car?',
  { only: ['exa'] },
);
```

## Create your client

The Node client loads configuration and saves Runs locally. Install the [CLI](/cli) for `librarium setup`, then [configure your sources](/docs/configuration).

```ts
import {
  createLibrarium,
} from 'librarium';

const librarium = createLibrarium();
```

## Keep answers with their citations

Each Run keeps the results from every source. [Read the Run contract](/docs/library) for validation, costs, and failures.

```ts
const run = await librarium.research(
  'Lisbon or Porto without a car?',
  { only: ['exa', 'kagi'] },
);

for (const result of run.results) {
  console.log(
    result.answer, result.citations,
  );
}
```

## Choose your runtime

Use `librarium/core` in Workers with explicit configuration, credentials, and a persistent store. [Custom sources and stores](/docs/custom-providers) covers the setup.

```ts
import {
  createLibrarium,
} from 'librarium/core';
```
