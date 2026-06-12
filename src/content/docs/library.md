---
title: Library usage
description: Use librarium/core as an embeddable library in Workers, edge runtimes, and Node.js.
order: 6
---

## librarium/core

Everything the CLI does with providers is importable. The `librarium/core` entry exposes the adapters, registry, dispatcher, normalizer, and types. It returns results in memory. Writing `run.json` and report files is a CLI concern; the core has no opinion about persistence.

The core entry has zero Node-only dependencies: no `node:fs`, no `process.env` access, fetch-based HTTP only. It is tested in workerd (Cloudflare's runtime) on every CI run.

```bash
npm install librarium
```

```ts
import { dispatch, initializeProviders, type Config } from 'librarium/core';

// Credentials are injected -- core never reads process.env itself.
// Pass an env map (Workers: pass your `env` binding) or a resolveCredential fn.
const credentials = { env: { GEMINI_API_KEY: '...', OPENROUTER_API_KEY: '...' } };

await initializeProviders({ credentials });

const config: Config = {
  version: 1,
  defaults: { outputDir: '', maxParallel: 4, timeout: 60, asyncTimeout: 600, asyncPollInterval: 5, mode: 'sync' },
  providers: {
    'gemini-grounded': { enabled: true },
    'openrouter-online': { enabled: true },
  },
  customProviders: {},
  trustedProviderIds: [],
  groups: {},
};

const { results, asyncTasks } = await dispatch({
  config,
  providerIds: ['gemini-grounded', 'openrouter-online'],
  query: 'What is the best wholesale produce supplier in London?',
  mode: 'sync',
  credentials,
});

for (const r of results) {
  // { provider, tier, status, text, sourceUrls, citations, durationMs,
  //   model, tokenUsage, usage, error, fallbackFor }
  console.log(r.provider, r.status, r.sourceUrls);
}
```

## dispatch() parameters

The `dispatch()` function accepts an optional `tierQueries` parameter that overrides the query sent to each tier. This is the same mechanism `run --refine` uses to dispatch tier-tuned variants from `librarium refine`:

```ts
const { results } = await dispatch({
  config,
  providerIds: ['gemini-grounded', 'openrouter-online', 'openai-deep'],
  query: 'How to scale postgres connections',
  mode: 'mixed',
  credentials,
  tierQueries: {
    'deep-research': 'Comprehensive analysis of PostgreSQL connection scaling strategies including pgBouncer, connection pooling architectures, and tuning recommendations for high-concurrency workloads',
    'ai-grounded': 'Best practices for scaling PostgreSQL connections in production',
    'raw-search': 'postgres connection pooling scaling pgbouncer',
  },
});
```

`tierQueries` is additive -- providers whose tier has no entry fall back to the root `query`.

## Result shape

Each result in the `results` array includes an optional `usage` field populated from whatever each provider's API actually reports. Usage is never estimated from pricing tables -- it contains only data the API itself returned:

```ts
{
  provider: 'gemini-grounded',
  tier: 'ai-grounded',
  status: 'success',
  text: '...',
  sourceUrls: [...],
  citations: [...],
  durationMs: 1840,
  model: 'gemini-2.5-flash',
  usage: {
    inputTokens: 312,
    outputTokens: 890,
    totalTokens: 1202,
    costUsd: 0.0012,      // only present when the API reported cost
    raw: { ... }          // raw provider usage object
  },
  error: undefined,
  fallbackFor: undefined,
}
```

The `usage` field is also written to each provider's `.meta.json` file and included in `run.json` when running via the CLI.

## Key notes

**Credential injection.** `CredentialContext` is `{ env?: Record<string, string | undefined>, resolveCredential?: (value: string) => string | undefined }`. `$ENV_VAR` references in provider config resolve against the injected `env`; literal keys pass through. In the CLI, this is backed by `process.env`. In a Worker, pass your env binding.

**Custom providers are CLI-only.** npm and script-based custom providers require Node (module resolution, child processes) and live behind the CLI boundary. The core registry contains the built-in adapters. You can add your own at runtime with `registerProvider()`.

**Async deep-research from the library.** `dispatch` with `mode: 'async'` or `'mixed'` returns `asyncTasks` handles. Polling and retrieval are the caller's responsibility. In the CLI, `librarium status` handles this.

**Bring your own persistence.** Core returns data. Where it goes (D1, R2, files, or nowhere) is up to you.
