---
title: Laravel configuration and storage
description: Sources, engine collectors, queues, and supported RunStore backends.
order: 3
---

```bash
php artisan vendor:publish --tag=librarium-config
```

The simplified config has `sources`, `engines`, `groups`, `max_cost`, `runs`, and `timeout`. Source options replace public profile entries. PHP 1.0 is unreleased; there is no old PHP config migration.

```php
// config/librarium.php
'sources' => ['parallel' => ['processor' => 'pro']],
'engines' => ['collector' => 'searchapi'],
'groups' => ['visibility' => ['chatgpt', 'gemini-app', 'copilot']],
'max_cost' => '1.00',
'runs' => [
    'store' => 'filesystem', 'disk' => 'local', 'path' => 'librarium',
    'encrypt' => true, 'keep_days' => null,
],
```

## Credentials

SDK sources read `ai.providers.<provider>.key`; focused HTTP sources read `services.<provider>.key`. Per-source `key` overrides belong in configuration, never request options. Use `env()` only inside Laravel config files. You.com reads `YOU_COM_API_KEY`, with `YDC_API_KEY` as a fallback. Collector credentials and location/language controls remain collector configuration.

Setting `enabled: false` excludes a source. A key alone is not authentication or spending authorization. Discovery and dry runs are offline.

## Supported stores

- **filesystem:** local Laravel disks only. Encryption defaults to the app key; disable only for a protected JS/PHP interchange folder. Both languages share a non-expiring, token-owned `run.json.lock` marker across complete reads/writes. Removing a crashed-owner marker requires establishing that the owner cannot resume. Locking prevents concurrent access, not crash-atomic multi-file writes.
- **database:** query-builder storage, one row per Run, optional `librarium_runs` table. Publish with `vendor:publish --tag=librarium-migrations`, review it, and obtain your application's database authorization before migrating. Nothing auto-runs; no Eloquent model is required.
- **cache:** process-local Laravel ArrayStore or standalone RedisStore on Redis 7+ with connection serialization/compression disabled. Redis uses a native conditional commit for version, document TTL, and listing membership. Set `cache_store` and `ttl` (604800 seconds by default). Expiry loses recovery material.
- **memory:** process-local tests, not shared workers.

Unsupported disks, cache drivers, decorated/failover caches, and Redis Cluster fail closed. Use a custom `RunStore` for those backends. ArrayStore cannot supply persistence across queue workers. Shared production alternatives are database, supported standalone Redis, or a custom conditional store.

All stores compare the expected version and reject stale writers. `state.json` is written last; an uncertain transport outcome is not permission to repeat provider work. Preserve app/signing keys outside storage. Key rotation can prevent old ciphertext or handles from being recovered.

## Queue and deadlines

Wait timeout defaults to 6900 seconds; encrypted job timeout to 7200, with one attempt. Your app owns workers, failed-job policy, queue connection, and the `research` queue. Set worker timeout at least the job timeout and queue `retry_after` above the worker timeout. Local timeouts do not stop provider billing.

## Pricing and redaction

Estimates come from `jkudish/laravel-ai-pricing`; synchronization is an explicit operation, not a dry-run side effect. `maxCost()` skips unpriced work and admits bounded sources in catalog order. In-flight calls can exceed a cap; unknown reported USD remains `null`.

Evidence is redacted before storage. Add application-private `redaction.paths` and `redaction.patterns` where needed. Source text can still be sensitive; control access and retention. There is no raw sensitive-capture API.
