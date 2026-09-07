---
title: Requests, queues, and retries
description: Operate shared deadlines and provider submissions safely.
order: 7
---

Librarium compiles one request-wide plan before execution. `run()` executes it
in the current process. `queue()` dispatches the same plan in one encrypted
Laravel job and returns its request ID immediately.

## Shared deadline

The configured `librarium.timeout` is 6,900 seconds by default. Override it for
one request with `timeout(600)` or `--timeout=600`. The runtime calculates one
deadline at start; every sequential Profile, fallback, HTTP timeout, poll, and
sleep consumes that same budget.

Provider Drivers stop before starting work that cannot fit in the remaining
time and reject terminal responses that arrive after the deadline. A group does
not receive a fresh timeout for every Profile.

The queue job timeout defaults to 7,200 seconds and is compiled separately to
allow Laravel to terminate a worker after the research deadline. Keep worker
and connection timeouts compatible with both values.

## Queue behavior

The job implements `ShouldQueue` and `ShouldBeEncrypted`, uses the configured
connection and `research` queue, sets `failOnTimeout`, and has `tries = 1`.
There is no automatic Laravel job retry. The application owns queue workers,
failed-job policy, alerting, and terminal response persistence.

`Librarium::status($requestId)` reports transient `queued`, `running`, and
terminal progress through the configured cache-backed status store. Its default
TTL is 10,800 seconds. Status is operational coordination, not durable history.

## Provider retry safety

Do not blindly rerun a failed queued job. A timeout or worker loss may occur
after a paid provider accepted work but before Librarium recorded a terminal
result. First inspect application logs, transient status, provider dashboards,
and any stored receipt.

Inline HTTP Drivers may retry only bounded transient failures according to
their concrete implementation and remaining deadline. Authentication,
authorization, validation, and malformed terminal data are not safe generic
retry candidates.

Background provider submissions are particularly sensitive. Provider handles,
polling, retrieval, webhook correlation, and idempotency remain private inside
the Driver. Drivers must not retry an ambiguous mutating submission unless the
provider supports a stable idempotency key for the same logical attempt. Some
current Drivers deliberately send an ambiguous submission only once.

Webhooks are wake-up signals, not terminal-content authority. A Driver verifies
and correlates a signal, then retrieves canonical terminal content from the
provider. Provider handles are not exposed as public resumable state.

## Recovery checklist

1. Determine whether the request is still active at the provider.
2. Reconcile possible spend; unknown cost is not zero.
3. Persist any recovered terminal result in application storage.
4. Dispatch a new Librarium request only when duplicate work and spend are
   acceptable, with a new preview and cost/deadline controls.

For command exit behavior see [Artisan commands](/docs/php/commands). For queue
callbacks and response persistence see [Library API](/docs/php/library).
