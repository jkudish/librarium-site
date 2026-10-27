---
title: Laravel configuration and storage
description: Sources, AI answer-engine retrieval, queues, and supported RunStore backends.
order: 3
---

```bash
php artisan vendor:publish --tag=librarium-config
```

The config has `sources`, `engines`, `groups`, `max_cost`, `runs`, and `timeout`. Configure source behavior through source options.

```php
// config/librarium.php
'sources' => ['parallel' => ['processor' => 'pro']],
'engines' => ['collector' => 'searchapi'],
'groups' => [
    'visibility' => ['chatgpt', 'gemini-app', 'copilot'],
],
'max_cost' => '1.00',
'runs' => [
    'store' => 'filesystem',
    'disk' => 'local', 'path' => 'librarium',
    'encrypt' => true, 'keep_days' => null,
],
```

## Credentials

SDK sources read `ai.providers.<provider>.key`; focused HTTP sources read `services.<provider>.key`. Per-source `key` overrides belong in configuration, never request options. Use `env()` only inside Laravel config files. You.com reads `YOU_COM_API_KEY`, with `YDC_API_KEY` as a fallback. Configure retrieval-service credentials and location/language controls separately.

Setting `enabled: false` excludes a source. A key alone is not authentication. Discovery and dry runs are offline.

## Supported stores

### Filesystem

Local Laravel disks only; encryption defaults to the app key and should be disabled only for a protected JS/PHP interchange folder. Both languages share a non-expiring, token-owned `run.json.lock` marker across complete reads/writes.

Remove a crashed-owner marker only after establishing that the owner cannot resume. Locking prevents concurrent access, not crash-atomic multi-file writes.

### Database

Query-builder storage uses one row per Run in an optional `librarium_runs` table. Publish with `vendor:publish --tag=librarium-migrations`, review it, and obtain your application's database authorization before migrating; nothing auto-runs and no Eloquent model is required.

### Cache

Use process-local Laravel ArrayStore or standalone RedisStore on Redis 7+ with connection serialization/compression disabled. Redis uses a native conditional commit for version, document TTL, and listing membership.

Set `cache_store` and `ttl` (604800 seconds by default). Expiry loses recovery material.

### Memory

Process-local tests, not shared workers.

### Unsupported backends and shared workers

Unsupported disks, cache drivers, decorated/failover caches, and Redis Cluster are rejected before research starts. Use a custom `RunStore` for those backends. ArrayStore cannot supply persistence across queue workers. Shared production alternatives are database, supported standalone Redis, or a custom conditional store.

### Versioning and keys

All stores compare the expected version and reject stale writers; `state.json` is written last. An uncertain transport outcome is not permission to repeat provider work.

Preserve app/signing keys outside storage. Key rotation can prevent old ciphertext or handles from being recovered.

## Queue and deadlines

Wait timeout defaults to 6900 seconds; encrypted job timeout to 7200, with one attempt. Your app owns workers, failed-job policy, queue connection, and the `research` queue. Set worker timeout at least the job timeout and queue `retry_after` above the worker timeout. Local timeouts do not stop provider billing.

## Pricing and redaction

See [costs and limits](/docs/php/costs-and-limits) for estimates, pricing synchronization, and billing caveats.

Evidence is redacted before storage. Add application-private `redaction.paths` and `redaction.patterns` where needed. Source text can still be sensitive; control access and retention.
