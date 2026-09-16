---
title: Requests, retries, and fallbacks
description: How Librarium validates research requests, retries HTTP calls, resumes durable work, and selects fallbacks.
order: 7
---

Librarium separates request planning, HTTP retries, durable-task reconciliation, and provider fallback. They solve different failures and do not grant one another permission to repeat work.

## Request lifecycle

CLI and MCP input passes through the same preparation path before provider work begins:

1. **Normalize the transport input.** CLI flags or MCP fields become one request shape.
2. **Migrate supported legacy input.** For example, legacy `mixed` request mode becomes `async` with a notice.
3. **Resolve selection.** Librarium expands an exact `provider_id/profile_id` target, a workflow, a capability request, or the configured default.
4. **Validate and admit.** The planner checks profile availability, credentials, execution mode, fallback compatibility, deadlines, concurrency, exclusions, and exact budget reservations.
5. **Freeze the plan.** The accepted request, profile bindings, limits, and fallback reserve become the execution authority for that run.
6. **Execute and persist.** Each result or durable handle is reconciled into `run.json`. CLI and MCP read the same state.

Preparation failures stop before provider dispatch. Issues include a phase, path, code, and message so callers can identify whether transport, migration, selection, validation, or compilation rejected the request.

`librarium plan` previews this preparation without executing providers or helpers. The printed receipt is not an executable frozen plan or proof of authentication. See [Commands](/docs/commands#preview-before-paying).

## Run-wide budgets

Refinement, research, synthesis, and verification share one paid-attempt wallet in CLI and MCP research. With either hard-budget flag, each paid attempt needs a bounded network-free estimate. Primary and fallback-reserve estimates must be known and the complete primary plan must fit before admission. An unknown helper estimate can skip or block that helper; unknown never means free.

`--max-estimated-cost` compares admission to committed estimates. `--max-cost` uses reported cost when known, retaining the estimate while actual cost is unknown, and stops new launches when the actual bound is reached. Known failure costs count too: failed/incomplete responses are not free. Known terminal usage survives failed, timed-out, or unpriced retrieval and cancellation responses. Late receipts fill previously unknown accounting without reopening the terminal outcome; repeated receipts do not add an already-recorded charge again.

A known first synthesis attempt is reserved before refinement or research spends that capacity. This is not a reservation for every retry or verification request. In-flight work can exceed either bound, and upstream unreported charges remain unknown: neither flag guarantees the final bill.

`paid-attempt-ledger.json` records paid stages, attempt identity/status, fingerprints, known/unknown estimates and reported costs, limits, reservations, and the original absolute deadline. `paid-attempt-ledger.required` marks runs that require the sidecar. Missing or invalid required state blocks recovery; deleting it does not reset the budget. Historical runs without a ledger remain readable without invented helper spending.

## Request and attempt limits

A run has one absolute `request_deadline_ms`. Each provider attempt also receives the shorter of the remaining request time and its profile-specific limit:

| Limit | Applies to |
| --- | --- |
| `inline_attempt_deadline_ms` | Inline provider calls |
| `background_attempt_deadline_ms` | Background submission, polling, and retrieval |
| `poll_interval_ms` | Delay between observations of background work |
| `max_concurrency` | Simultaneous admitted attempts |

An attempt deadline can permit a compatible fallback when the failed work is known not to remain active. The request deadline ends the whole local request and prohibits new fallback work. An accepted durable task may continue at the provider after the local deadline; Librarium retains its handle for later reconciliation instead of pretending that the remote task stopped.

## HTTP retry policy

The shared HTTP client has three policies:

| Policy | Allowed use |
| --- | --- |
| `never` | One request attempt. This is the default for POST, PUT, DELETE, and streaming requests. |
| `safe` | GET only. Retries transient transport failures, timeouts, HTTP 429, and HTTP 5xx responses. |
| `idempotent` | A mutating request with an explicit idempotency key and optional provider-specific header name. |

GET uses bounded safe retries by default: up to four total attempts, starting with a one-second jittered exponential delay and capped at 30 seconds. A valid `Retry-After` header takes precedence within the same cap. HTTP 4xx responses other than 429, oversized responses, and caller cancellation are not retried. Cancellation also interrupts a pending retry delay.

Provider adapters can choose a stricter policy. Streaming requests are always one attempt because a response may have started before the connection failed. A mutating request is never considered safe merely because its error was transient.

Library callers can set the policy explicitly:

```ts
import { httpRequest } from "librarium/core";

const response = await httpRequest("https://api.example.test/tasks", {
  method: "POST",
  body: { query: "example" },
  retry: {
    mode: "idempotent",
    idempotencyKey: "request-123:attempt-1",
    maxAttempts: 2,
  },
});
```

Use `idempotent` only when the upstream API guarantees that the key deduplicates submissions. Otherwise use `never`.

## Durable submissions are not HTTP retries

Background research often starts with a billable create request. If the connection fails after submission, the provider may have accepted the work even though Librarium did not receive the handle. Repeating that POST could create and charge for a second task.

Librarium records this state as acceptance unknown. It does not resubmit and does not launch a fallback while custody is unresolved. A provider-specific recovery path may attach a handle only when it can prove which remote task belongs to the frozen attempt. If the provider cannot provide that proof, the run remains bounded and requires operator reconciliation.

Once a durable handle is known, `status` resumes the existing attempt by polling and retrieving that handle. It does not submit the research request again:

```bash
librarium status --wait --retrieve
```

Transient polling failures remain attached to the accepted attempt and can be retried by a later reconciliation pass. Completed retrieval is committed once, so a later status call reads the terminal result.

Recovery restores prior spend, reservations, and the original deadline before admitting any fallback. It grants no fresh time window or budget and does not replay refinement, answer synthesis, or verification. Bounded GET-only reconciliation may still observe saved handles after a terminal deadline/cancellation without changing that terminal outcome or authorizing new paid launches. Completed committed evidence remains readable while other slots are pending.

When refinement is requested, Librarium saves `run.json` before the paid call. The refinement state is `not_started`, `in_progress`, `completed` (with saved per-slot queries), or `failed_or_interrupted`. Status shows this stage, and cannot launch research while refinement is incomplete. A crash can leave `in_progress` until the original deadline: the remote call may still finish and charge, so Librarium never automatically replays it. A recorded refinement failure can continue with the original query; cancellation and deadline expiry stop new research.

## Fallback is a new provider attempt

A fallback is not another HTTP attempt. It selects a different compatible profile from the request's frozen reserve after the primary attempt ends with `fallback_allowed: true`.

Fallbacks are claimed in deterministic rounds, respect concurrency and exact budget admission, and never reuse a profile already consumed by the run. They do not launch when submission acceptance is unknown, a durable task may still be active, cancellation was requested, or the request deadline has passed.

Use `--no-fallback` when you need the exact primary provider matrix:

```bash
librarium run "query" --providers exa/search,parallel/turbo --no-fallback
```

## Safe recovery

| Situation | Safe action |
| --- | --- |
| Provider GET returns 429 or 5xx | Let the bounded safe policy finish. Respect the final error if attempts are exhausted. |
| Mutating submission fails before acceptance is known | Do not rerun it manually. Preserve the run directory and reconcile with `status`. |
| Durable polling fails transiently | Run `status` again. The saved handle, not a new submission, is used. |
| A fallback is undesirable | Use `--no-fallback` before starting the run. |
| The request deadline expires | Inspect `run.json`. Do not assume accepted remote work was cancelled. |
| The user cancels a run | Preserve the run directory. Local cancellation does not guarantee provider-side cancellation. |

Run directories are custody records. Deleting one while work is pending removes Librarium's local handle and does not cancel the remote task.

Ctrl-C stops new paid launches and requests local cancellation. Only `valyu/research` advertises exact-profile remote cancellation in the catalog; unsupported or failed cancellation preserves handles for reconciliation. Accepted upstream work may continue and incur charges. There is no general CLI cancel command or MCP cancel tool. A completion that wins a cancellation race remains successful.
