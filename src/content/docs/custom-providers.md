---
title: Custom sources and RunStores
description: Add trusted source variants or a four-method conditional RunStore.
order: 10
---

## Custom sources

Pass trusted instances to `createLibrarium({ customSources })`. Each entry has an `id`, optional `name`, and a quick and/or deep provider; `engine: true` makes it named-only. Built-in names are reserved. Instances belong to a client, not a global registry.

Inline providers implement `execute`; durable providers implement `submit`, `poll`, and `retrieve`. Deep variants must be durable. Return normalized content, citations, and provider-reported usage without inventing missing cost. Declare `requiresApiKey: false` only for a credential-free source.

Custom executable code is trusted, not sandboxed. It runs with process permissions. Review it before loading or granting credentials.

## Four-method RunStore

```ts
import type { RunStore, StoredRun, RunSummary } from 'librarium/core';
import { RunStoreConflict } from 'librarium/core';

class MyStore implements RunStore {
  async get(id: string): Promise<StoredRun | null> { return null; }
  async save(doc: StoredRun, expectedVersion: number | null): Promise<number> {
    // Replace with an atomic version-conditional commit.
    throw new RunStoreConflict();
  }
  async list(opts?: { limit?: number; before?: string }): Promise<RunSummary[]> {
    return [];
  }
  async delete(id: string): Promise<void> { /* idempotent */ }
}
```

This is an interface skeleton, not a working store. `save` must atomically require the current version to equal `expectedVersion`; `null` means absent. Return the new version or throw `RunStoreConflict`. Return independent snapshots, list newest first with Run-id cursor paging, and make delete idempotent.

```ts
import { runStoreContract } from 'librarium/testing';
await runStoreContract(new MyStore()); // implement first; disposable empty store only
```

Register a store with `createLibrarium({ store })`, or configure a Node module whose default export returns it. Librarium redacts evidence before `save`; stores still own atomicity and schema boundaries.

## Local filesystem

The shared unencrypted layout is public `run.json`, versioned private `state.json`, `answers/<source>.md`, and redacted `evidence/<source>.json`. Write state last. JS and PHP local stores coordinate through a non-expiring, token-owned `run.json.lock` marker. Do not remove one until its owner is known unable to resume.

This prevents concurrent writers, not partial writes after a crash. Private execution state is language-owned; shared reading is not permission to execute another language's task state. Preserve signing keys outside the store.
