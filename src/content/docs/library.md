---
title: Library usage
description: Use librarium/core as an embeddable library in Workers, edge runtimes, and Node.js.
order: 9
---

## Import boundaries

| Import | Public boundary |
| --- | --- |
| `librarium` | Side-effect-free, Worker-safe schemas, terminal interchange types, config migration and validation, workflow types, and `BUILTIN_PROVIDER_CATALOG` |
| `librarium/core` | Worker-safe catalog construction, planning, coordinator state, injected HTTP transport, execution ports, and `runPreparedExecution()` |
| `librarium/node` | Node config-file load and atomic save, trusted custom-provider loading, credential context, and canonical validation helpers |

Importing `librarium` does not inspect the host, read files, access credentials, initialize adapters, start the CLI, or install process handlers. `librarium/core` does not construct concrete provider adapters or a global registry. `librarium/node` does not promise a general high-level runner or portable persistence layer. The complete Node application is the `librarium` executable.

## Worker-safe planning

```ts
import {
  buildProviderCatalog,
  prepareResearchExecution,
  runPreparedExecution,
  type HttpClient,
} from 'librarium/core';
```

The core API expects dependencies and adapter bindings to be injected. It provides planning and execution primitives, not a one-call provider runner. Fetch-based `httpRequest()` and `httpStreamRequest()` are Worker-compatible and accept caller cancellation signals.

HTTP retry behavior is explicit. GET defaults to bounded safe retries. Mutating requests do not retry unless the caller supplies an idempotency key and policy. Streaming submissions are one attempt only because replay could duplicate paid work. Timeouts, aborts, and response-size limits remain active while a stream is consumed.

See [Requests, retries, and fallbacks](/docs/request-and-retry) for the complete policy, defaults, durable-submission boundary, and recovery behavior.

## Node services

```ts
import {
  loadConfigV2,
  loadCustomProviders,
  saveConfigV2,
} from 'librarium/node';
```

Use the Node boundary for filesystem and executable-code concerns. Callers own returned custom-provider instances and decide how to bind them into a client-scoped runtime.

## Shared TypeScript and PHP terminal boundary

`contracts/v1` is a terminal, language-neutral snapshot of exactly seven values: `ResearchResponse`, `ResearchResult`, `Citation`, `Source`, `ResultProvenance`, `Usage`, and `ResearchError`. It is generated from Zod and vendored from an exact Git snapshot with checksums.

It contains no request, attempt, lifecycle event, durable handle, coordinator state, config, persistence, manifest, JSONL, artifact schema, or custom-provider protocol. PHP `run()` and `queue()` and TypeScript runtime services are outside this boundary. Each terminal response carries `generator` and `generator_version`.
