---
title: Requests, queues, and recovery
description: Recover saved durable tasks without repeating paid submissions.
order: 7
---

Every real request stores a Run before provider dispatch. `run()` submits and waits; `queue()` stores the Run and dispatches one encrypted, one-attempt Laravel job. Dry runs neither store nor dispatch.

## Recover a snapshot

```php
$run = Librarium::find($id);
$current = $run?->refresh();
```

`refresh()` makes one observation of pending durable tasks and returns a new snapshot. It never starts queued sources, replays paid work, or cancels tasks. Temporary retrieval failures remain recoverable; permanent ones finish the affected result.

Private signed handles bind Run, provider, variant, driver, model, options, and credential identity. Tampering or changed bindings fail before retrieval. Preserve the app key and configuration needed by pending tasks. Other-language state remains opaque, not executable PHP state.

## Ambiguous submission

Lost POST responses and worker loss can occur after provider acceptance but before recovery details are saved. A local store cannot guarantee one submission in that window. Do not blindly retry a job or submit a new Run. Preserve existing state, inspect provider activity, and reconcile the existing attempt. See [costs and limits](/docs/php/costs-and-limits) for spending caveats.

Webhooks are verified wake hints; canonical retrieval remains evidence authority. No fallback or automatic paid resubmission is inferred from a transport failure.

## Deadlines and storage

The wait timeout defaults to 6900 seconds, the encrypted job timeout to 7200, with one attempt. Your app owns compatible worker supervision, retry_after, failed-job policy, and access controls. Inline work without a saved handle becomes interrupted after process loss; durable work remains recoverable. Local timeouts do not stop upstream work or billing.

Stores reject stale writers using the expected version. Local filesystem markers never expire by age; remove a crashed owner's marker only after establishing the owner cannot resume. Cache expiry can destroy the details needed to recover paid research. Prefer persistent shared storage where that loss is unacceptable.
