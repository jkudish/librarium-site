---
title: Research primitives for your JavaScript stack.
description: Keep provider results, citations, and provenance in a typed format. Use the complete CLI today, or compose your own execution flow in Node and Workers.
kind: product
runtime: javascript
ctaHref: /docs/library
ctaLabel: Explore the JavaScript API
---

## Start with the job, not the integration

Research a technical decision, compare answer surfaces, or collect evidence for an application feature. Librarium gives those results a shared shape without pretending that a search result, a grounded answer, and a deep-research report are the same thing.

For a ready-made provider runtime, use the [CLI or MCP server](/cli-mcp). For an application-specific runtime, build on the package's explicit import boundaries. There is no one-call `research()` client hidden behind the examples below.

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

Install the v2 library in your project with `npm install librarium@^2`. For the command-line tool, see [CLI installation](/docs#install).

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

Your app still owns authentication, tenant boundaries, persistence, retention, and the interface around the evidence. Shared terminal contracts make that boundary explicit; they do not make the JavaScript and PHP runtimes interchangeable.

## Preserve the distinctions that matter

- **Results, not just summaries.** Keep the content and citations from each successful provider.
- **Provenance, not a confidence vote.** Record the effective Profile, retrieval method, and surface or collector where available.
- **Explicit execution policy.** The core exposes planning and coordinator primitives; your integration supplies the operational dependencies. The complete CLI runtime supplies its own wallet and durable run storage.

For a concrete application-owned evidence model, read [Building answer visibility in Agentsy Report](/stories/agentsy-report). For your first executable workflow, follow [the multi-provider query guide](/guides/first-query).
