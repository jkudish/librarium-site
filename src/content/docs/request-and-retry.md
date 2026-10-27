---
title: Requests and recovery
description: Save research progress and recover the same Run without duplicate submissions.
order: 7
---

## Before dispatch

Librarium validates the question and source options, expands saved groups, removes skipped names, chooses quick/deep variants, and applies the shared catalog-order budget rule. Selection errors fail before storage. Every real request then creates a stored Run before its first provider call; a dry run stores nothing.

```bash
librarium research "Compare database hosting" --deep --only exa,openai --max-cost 1 --dry-run --json
```

See [costs and limits](/docs/costs-and-limits) for selection under a budget and billing caveats.

## Resume in-progress research

```bash
librarium research "Compare database hosting" --deep --only exa --no-wait
librarium show <run-id> --wait
```

Signed provider task references live in private state. `show`, library `get`, and MCP `get_run` resume existing work rather than submitting another paid task. Keep the same Run ID and signing key.

A failed connection does not establish whether the provider accepted a submission. Do not create a second Run merely to retry an uncertain task. Preserve the Run, inspect provider state, and reconcile the existing attempt. Storage transport failure can also leave a commit outcome uncertain.

## Interruptions and deadlines

Ctrl-C detaches the CLI and prints a `show` command. Inline work can be interrupted; durable upstream work may continue and bill. A local deadline or worker termination is not remote cancellation or a refund. Preserve pending handles instead of deleting their store.

Resume retains saved execution and accounting; it is not a fresh spending or time authorization. Polling/retrieval and HTTP retry are distinct from a new task submission. Never replay a mutating request solely because its transport error looks transient.

## Filesystem recovery

Local readers and writers share the token-owned `run.json.lock` marker. It never expires by age. Only remove a crashed owner's marker after establishing that the owner cannot resume. State is written last; concurrent-write protection does not make a multi-file commit crash-atomic.
